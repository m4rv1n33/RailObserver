# Production readiness

What still has to happen before RailObserver runs on the homelab as a real
service rather than a development checkout. Security topics have their own
document, [SECURITY.md](SECURITY.md); this one covers packaging, deployment,
data safety and operations.

The application code itself is in good shape. Almost everything below is about
the layer around it. Images, a production compose file, the proxy, the build
pipeline and a nightly dump now exist. What is left on the backup is the half
that makes it a backup: restoring one, and getting a copy off the machine.

## Where things stand

| Area | State |
| --- | --- |
| Backend build | Maven, Java 21, Spring Boot 3.5.0 |
| Schema management | Flyway, `ddl-auto: validate`, 14 migrations |
| Configuration | Environment variables, optional `backend/.env` via `DotenvEnvironmentPostProcessor` |
| Authentication | Shared PIN, HMAC session cookie, works, see SECURITY.md |
| Frontend build | Vite, static `dist/`, PWA with precaching |
| Containers | `docker-compose.yml` for development, `docker-compose.prod.yml` for the homelab |
| Images | `backend/Dockerfile` and `frontend/Dockerfile`, pushed to GHCR |
| CI | `.github/workflows/build.yml` builds and pushes both images on every push to main. No test workflow yet |
| Backups | Nightly `pg_dump` to a host bind mount, 30 day window. Never restored, and no copy off the machine |
| Health checks | None. Actuator is not on the classpath |
| Tests | 8 test classes, backend only, no frontend tests |

## Blockers

These are the items that make the difference between "runs on my laptop" and
"runs unattended on a box I trust with my data".

### 1. Backup - half done

The sighting log is irreplaceable: it cannot be re-derived from any external
source, unlike the fleet rosters and the transport API data. A disk failure or
a bad `docker compose down -v` loses all of it permanently.

`docker-compose.prod.yml` now runs a `backup` service: a nightly `pg_dump`
piped through gzip into `./backups`, with dumps older than 30 days deleted.
`./backups` is a bind mount to a host directory rather than a named volume,
which is the point of it: `down -v` removes named volumes, and a backup that
dies alongside the thing it backs up is not one.

Two things are still missing, and they are the two that decide whether this
counts:

- **No copy leaves the machine.** A host that dies takes the database and its
  backups with it. Copy the directory somewhere else on a schedule.
- **No restore has been tried.** A backup you have never restored is not a
  backup. Verify once by restoring a dump into a scratch database and pointing
  a local backend at it.

One known weakness in the dump itself. The entrypoint is
`pg_dump ... | gzip > file`, and a shell pipeline reports the exit status of
its last command, so a `pg_dump` that fails still leaves a valid, empty,
correctly named `.gz` behind. That is worse than an obvious absence, because
the directory looks healthy. Either add `set -o pipefail` to the entrypoint or
check the dump size before trusting the window.

### 2. Images - done

Both halves have a Dockerfile. The backend as a layered Spring Boot image:

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
is `SameSite=Lax`, so a split-origin deployment silently breaks login. Caddy
handles both from one origin; `frontend/Caddyfile` proxies `/api/*` to the
backend and serves everything else from `dist/`.

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

### 3. The compose file is development-shaped - done

`docker-compose.yml` still publishes Postgres on `5432` and uses `railobserver`
as both user and password, which is what makes it convenient locally. It is no
longer the file the homelab runs. `docker-compose.prod.yml` sits beside it and

- drops the `ports:` mapping on Postgres so only the compose network reaches it,
- reads every credential from the environment (see `.env.example`),
- sets `restart: unless-stopped` on each service,
- adds a `pg_isready` healthcheck to Postgres, which the backend waits on,
- publishes the frontend on `127.0.0.1` only, so the tunnel is the only way in,
- selects the image tag with `TAG`, defaulting to `latest`.

One item from that list is not done: there is **no healthcheck on the backend**,
because Actuator is not on the classpath and there is nothing to poll. See
"Add a health endpoint" below.

Both environments run from this one file on the same host, separated by the
compose project name and which `.env` is passed:

```
docker compose -p railobserver-prod --env-file prod/.env -f docker-compose.prod.yml up -d
```

Give each environment its own `WEB_PORT` and its own
`RAILOBSERVER_AUTH_SECRET`, and set `SERVER_NAME` and `ENVIRONMENT` in both, or
the running app cannot tell you which of the two you have open.

### 4. Nothing terminates TLS - done at the tunnel, not in the repository

`railobserver.auth.cookie-secure` defaults to `true`, which means the browser
refuses to store the session cookie over plain HTTP. Reaching the app at
`http://homelab:8080` therefore produces a login that appears to succeed and
then immediately bounces back to the lock screen.

TLS is terminated by the Cloudflare Tunnel on the host, not by Caddy, so
`frontend/Caddyfile` listens on plain `:8080` and requests no certificate. That
is why `docker-compose.prod.yml` publishes the frontend on `127.0.0.1` only:
the plain-HTTP port must not be reachable from the LAN, and the tunnel is the
single way in. The certificate, the hostname and the Let's Encrypt handling are
all Cloudflare's side and live in no file here.

Caddy still does the part that matters to the cookie, which is keeping the API
and the app on one origin:

```
:8080 {
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

Two things follow from the tunnel being in front. The forwarded-header
configuration in SECURITY.md trusts only the Docker-internal range, which is
the Caddy container, so the client address the lockout counts is the one Caddy
was told by the tunnel. And the response headers split in two: the Caddyfile
now sets the ones this container can meaningfully assert about its own
responses, while `Strict-Transport-Security` and the CSP belong at the
Cloudflare edge, since this container only ever speaks plain HTTP and an HSTS
header asserted over it says nothing.

Do not set `RAILOBSERVER_AUTH_COOKIE_SECURE=false` as a workaround. That sends
the session cookie in the clear on every request.

### 5. Outbound HTTP calls have no timeout - done

`OpendataChProvider` and `OtdFormationProvider` build their `RestClient` from
the injected builder, which had no timeouts configured, so a hung upstream tied
up a Tomcat worker thread until the connection died on its own. Two slow
endpoints, `transport.opendata.ch` and `api.opentransportdata.swiss`, are
reachable from user-facing requests: station autocomplete fires on nearly every
keystroke.

Fixed globally in `application.yml`:

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

1. Verify last night's dump landed in `./backups` and is not zero-length.
2. Push to `main` and let the build workflow publish both images, or pick an
   existing `sha-<commit>` tag. Then `docker compose ... pull`.
3. `docker compose ... up -d postgres` and wait for the healthcheck to pass.
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
