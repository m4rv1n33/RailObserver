package ch.railobserver.transport.dto;

// A distinct recordable trainset or locomotive in the formation: the Swiss
// running number, the recognized fleet name if known, whether that fleet has
// low-floor (level) entry, and a position label ("front" / "back") when the
// train is made of exactly two units.
public record FormationUnitResponse(
        String number,
        String detectedFleet,
        boolean lowFloor,
        String positionLabel
) {
}
