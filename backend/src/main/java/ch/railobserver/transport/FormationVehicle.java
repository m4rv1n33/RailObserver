package ch.railobserver.transport;

// Raw vehicle entry from the formation provider: one physical car (coach or
// tractive unit) in the train. evn is the full European Vehicle Number
// (e.g. "94 85 6 511 037-6"), vehicleNumber the 7-digit running number
// (e.g. "6511037"). position orders the cars along the train (1-based).
// typeCodeName is the car type (e.g. "AB511"); travelClass is "1", "2", "12"
// or null; sectors is the platform sector span such as "A,B". The booleans flag
// per-car amenities the formation API publishes.
public record FormationVehicle(
        int position,
        String evn,
        String vehicleNumber,
        String typeCodeName,
        String travelClass,
        String sectors,
        boolean lowFloor,
        boolean wheelchair,
        boolean bike,
        boolean restaurant,
        boolean familyZone,
        boolean businessZone
) {
}
