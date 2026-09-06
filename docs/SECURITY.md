# Security

The security model of RailObserver, what is implemented today, and what needs
attention before the app is reachable from outside the LAN. Deployment and
operational concerns are in [PRODUCTION.md](PRODUCTION.md).

## Threat model

One user, one instance, one shared secret. There are no accounts, no roles and
no sharing features, so there is no such thing as another user's data to
protect. That removes an entire class of problems: no authorisation logic, no
tenant isolation, no privilege escalation.

What is actually being defended:

- **The data.** A personal sighting log built up over years, including
  timestamps and GPS coordinates. It is a movement history of the person who
  recorded it, which makes it more sensitive than the subject matter suggests.
- **Write access.** Anyone who gets in can delete sightings, and there is no
  undo and no audit trail.
- **The host.** The app is one service on a homelab, and a compromise there is a
  foothold on the network.

The realistic attacker is an untargeted internet scanner that finds an exposed
port, not someone who cares about Swiss rolling stock. That shapes the
priorities below: the goal is to not be the easy target.

## What is implemented

The auth layer is hand-rolled rather than Spring Security, and it is
deliberately small. Reading it end to end takes a few minutes, which is a real
advantage over a framework nobody on the project knows well.

**Session cookie.** `SessionTokenService` issues stateless tokens shaped
`<expiryEpochSeconds>.<nonce>.<hmac>`, signed with HMAC-SHA256 over the payload
using `railobserver.auth.secret`. Nothing is stored server side. Validation
compares signatures with `MessageDigest.isEqual`, which is constant-time, and
then checks expiry. A tampered expiry fails the signature check, so the token
cannot be extended by editing it.

**Cookie flags.** `AuthService.cookie()` sets `HttpOnly`, `Secure` (configurable
via `RAILOBSERVER_AUTH_COOKIE_SECURE`, default true), `SameSite=Lax` and
`Path=/`. `HttpOnly` keeps the token away from any XSS that does get through,
and `SameSite=Lax` is what makes separate CSRF tokens unnecessary, since the
cookie is not attached to cross-site requests.

**Filter placement.** `SessionAuthFilter` is registered for `/api/*` at
`Ordered.HIGHEST_PRECEDENCE` and rejects every request without a valid cookie
with a 401 JSON body. It skips only `/api/auth/*`, so the login and session
probe endpoints stay reachable. Default-deny by path prefix rather than an
allowlist per controller, which is the right way round: a new controller under
`/api` is protected the moment it is written.

**Fail-fast configuration.** `AuthConfig` throws at startup if the `prod`
profile is active without a PIN, and refuses any secret shorter than 32
characters. This is a good guard and it means an unprotected production instance
cannot happen by forgetting a variable.

**Brute force throttling.** `LoginAttemptService` locks a client out for 15
minutes after 5 failed attempts, tracked in a `ConcurrentHashMap` with pruning
at 1000 entries. `TooManyAttemptsException` returns 429 with `Retry-After`.

**PIN comparison.** `AuthService.matches()` uses `MessageDigest.isEqual` rather
than `String.equals`, avoiding a timing side channel on the comparison itself.

**Secrets handling.** `.env` and `.env.local` are gitignored, `.env.example`
documents every variable with generation instructions, and real environment
variables take precedence over the dotenv file, so a deployment that injects
configuration directly is unaffected.

## Findings

Ordered by how much they matter for the homelab move.

### High: `X-Forwarded-For` is trusted unconditionally

`AuthController.clientOf()` takes the first entry of `X-Forwarded-For` when the
header is present, with no check on who sent it. Because that value is the key
for the lockout map, an attacker supplies a fresh header value on every request
and never gets throttled. The brute force protection becomes decorative exactly
when it is needed, which is when the app is reachable from the internet.

Right now nothing sets that header because there is no proxy, so this is latent.
It becomes live the moment a reverse proxy is added, which is item 4 of the
production blockers.

Fix in two parts. Let Spring parse the header only from a trusted proxy:

```yaml
server:
  forward-headers-strategy: native
  tomcat:
    remoteip:
      internal-proxies: 172\.1[6-9]\..*|172\.2[0-9]\..*|172\.3[01]\..*
```

Then drop the manual header parsing from `clientOf()` and use
`request.getRemoteAddr()`, which Tomcat will have rewritten to the real client
address for requests that came through the trusted proxy, and left alone for
anything that did not.

### High: default database credentials, committed

`docker-compose.yml` hardcodes `railobserver` as database name, user and
password. Fine for local development, not fine on a host that runs other things.
Combined with the published `5432` port, anything else on the LAN can connect to
the database directly and bypass the application and its auth entirely.

Both halves need fixing for production: credentials from the environment, and no
`ports:` mapping so Postgres is only reachable on the compose network.

### Medium: a numeric PIN is weak for an internet-facing instance

`RAILOBSERVER_AUTH_PIN` is a free-form string, and the lock screen sets
`inputMode="numeric"`, which nudges towards digits. A 4-digit PIN is 10000
possibilities. With 5 attempts per 15 minutes that is roughly 480 guesses a day,
so a full sweep takes about three weeks of patient automated traffic, and half
that on average. That is inside the window an untargeted scanner might keep
trying, and the lockout is per client key, so the flaw above compounds it.

Use a passphrase rather than a PIN. The field accepts one, the comparison is
length-independent in practice, and the session lasts a year so it is typed
rarely. If the app stays LAN-only or behind a VPN this drops to low.

### Medium: no security response headers

There is no Spring Security on the classpath and no filter adding headers, so
responses carry none of `Content-Security-Policy`,
`Strict-Transport-Security`, `X-Content-Type-Options`, `Referrer-Policy` or
`Permissions-Policy`. A CSP in particular is the second line of defence behind
`HttpOnly` for any injected script.

Cheapest place to fix this is the reverse proxy, since it is being added anyway:

```
header {
    Strict-Transport-Security "max-age=31536000; includeSubDomains"
    X-Content-Type-Options "nosniff"
    Referrer-Policy "no-referrer"
    Permissions-Policy "geolocation=(self), camera=(), microphone=()"
    Content-Security-Policy "default-src 'self'; img-src 'self' data: https://*.tile.openstreetmap.org; style-src 'self' 'unsafe-inline'; connect-src 'self'"
}
```

Two things the CSP has to accommodate: the map loads tiles from
`tile.openstreetmap.org`, and the theme bootstrap in `index.html` is an inline
`<script>`. Give that script a nonce or a hash rather than allowing
`unsafe-inline` on `script-src`. Fonts are self-hosted since the design port, so
no external font origin is needed.

`geolocation=(self)` matters: the Advanced page captures coordinates, so the
permission has to stay allowed for the app's own origin.

### Medium: the PIN is stored and compared in plaintext

`AuthProperties` keeps the PIN as a `String` in memory for the process lifetime
and `matches()` compares raw bytes. There is no hash at rest, so anything that
can read the environment of the container, a heap dump, or the `.env` file has
the credential.

For a single-user app with the secret already in the environment this is a
reasonable trade, and `.env.example` is honest about it ("it is stored as is").
Worth knowing rather than worth fixing, unless the instance goes on a shared
host. If it does, hash the PIN with bcrypt or Argon2 and store the hash.

### Low: no rate limiting outside login

`LoginAttemptService` protects `/api/auth/login` only. Every other endpoint is
unlimited, including the two that fan out to external APIs. Station autocomplete
proxies to `transport.opendata.ch` on a 300ms debounce, so an authenticated
client can generate a lot of upstream traffic, and the formation endpoint spends
a metered `OTD_API_TOKEN`. Since reaching those requires a valid session it is
not an attack path so much as a way to get the instance rate-limited or the
token burned by a runaway client.

### Low: session revocation is all-or-nothing

Sessions last 365 days and there is no server-side store, so an individual token
cannot be invalidated. Rotating `RAILOBSERVER_AUTH_SECRET` invalidates every
session on every device at once. For a handful of personal devices that is a
fine trade, and it is already documented in `.env.example`. It is only worth
revisiting if a device is lost, which is what the runbook below is for.

### Low: unhandled exceptions leak a different response shape

`GlobalExceptionHandler` does not have a catch-all. An unexpected exception
returns Spring's default error body instead of `ErrorResponse`. Boot does not
include stack traces by default, so this is a consistency and information
tidiness issue rather than a disclosure one, but the defaults should be set
explicitly rather than assumed. Covered as a task in PRODUCTION.md.

## Discoverability

Separate from access control: not being found in the first place. A SPA behind
auth only ever serves crawlers the lock screen, since `index.html` is returned
for every route and `/api` answers 401, so the exposure is narrow. It is still
"this instance exists, at this hostname, running this software", which is
exactly what an untargeted scanner wants.

Three layers, in increasing order of how much they actually help.

**`robots.txt` and `noindex`.** Both are in the repository now:
`frontend/public/robots.txt` disallows everything and `index.html` carries
`<meta name="robots" content="noindex, nofollow">`. This is advisory. Well
behaved crawlers honour it, and nothing else does. Never list a path in
`robots.txt` to hide it, since the file is public and doing so advertises the
path to exactly the readers who ignore the directive.

**`X-Robots-Tag` at the proxy.** Stronger than the meta tag because it covers
every response, not just HTML, including the manifest and the API. One line
alongside the other headers:

```
header X-Robots-Tag "noindex, nofollow, noarchive"
```

**Certificate Transparency.** This is the one that matters, and no amount of
`robots.txt` touches it. Requesting a Let's Encrypt certificate for
`railobserver.example.ch` publishes that hostname to public CT logs within
minutes. Those logs are streamed and scanned continuously, so a fresh subdomain
gets probed within hours of its first certificate, whether or not anything links
to it. Obscurity through an unguessable hostname does not survive the first
certificate issuance.

If the hostname should stay private, use a DNS-01 wildcard certificate for
`*.example.ch` so the specific subdomain never appears in a log, or terminate
TLS with an internal CA. Both are more work than they are worth if the instance
sits behind a VPN, which is the point below.

None of this is a security control. It reduces how often the instance is found
and probed; it does nothing about what happens once it is. Treat it as hygiene
layered on top of the checklist below, never as a substitute for any item in it.

## Hardening checklist

Before the instance is reachable from outside the LAN:

- [ ] Generate a real `RAILOBSERVER_AUTH_SECRET` with `openssl rand -base64 48`
- [ ] Set a passphrase, not a 4-digit PIN, in `RAILOBSERVER_AUTH_PIN`
- [ ] Run with `SPRING_PROFILES_ACTIVE=prod` so `AuthConfig` enforces both
- [ ] Change the Postgres credentials and remove the published `5432` port
- [ ] Terminate TLS at the proxy and leave `cookie-secure` at its `true` default
- [ ] Configure `forward-headers-strategy` and fix `clientOf()`
- [ ] Add the response headers and a CSP at the proxy
- [ ] Confirm the API is same-origin with the frontend, or `SameSite=Lax`
      breaks login
- [ ] Upgrade Spring Boot from 3.5.0 to the current 3.5.x patch
- [ ] Verify a backup restores, since a compromise is recovered by restoring one
- [ ] Add `X-Robots-Tag` at the proxy, and decide whether the hostname can
      tolerate appearing in public Certificate Transparency logs

Consider whether the instance needs to be internet-facing at all. Behind
Tailscale or WireGuard, most of the list above drops from necessary to prudent,
and the attack surface goes from "every scanner on the internet" to nothing.
Given this is a single-user personal app that would be the strongest single
decision available.

## If something goes wrong

**Suspected session theft or a lost device.** Rotate
`RAILOBSERVER_AUTH_SECRET` and restart the backend. Every device is logged out
immediately, including yours. Change the PIN at the same time if it may have
been observed.

**Suspected instance compromise.** Take the container down before
investigating, since the data is the thing worth protecting and it is already
backed up. Rotate the auth secret, the database password and `OTD_API_TOKEN`,
which is a credential issued to you by opentransportdata.swiss. Restore from a
backup predating the suspected access rather than trying to clean up in place.

**Accidental data loss.** Restore the most recent `pg_dump` into a fresh
database and repoint the backend. Migrations are forward-only and several seed
data, so never attempt a partial rollback by hand.
