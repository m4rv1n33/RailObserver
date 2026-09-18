# Security

The security model of RailObserver, what is implemented today, and what needs
attention before the app is reachable from outside the LAN. Deployment and
operational concerns are in [PRODUCTION.md](PRODUCTION.md).

## Threat model

One user, one instance, one login in front of it. There are no accounts, no
roles and no sharing features, so there is no such thing as another user's data
to protect. That removes an entire class of problems: no authorisation logic, no
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

The application has no authentication of its own. Access control lives entirely
in front of it: `frontend/Caddyfile` wraps every route, the static app and
`/api/*` alike, in a `forward_auth` to Authelia. A request without a valid
Authelia session never reaches the SPA or the backend, and is redirected to the
Authelia login instead. The backend trusts whatever reaches it.

That only holds while Caddy is the single way in. Postgres has no published
port, the backend has none either, and the frontend is published on
`127.0.0.1` only, so the path from outside is tunnel, Caddy, Authelia check,
then the app. Publishing the backend port directly, or adding a route to the
Caddyfile outside the `forward_auth` block, would expose the whole API
unauthenticated.

Keeping auth out of the application is deliberate. A hand-rolled PIN and
session cookie used to live in the backend; for a single-user instance it
duplicated what Authelia already does better (real credentials, second factor,
brute force protection, session revocation), so it was removed.

**Secrets handling.** `.env` and `.env.local` are gitignored, `.env.example`
documents every variable with generation instructions, and real environment
variables take precedence over the dotenv file, so a deployment that injects
configuration directly is unaffected.

## Findings

Ordered by how much they matter for the homelab move.

### Fixed: `X-Forwarded-For` is only trusted from the proxy

`application.yml` lets Tomcat parse the header, and only from a trusted proxy:

```yaml
server:
  forward-headers-strategy: native
  tomcat:
    remoteip:
      internal-proxies: 172\.1[6-9]\..*|172\.2[0-9]\..*|172\.3[01]\..*
```

Tomcat rewrites the remote address to the real client for requests that
arrived from the Docker-internal range and leaves it alone for anything else, so
a header sent by the client itself is ignored.

Note that this regex replaces Tomcat's default trusted set, which also includes
`127.0.0.1`, `10.0.0.0/8` and `192.168.0.0/16`. That is deliberate and stricter:
the only proxy in front of this app is the frontend container on the compose
network.

### Fixed in production, still open in development: default database credentials

`docker-compose.yml` hardcodes `railobserver` as database name, user and
password and publishes `5432` to the host. That is convenient for local
development and wrong on a host that runs other things, since anything else on
the LAN could connect to the database directly and bypass the application and
the auth in front of it entirely.

`docker-compose.prod.yml` is the fix for the deployment: credentials come from
the environment and there is no `ports:` mapping, so Postgres is reachable on
the compose network and nowhere else. The development file is left as it is on
purpose, and should never be the one running on the homelab.

### Fixed at the proxy, with two headers deliberately left to Cloudflare

There is no Spring Security on the classpath and no filter adding headers, so
the application itself still sets none. `frontend/Caddyfile` now sets them
instead:

```
header {
    X-Content-Type-Options "nosniff"
    Referrer-Policy "no-referrer"
    Permissions-Policy "geolocation=(self), camera=(), microphone=()"
    X-Robots-Tag "noindex, nofollow, noarchive"
}
```

`geolocation=(self)` matters: the Advanced page captures coordinates, so the
permission has to stay allowed for the app's own origin. `X-Robots-Tag` covers
every response rather than only HTML, including the manifest and the API, which
is what makes it stronger than the meta tag described under Discoverability.

Two are deliberately absent here. TLS terminates at the Cloudflare edge and this
container only ever speaks plain HTTP, so `Strict-Transport-Security` asserted
on a plain-HTTP response says nothing, and the CSP belongs next to whatever is
actually serving the certificate. Set both at the edge:

```
Strict-Transport-Security "max-age=31536000; includeSubDomains"
Content-Security-Policy "default-src 'self'; img-src 'self' data: https://*.tile.openstreetmap.org; style-src 'self' 'unsafe-inline'; connect-src 'self'"
```

Two things the CSP has to accommodate: the map loads tiles from
`tile.openstreetmap.org`, and the theme bootstrap in `index.html` is an inline
`<script>`. Give that script a nonce or a hash rather than allowing
`unsafe-inline` on `script-src`. Fonts are self-hosted since the design port, so
no external font origin is needed.

### Low: no rate limiting

No endpoint is rate limited, including the two that fan out to external APIs.
Station autocomplete proxies to `transport.opendata.ch` on a 300ms debounce, so
an authenticated client can generate a lot of upstream traffic, and the
formation endpoint spends a metered `OTD_API_TOKEN`. Since reaching those
requires an Authelia session it is not an attack path so much as a way to get
the instance rate-limited or the token burned by a runaway client.

### Low: unhandled exceptions leak a different response shape

`GlobalExceptionHandler` does not have a catch-all. An unexpected exception
returns Spring's default error body instead of `ErrorResponse`. Boot does not
include stack traces by default, so this is a consistency and information
tidiness issue rather than a disclosure one, but the defaults should be set
explicitly rather than assumed. Covered as a task in PRODUCTION.md.

## Discoverability

Separate from access control: not being found in the first place. Behind
Authelia, crawlers only ever get a redirect to the Authelia login, so the
exposure is narrow. It is still "this instance exists, at this hostname, running
this software", which is exactly what an untargeted scanner wants.

Three layers, in increasing order of how much they actually help.

**`robots.txt` and `noindex`.** Both are in the repository now:
`frontend/public/robots.txt` disallows everything and `index.html` carries
`<meta name="robots" content="noindex, nofollow">`. This is advisory. Well
behaved crawlers honour it, and nothing else does. Never list a path in
`robots.txt` to hide it, since the file is public and doing so advertises the
path to exactly the readers who ignore the directive.

**`X-Robots-Tag` at the proxy.** Stronger than the meta tag because it covers
every response, not just HTML, including the manifest and the API. It is set in
`frontend/Caddyfile` alongside the other response headers above.

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

- [ ] Put every Caddy route, including `/api/*`, behind the Authelia
      `forward_auth`, and confirm an unauthenticated request is redirected
- [ ] Keep the backend unpublished, so Caddy is the only way to reach it
- [x] Change the Postgres credentials and remove the published `5432` port
      (`docker-compose.prod.yml`)
- [x] Terminate TLS, which the Cloudflare Tunnel does
- [x] Configure `forward-headers-strategy`
- [x] Add the response headers at the proxy
- [ ] Add HSTS and the CSP at the Cloudflare edge, which is where TLS ends
- [ ] Upgrade Spring Boot from 3.5.0 to the current 3.5.x patch
- [ ] Verify a backup restores, since a compromise is recovered by restoring one
- [x] Add `X-Robots-Tag` at the proxy
- [ ] Decide whether the hostname can tolerate appearing in public Certificate
      Transparency logs

Consider whether the instance needs to be internet-facing at all. Behind
Tailscale or WireGuard, most of the list above drops from necessary to prudent,
and the attack surface goes from "every scanner on the internet" to nothing.
Given this is a single-user personal app that would be the strongest single
decision available.

## If something goes wrong

**Suspected session theft or a lost device.** Revoke the sessions in Authelia
and change the Authelia password. The app itself holds no sessions.

**Suspected instance compromise.** Take the container down before investigating,
since the data is the thing worth protecting and it is already backed up. Rotate
the Authelia credentials, the database password and `OTD_API_TOKEN`, which is a
credential issued to you by opentransportdata.swiss. Restore from a backup
predating the suspected access rather than trying to clean up in place.

**Accidental data loss.** Restore the most recent `pg_dump` into a fresh
database and repoint the backend. Migrations are forward-only and several seed
data, so never attempt a partial rollback by hand.
