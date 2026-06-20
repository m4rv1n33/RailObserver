CREATE TABLE roster_vehicle (
    id BIGSERIAL PRIMARY KEY,
    vehicle_type_id BIGINT NOT NULL REFERENCES vehicle_type (id) ON DELETE CASCADE,
    number VARCHAR(32) NOT NULL,
    CONSTRAINT uq_roster_vehicle_number UNIQUE (number)
);

CREATE INDEX idx_roster_vehicle_type ON roster_vehicle (vehicle_type_id);
