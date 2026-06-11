CREATE TABLE vehicle (
    id BIGSERIAL PRIMARY KEY,
    number VARCHAR(50) NOT NULL UNIQUE,
    vehicle_type_id BIGINT REFERENCES vehicle_type (id),
    operator VARCHAR(100),
    manufacturer VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_vehicle_vehicle_type_id ON vehicle (vehicle_type_id);
