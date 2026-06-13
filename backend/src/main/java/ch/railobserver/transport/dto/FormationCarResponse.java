package ch.railobserver.transport.dto;

// One physical car in the train, in running order, for the formation diagram.
// number is the running number (display only); tractive marks locomotives and
// railcars; travelClass is "1", "2", "12" or null; sectors is the platform
// sector span. unitNumber links the car to its recordable trainset (null for
// hauled coaches that are not fleet-tracked).
public record FormationCarResponse(
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
