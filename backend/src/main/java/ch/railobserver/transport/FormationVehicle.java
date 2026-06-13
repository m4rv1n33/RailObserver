package ch.railobserver.transport;

// Raw vehicle entry from the formation provider: the full European Vehicle Number
// (e.g. "94 85 1 512 042-6") and the 7-digit running number (e.g. "1512042").
public record FormationVehicle(
        String evn,
        String vehicleNumber
) {
}
