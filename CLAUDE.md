# RailObserver

Personal rail vehicle observation platform for Switzerland. Records sightings of
trains, locomotives, and multiple-unit compositions, with fleet tracking,
statistics, maps, and historical data. Single-user, no social/community features.
Mobile-first (iPhone), offline-friendly where possible.

## Stack

- Backend: Java 21, Spring Boot 3, Spring Data JPA, Flyway, PostgreSQL (Maven, `backend/`)
- Frontend: React, TypeScript, TailwindCSS, PWA (`frontend/`)

## Conventions

- Clean architecture, DDD where appropriate, REST API
- Frequent, small, incremental commits with meaningful messages
- No Javadoc, minimal comments (only when the "why" is non-obvious)
- No emojis, no em dashes in comments
- Avoid overengineering; favor simplicity and maintainability

## Core principle

Logging a sighting must be possible in under 5 seconds (Quick Mode: vehicle
number(s) + save). Operational/service data is always optional, never required.

## Domain model summary

- **Vehicle**: physical vehicle (number, fleet/vehicle type, operator, manufacturer)
- **VehicleType**: a fleet (name, family, manufacturer, fleet size, number_prefix
  for automatic fleet recognition)
- **Composition**: one or more coupled vehicles
- **Service**: optional operational data (line, train number, destination, departure)
- **Sighting**: core entity (timestamp, station, lat/lon, service, notes, vehicles)

Fleet recognition: `FleetRecognitionService` extracts the leading digit group
(max 3 chars) from a vehicle number and matches it against
`vehicle_type.number_prefix`. The mapping is configurable via that table.

## Milestone plan

1. Backend setup, DB setup, Vehicle model, VehicleType model - **done**
2. Sighting model, basic CRUD - **done**
3. Mobile logging UI (Quick / Advanced modes; Service mode deferred to milestone 8,
   needs live operational data) - **done**
4. Statistics - **done**
5. Fleet tracking (seen/missing per fleet) - **done**
6. Vehicle detail pages - **done**
7. Map (sighting locations, heatmap, clustering) - **done**
8. Live operational data integration (Swiss public transport APIs, optional layer)

After each milestone: verify functionality, refactor if necessary, commit.

## Local development

```
docker compose up -d        # PostgreSQL (requires Docker Desktop running)
cd backend && ./mvnw spring-boot:run   # API on http://localhost:8080
cd frontend && npm run dev             # app on http://localhost:5173
```
