package ch.railobserver.fleet;

import ch.railobserver.common.exception.ResourceNotFoundException;
import ch.railobserver.fleet.dto.FleetDetailResponse;
import ch.railobserver.fleet.dto.FleetSummaryResponse;
import ch.railobserver.fleet.dto.SeenVehicleResponse;
import ch.railobserver.fleet.projection.FleetSeenCountProjection;
import ch.railobserver.fleet.projection.SeenVehicleProjection;
import ch.railobserver.vehicletype.VehicleType;
import ch.railobserver.vehicletype.VehicleTypeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
@Transactional(readOnly = true)
public class FleetService {

    private final VehicleTypeRepository vehicleTypeRepository;
    private final FleetStatisticsRepository fleetStatisticsRepository;

    public FleetService(VehicleTypeRepository vehicleTypeRepository, FleetStatisticsRepository fleetStatisticsRepository) {
        this.vehicleTypeRepository = vehicleTypeRepository;
        this.fleetStatisticsRepository = fleetStatisticsRepository;
    }

    public List<FleetSummaryResponse> findAll() {
        Map<Long, Long> seenCounts = fleetStatisticsRepository.countSeenByFleet().stream()
                .collect(Collectors.toMap(FleetSeenCountProjection::getVehicleTypeId, FleetSeenCountProjection::getSeenCount));

        return vehicleTypeRepository.findAll().stream()
                .map(vehicleType -> FleetSummaryResponse.from(vehicleType, seenCounts.getOrDefault(vehicleType.getId(), 0L)))
                .toList();
    }

    public FleetDetailResponse findById(Long id) {
        VehicleType vehicleType = vehicleTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle type not found: " + id));

        List<SeenVehicleProjection> seenVehicleProjections = fleetStatisticsRepository.findSeenVehicles(id);
        Map<String, Long> seenIdsByNumber = seenVehicleProjections.stream()
                .collect(Collectors.toMap(SeenVehicleProjection::getNumber, SeenVehicleProjection::getId));

        List<String> roster = roster(vehicleType);

        if (roster.isEmpty()) {
            List<SeenVehicleResponse> seen = seenVehicleProjections.stream()
                    .sorted(Comparator.comparing(SeenVehicleProjection::getNumber))
                    .map(p -> new SeenVehicleResponse(p.getId(), p.getNumber()))
                    .toList();
            return FleetDetailResponse.from(vehicleType, seen, List.of());
        }

        Map<Boolean, List<String>> partitioned = roster.stream()
                .collect(Collectors.partitioningBy(seenIdsByNumber::containsKey));

        List<SeenVehicleResponse> seen = sorted(partitioned.get(true)).stream()
                .map(number -> new SeenVehicleResponse(seenIdsByNumber.get(number), number))
                .toList();
        List<String> missing = sorted(partitioned.get(false));

        return FleetDetailResponse.from(vehicleType, seen, missing);
    }

    // Vehicle numbers are assumed to follow the "<numberPrefix>-<NNN>" convention
    // (e.g. "511-001"), running from 1 to fleetSize. Used to derive the roster of
    // vehicles expected for a fleet so missing vehicles can be listed.
    private List<String> roster(VehicleType vehicleType) {
        if (vehicleType.getNumberPrefix() == null || vehicleType.getFleetSize() == null) {
            return List.of();
        }
        return IntStream.rangeClosed(1, vehicleType.getFleetSize())
                .mapToObj(i -> "%s-%03d".formatted(vehicleType.getNumberPrefix(), i))
                .toList();
    }

    private List<String> sorted(List<String> numbers) {
        return numbers.stream().sorted().toList();
    }
}
