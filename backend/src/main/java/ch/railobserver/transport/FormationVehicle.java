package ch.railobserver.transport;

// Raw vehicle entry from the formation provider: one physical car (coach or
// tractive unit) in the train. evn is the full European Vehicle Number
// (e.g. "94 85 1 512 042-6"), vehicleNumber the 7-digit running number
// (e.g. "1512042"). position orders the cars along the train (1-based).
// travelClass is "1", "2", "12" or null; sectors is the platform sector span
// such as "A,B"; lowFloor and wheelchair flag step-free access.
public record FormationVehicle(
        int position,
        String evn,
        String vehicleNumber,
        String typeCodeName,
        String travelClass,
        String sectors,
        boolean lowFloor,
        boolean wheelchair
) {
}
