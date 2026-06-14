# RailObserver

A personal rail vehicle observation platform for Switzerland. Think of it as a
trainspotter's logbook: a fast, mobile-first app for recording which rail
vehicles you have seen, where, and when, and for exploring that history over
time.

## Idea and purpose

RailObserver turns casual train spotting into a structured personal dataset. The
guiding principle is speed: logging a sighting must be possible in under five
seconds (Quick Mode: enter the vehicle number(s) and save). Everything beyond
the vehicle number, such as station, location, line, train number, and
destination, is optional and never gets in the way of a quick log.

To make logging effortless, the app integrates Swiss public transport data. It
can look up the live train formation for a journey (so a single train number
expands into its actual coupled units and carriages), suggest stations as you
type, and pull operational details straight from the departure board.

Once sightings accumulate, the app helps you make sense of them:

- **Fleet tracking** shows which vehicles of a fleet you have already seen and
  which are still missing, fleet by fleet.
- **Statistics** summarise your activity (most-seen vehicles, busiest stations,
  and so on).
- **Maps** plot where you have spotted vehicles, with heatmaps and clustering.
- **Vehicle and fleet pages** collect the history of an individual vehicle or a
  whole fleet.
- **Formation diagrams** visualise a train's composition, including travel
  class, amenities, and where each unit sits on the platform.

This is a single-user, personal project. It deliberately has no social, sharing,
or community features. It is built to work well on an iPhone and to stay usable
offline where possible.

## Stack

- Backend: Java 21, Spring Boot 3, Spring Data JPA, Flyway, PostgreSQL
- Frontend: React, TypeScript, TailwindCSS, PWA

## Development

### Database

Start a local PostgreSQL instance:

```
docker compose up -d
```

### Backend

```
cd backend
./mvnw spring-boot:run
```

The API runs on `http://localhost:8080`.

### Frontend

```
cd frontend
npm install
npm run dev
```

The app runs on `http://localhost:5173` and proxies `/api` to the backend.
