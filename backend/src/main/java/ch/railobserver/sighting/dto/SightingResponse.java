package ch.railobserver.sighting.dto;

import ch.railobserver.sighting.FormationSnapshot;
import ch.railobserver.sighting.Sighting;
import ch.railobserver.vehicle.dto.VehicleResponse;

import java.time.Instant;
import java.util.List;

public record SightingResponse(
        Long id,
        Instant observedAt,
        String station,
        Double latitude,
        Double longitude,
        String direction,
        ServiceInfoResponse service,
        String notes,
        FormationSnapshot formation,
        List<VehicleResponse> vehicles
) {

    public static SightingResponse from(Sighting sighting) {
        List<VehicleResponse> vehicles = sighting.getVehicles().stream()
                .map(sightingVehicle -> VehicleResponse.from(sightingVehicle.getVehicle()))
                .toList();
        return new SightingResponse(
                sighting.getId(),
                sighting.getObservedAt(),
                sighting.getStation(),
                sighting.getLatitude(),
                sighting.getLongitude(),
                sighting.getDirection(),
                ServiceInfoResponse.from(sighting.getService()),
                sighting.getNotes(),
                sighting.getFormation(),
                vehicles
        );
    }
}
