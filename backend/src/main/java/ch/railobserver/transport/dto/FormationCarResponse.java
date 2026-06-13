package ch.railobserver.transport.dto;

// One physical car in the train, in running order, for the formation diagram.
// number is the running number (display only); typeName is the car type code
// (e.g. "AB511"); tractive marks locomotives and railcars; travelClass is
// "1", "2", "12" or null; sectors is the platform sector span; the booleans flag
// amenities. unitNumber links the car to its recordable trainset (null for
// hauled coaches that are not fleet-tracked).
public record FormationCarResponse(
        int position,
        String number,
        String typeName,
        boolean tractive,
        String travelClass,
        String sectors,
        boolean wheelchair,
        boolean lowFloor,
        boolean bike,
        boolean restaurant,
        boolean familyZone,
        boolean businessZone,
        String unitNumber
) {
}
