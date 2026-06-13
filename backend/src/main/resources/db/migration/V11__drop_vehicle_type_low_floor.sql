-- Low-floor is now read per wagon from the formation API's FormationShortString
-- (NF marker), which is accurate per vehicle, so the fleet-level flag added in
-- V10 is no longer needed.
ALTER TABLE vehicle_type DROP COLUMN low_floor;
