-- Low-floor (level / step-free entry) is a fixed property of a fleet and is not
-- exposed by the realtime formation API, so it is tracked here. Marking the
-- common standard-gauge low-floor multiple units; extend as needed.
ALTER TABLE vehicle_type ADD COLUMN low_floor BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE vehicle_type SET low_floor = TRUE
WHERE family LIKE 'FLIRT%' OR family IN ('NINA', 'MUTZ');
