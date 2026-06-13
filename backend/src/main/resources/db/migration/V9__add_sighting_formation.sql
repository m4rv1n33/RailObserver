-- Snapshot of the published train formation at logging time. The realtime
-- formation feed only serves data around a journey's operating time, so the
-- formation is captured here to allow replaying the diagram on past sightings.
ALTER TABLE sighting ADD COLUMN formation jsonb;
