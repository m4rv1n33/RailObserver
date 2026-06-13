package ch.railobserver.transport.dto;

// A distinct tractive unit or railcar set detected in a train formation, with
// the recordable Swiss running number and the recognized fleet name if known.
public record FormationVehicleResponse(
        String number,
        String detectedFleet
) {
}
