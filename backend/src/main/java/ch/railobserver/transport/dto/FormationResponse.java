package ch.railobserver.transport.dto;

import java.util.List;

// A train formation: every car in running order for visualization, plus the
// deduped recordable units (trainsets / locomotives) used for logging.
public record FormationResponse(
        List<FormationCarResponse> cars,
        List<FormationUnitResponse> units
) {
    public static FormationResponse empty() {
        return new FormationResponse(List.of(), List.of());
    }

    public boolean isEmpty() {
        return cars.isEmpty() && units.isEmpty();
    }
}
