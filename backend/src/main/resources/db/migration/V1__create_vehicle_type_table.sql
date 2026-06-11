CREATE TABLE vehicle_type (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    family VARCHAR(100),
    manufacturer VARCHAR(100),
    fleet_size INTEGER,
    number_prefix VARCHAR(10),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_vehicle_type_number_prefix ON vehicle_type (number_prefix);
