CREATE TABLE sighting_vehicle (
    id BIGSERIAL PRIMARY KEY,
    sighting_id BIGINT NOT NULL REFERENCES sighting (id) ON DELETE CASCADE,
    vehicle_id BIGINT NOT NULL REFERENCES vehicle (id),
    position INTEGER NOT NULL,
    UNIQUE (sighting_id, position)
);

CREATE INDEX idx_sighting_vehicle_sighting_id ON sighting_vehicle (sighting_id);
CREATE INDEX idx_sighting_vehicle_vehicle_id ON sighting_vehicle (vehicle_id);
