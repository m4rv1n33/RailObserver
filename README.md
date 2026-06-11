# RailObserver

A personal rail vehicle observation platform for Switzerland. Tracks sightings of
trains, locomotives, and multiple-unit compositions, with fleet tracking,
statistics, maps, and historical data.

This is a personal project, not a community or social platform.

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
