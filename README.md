# RailObserver

A personal rail vehicle observation platform for Switzerland. Think of it as a
trainspotter's logbook: a fast, mobile-first app for recording which rail
vehicles you have seen, where, and when, and for exploring that history over
time.

## Idea and purpose

RailObserver turns casual train spotting into a structured personal dataset. The
guiding principle is speed: logging a sighting must be possible in under five
seconds. Everything beyond the vehicle number, such as station, location, line,
train number, and destination, is optional and never gets in the way of a quick
log.

This is a single-user, personal project. It deliberately has no social, sharing,
or community features. It is built to work well on an iPhone and Desktop.

## What the app does

### Logging

- **Quick mode** (`/quick`): vehicle number(s) and save, nothing else required.
- **Advanced mode** (`/`, the default screen): adds station, coordinates, line,
  train number, destination, departure time, and free-form notes.
- **Station autocomplete** and a **departure board lookup** fill in operational
  details from live Swiss public transport data instead of making you type them.
- **Formation lookup**: a train number can be expanded into its actual coupled
  units and carriages, so a whole composition is logged in one step.

Vehicle numbers are matched to fleets automatically. `FleetRecognitionService`
takes the leading digit group of a number (max three characters) and looks it up
in `vehicle_type.number_prefix`, so the mapping stays configurable in the
database rather than in code.

### Exploring

- **Sightings** (`/sightings`): the full log with filters, plus a detail page per
  sighting including the recorded formation.
- **Fleet tracking** (`/fleets`): per fleet, which vehicles of the real roster
  you have already seen and which are still missing. Rosters are seeded from real
  SBB-group data, grouped by operator.
- **Statistics** (`/statistics`): most-seen vehicles, fleets, stations, families
  and operators, plus activity per month.
- **Map** (`/map`): where you have spotted vehicles, with heatmap and clustering.
- **Vehicle pages** (`/vehicles/:id`): the history of an individual vehicle.
- **Formation diagrams** (`/formation`): a train's composition visualised with
  travel class, amenities, and where each unit sits on the platform.
- **Formation samples** (`/secret/formations`): a hidden page with hand-built
  formations for exercising the diagram without live API data, in particular
  multi-unit (double and triple traction) trains. Reachable via the easter egg
  in the app shell, tapping the title five times.

## Domain model

- **Vehicle**: a physical vehicle (number, fleet/vehicle type, operator,
  manufacturer)
- **VehicleType**: a fleet (name, family, manufacturer, fleet size, operator,
  `number_prefix` for fleet recognition)
- **RosterVehicle**: the real, known roster of a fleet, used for seen/missing
- **Composition**: one or more coupled vehicles
- **Service**: optional operational data (line, train number, destination,
  departure)
- **Sighting**: the core entity (timestamp, station, lat/lon, service, notes,
  vehicles, formation snapshot)

## Stack

- Backend: Java 21, Spring Boot 3, Spring Data JPA, Flyway, PostgreSQL (`backend/`)
- Frontend: React, TypeScript, TailwindCSS, PWA (`frontend/`)
- Data sources: transport.opendata.ch (stations, departures),
  opentransportdata.swiss Train Formation API (formations)

The REST API lives under `/api` with the resources `sightings`, `vehicles`,
`vehicle-types`, `fleets`, `statistics` and `transport`.

## Development

### Database

Start a local PostgreSQL instance (Docker Desktop has to be running):

```
docker compose up -d
```

Schema and seed data are applied by Flyway on backend startup.

### Backend

```
cd backend
./mvnw spring-boot:run
```

The API runs on `http://localhost:8080`.

For the formation features, copy `backend/.env.example` to `backend/.env` and set
`OTD_API_TOKEN` to an opentransportdata.swiss API token. Without a token the app
works normally, only formation lookup stays disabled.

### Frontend

```
cd frontend
npm install
npm run dev
```

The app runs on `http://localhost:5173` and proxies `/api` to the backend.

## Deployment

Running this outside local development needs work that is not done yet: there is
no container image, no reverse proxy and no backup. Two documents cover it.

- [docs/PRODUCTION.md](docs/PRODUCTION.md) - packaging, deployment, data safety
  and operations
- [docs/SECURITY.md](docs/SECURITY.md) - threat model, the auth design, and the
  hardening checklist
