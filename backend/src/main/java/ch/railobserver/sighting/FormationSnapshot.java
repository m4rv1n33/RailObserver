package ch.railobserver.sighting;

import java.util.List;

// Denormalized copy of a train formation as published at logging time, stored
// as jsonb on the sighting. Mirrors the transport formation response so the
// same diagram can be redrawn later, when the realtime feed no longer serves it.
public record FormationSnapshot(
        List<Car> cars,
        List<Unit> units
) {
    public record Car(
            int position,
            String number,
            boolean tractive,
            String travelClass,
            String sectors,
            boolean lowFloor,
            boolean wheelchair,
            String unitNumber
    ) {
    }

    public record Unit(
            String number,
            String detectedFleet,
            String positionLabel
    ) {
    }
}
