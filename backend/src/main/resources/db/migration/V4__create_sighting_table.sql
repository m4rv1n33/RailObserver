CREATE TABLE sighting (
    id BIGSERIAL PRIMARY KEY,
    observed_at TIMESTAMPTZ NOT NULL,
    station VARCHAR(100),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    direction VARCHAR(100),
    service_line VARCHAR(50),
    service_train_number VARCHAR(50),
    service_destination VARCHAR(100),
    service_departure_time TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sighting_observed_at ON sighting (observed_at);
