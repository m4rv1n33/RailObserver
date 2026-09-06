# Production readiness

What still has to happen before RailObserver runs on the homelab as a real
service rather than a development checkout. Security topics have their own
document, [SECURITY.md](SECURITY.md); this one covers packaging, deployment,
data safety and operations.

The application code itself is in good shape. Almost everything below is about
the layer around it, which currently does not exist: there is no container
image, no production compose file, no reverse proxy, no backup and no CI.

## Where things stand

| Area | State |
| --- | --- |
| Backend build | Maven, Java 21, Spring Boot 3.5.0 |
| Schema management | Flyway, `ddl-auto: validate`, 14 migrations |
| Configuration | Environment variables, optional `backend/.env` via `DotenvEnvironmentPostProcessor` |
| Authentication | Shared PIN, HMAC session cookie, works, see SECURITY.md |
| Frontend build | Vite, static `dist/`, PWA with precaching |
| Containers | Postgres only, and the compose file is development-shaped |
| Images | None. No Dockerfile anywhere in the repository |
| CI | None. `.github/` holds only a modernize helper |
| Backups | None |
| Health checks | None. Actuator is not on the classpath |
| Tests | 8 test classes, backend only, no frontend tests |

## Blockers

These are the items that make the difference between "runs on my laptop" and
"runs unattended on a box I trust with my data".

### 1. There is no backup

This is the highest-priority item on the page. The sighting log is
irreplaceable: it cannot be re-derived from any external source, unlike the
fleet rosters and the transport API data. A disk failure or a bad `docker
compose down -v` loses all of it permanently.

Minimum viable setup is a nightly `pg_dump` to a directory outside the Docker
volume, kept for a rolling window, with at least one copy off the machine.

```yaml
  backup:
    image: postgres:16-alpine
    depends_on: [postgres]
    environment:
      PGPASSWORD: ${DB_PASSWORD}
    volumes:
      - ./backups:/backups
    entrypoint: >
      sh -c 'while true; do
        pg_dump -h postgres -U railobserver railobserver
          | gzip > /backups/railobserver-$$(date +%%Y%%m%%d-%%H%%M).sql.gz;
        find /backups -name "railobserver-*.sql.gz" -mtime +30 -delete;
        sleep 86400;
      done'
```

A backup you have never restored is not a backup. Verify once by restoring a
dump into a scratch database and pointing a local backend at it.

### 2. There are no images to deploy

Both halves need a Dockerfile. The backend as a layered Spring Boot image:

```dockerfile
# backend/Dockerfile
FROM eclipse-temurin:21-jdk AS build
WORKDIR /build
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN ./mvnw -B dependency:go-offline
COPY src/ src/
RUN ./mvnw -B clean package -DskipTests

FROM eclipse-temurin:21-jre AS runtime
WORKDIR /app
RUN useradd --system --uid 1001 railobserver
COPY --from=build /build/target/*.jar app.jar
USER railobserver
EXPOSE 8080
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-jar", "app.jar"]
```

The frontend builds to static files, so the runtime stage is just a web server.
Serving it from the same origin as the API is not optional: the session cookie
is `SameSite=Lax`, so a split-origin deployment silently breaks login.

```dockerfile
# frontend/Dockerfile
FROM node:22-alpine AS build
WORKDIR /build
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM caddy:2-alpine AS runtime
COPY --from=build /build/dist /srv
COPY Caddyfile /etc/caddy/Caddyfile
```

### 3. The compose file is development-shaped

`docker-compose.yml` today publishes Postgres on `5432` to the host and uses
`railobserver` as both user and password, committed to the repository. For the
homelab, split it: keep the current file for local work, and add a
`docker-compose.prod.yml` that

- drops the `ports:` mapping on Postgres so only the compose network reaches it,
- reads every credential from the environment rather than literals,
- sets `restart: unless-stopped` on each service,
- adds a `healthcheck` to Postgres and to the backend,
- pins image tags by digest or at least by patch version.

### 4. Nothing terminates TLS

`railobserver.auth.cookie-secure` defaults to `true`, which means the browser
refuses to store the session cookie over plain HTTP. Reaching the app at
`http://homelab:8080` therefore produces a login that appears to succeed and
then immediately bounces back to the lock screen.

Put Caddy or Traefik in front, terminate TLS there, and proxy `/api` to the
backend and everything else to the static files. Caddy gets a certificate from
Let's Encrypt automatically for a real hostname, or you can use its internal CA
for a LAN-only name.

```
railobserver.example.ch {
    handle /api/* {
        reverse_proxy backend:8080
    }
    handle {
        root * /srv
        try_files {path} /index.html
        file_server
    }
}
```

Do not set `RAILOBSERVER_AUTH_COOKIE_SECURE=false` as a workaround. That sends
the session cookie in the clear on every request.

### 5. Outbound HTTP calls have no timeout

`OpendataChProvider` and `OtdFormationProvider` build their `RestClient` from
the injected builder without configuring timeouts, so a hung upstream ties up a
Tomcat worker thread until the connection dies on its own. Two slow endpoints,
`transport.opendata.ch` and `api.opentransportdata.swiss`, are reachable from
user-facing requests: station autocomplete fires on nearly every keystroke.

Fix it globally in `application.yml`:

```yaml
spring:
  http:
    client:
      connect-timeout: 3s
      read-timeout: 8s
```

Both providers already catch `RestClientException` and degrade gracefully, so a
timeout surfaces as an empty result rather than an error page.

### 6. `GET /api/sightings` is unbounded

`SightingController.getAll()` maps every row through
`findAllByOrderByObservedAtDesc()` with no limit, and `SightingsPage` renders
all of them. That is fine at a few hundred sightings and unpleasant at ten
thousand, which is a realistic number for a logbook kept over years. It also
inflates the payload on a phone connection.

Add pagination or at least a bounded default with a date filter. The index
`idx_sighting_observed_at` is already in place, so the query side is ready.

## Should also happen

- **Upgrade Spring Boot.** The build is pinned to 3.5.0 and 3.5.16 is the
  current patch, so it is sixteen patch releases behind, which includes
  dependency security fixes. Move to the latest 3.5.x and keep it there. Do not
  jump to 4.x as part of the production move.
- **Add a health endpoint.** Without `spring-boot-starter-actuator` there is
  nothing for a container healthcheck or an uptime monitor to poll. Note that
  `SessionAuthFilter` only covers `/api/*`, so actuator lands outside the auth
  boundary. Bind it to a separate management port that is not proxied, or
  restrict it to `health` with `show-details: never`.
- **Add a catch-all exception handler.** `GlobalExceptionHandler` covers
  not-found, duplicate, validation and the two auth exceptions. Anything else
  falls through to Spring's default error handling, which is a different
  response shape than the `ErrorResponse` the frontend expects. Add an
  `@ExceptionHandler(Exception.class)` that logs the cause and returns a
  generic 500, and set `server.error.include-stacktrace: never` and
  `include-message: never` explicitly rather than relying on defaults.
- **Set up CI.** A GitHub Actions workflow running `./mvnw verify` and
  `npm ci && npm run lint && npm run build` on push would have caught the two
  lint errors that sat in `main` until now. This is cheap and pays for itself.
- **Configure logging.** Default Spring Boot logging goes to stdout with no
  rotation. Under Docker, cap it in the compose file, otherwise a long-running
  container fills the disk with JSON log files.

```yaml
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"
```

- **Pin a timezone.** The containers default to UTC. `observedAt` is stored as
  an `Instant` and formatted client-side, so the app is correct either way, but
  server log timestamps are much easier to correlate with a sighting if the
  container runs on `Europe/Zurich`. Set `TZ` in the compose environment.
- **Decide what happens to `/secret/formations`.** It is reachable by anyone who
  taps the title five times and by anyone who types the URL. That is fine, it
  only renders hand-built sample data, but it is worth knowing it is not a
  protected route.
- **Add frontend tests.** There are none. The backend has 8 test classes
  covering auth, fleet and formation logic. A couple of tests around
  `useVehicleNumbers` and the fleet recognition path in the UI would cover the
  parts most likely to break silently.

## Deployment sequence

Once the pieces above exist, a deploy looks like this. Flyway runs migrations on
startup, so ordering matters.

1. Take a backup of the current database, or verify last night's ran.
2. Build and tag both images.
3. `docker compose -f docker-compose.prod.yml up -d postgres` and wait for the
   healthcheck to pass.
4. Bring up the backend. Flyway applies any pending migrations here. Watch the
   log for the migration summary before continuing.
5. Bring up the frontend and the proxy.
6. Confirm `GET /api/auth/session` returns 401 from outside, and that the lock
   screen accepts the PIN.

Migrations in this project are forward-only and several of them seed data
(`V3`, `V7`, `V8`, `V13`). There is no down-migration path, so a bad migration
is recovered by restoring a backup, which is another reason step 1 is not
optional.

## Deliberately out of scope

Worth writing down so they do not get re-litigated later:

- No multi-user support, no accounts, no roles. The whole auth model is one
  shared PIN and that is the intended design.
- Login attempt counters live in memory and reset on restart. Acceptable for a
  single-user instance.
- Sessions last a year and cannot be revoked individually. Rotating
  `RAILOBSERVER_AUTH_SECRET` invalidates all of them at once, which is the only
  revocation mechanism and is enough for one person with a handful of devices.
