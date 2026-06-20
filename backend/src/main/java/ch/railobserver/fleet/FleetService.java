package ch.railobserver.fleet;

import ch.railobserver.common.exception.ResourceNotFoundException;
import ch.railobserver.fleet.dto.FleetDetailResponse;
import ch.railobserver.fleet.dto.FleetSummaryResponse;
import ch.railobserver.fleet.dto.SeenVehicleResponse;
import ch.railobserver.fleet.projection.FleetNumberProjection;
import ch.railobserver.fleet.projection.SeenVehicleProjection;
import ch.railobserver.vehicletype.VehicleType;
import ch.railobserver.vehicletype.VehicleTypeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class FleetService {

    private final VehicleTypeRepository vehicleTypeRepository;
    private final FleetStatisticsRepository fleetStatisticsRepository;
    private final RosterVehicleRepository rosterVehicleRepository;

    public FleetService(VehicleTypeRepository vehicleTypeRepository,
                        FleetStatisticsRepository fleetStatisticsRepository,
                        RosterVehicleRepository rosterVehicleRepository) {
        this.vehicleTypeRepository = vehicleTypeRepository;
        this.fleetStatisticsRepository = fleetStatisticsRepository;
        this.rosterVehicleRepository = rosterVehicleRepository;
    }

    public List<FleetSummaryResponse> findAll() {
        Map<Long, List<String>> rosterByType = rosterVehicleRepository.findAllNumbersByFleet().stream()
                .collect(Collectors.groupingBy(FleetNumberProjection::getVehicleTypeId,
                        Collectors.mapping(FleetNumberProjection::getNumber, Collectors.toList())));
        Map<Long, Set<String>> seenByType = fleetStatisticsRepository.findSeenNumbersByFleet().stream()
                .collect(Collectors.groupingBy(FleetNumberProjection::getVehicleTypeId,
                        Collectors.mapping(FleetNumberProjection::getNumber, Collectors.toSet())));

        return vehicleTypeRepository.findAll().stream()
                .map(vehicleType -> summarize(vehicleType,
                        rosterByType.getOrDefault(vehicleType.getId(), List.of()),
                        seenByType.getOrDefault(vehicleType.getId(), Set.of())))
                .toList();
    }

    public FleetDetailResponse findById(Long id) {
        VehicleType vehicleType = vehicleTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle type not found: " + id));

        List<SeenVehicleProjection> seenVehicleProjections = fleetStatisticsRepository.findSeenVehicles(id);
        Map<String, Long> seenIdsByNumber = seenVehicleProjections.stream()
                .collect(Collectors.toMap(SeenVehicleProjection::getNumber, SeenVehicleProjection::getId));

        List<String> roster = rosterVehicleRepository.findNumbersByVehicleTypeId(id);

        if (roster.isEmpty()) {
            List<SeenVehicleResponse> seen = seenVehicleProjections.stream()
                    .sorted(Comparator.comparing(SeenVehicleProjection::getNumber))
                    .map(p -> new SeenVehicleResponse(p.getId(), p.getNumber()))
                    .toList();
            return FleetDetailResponse.from(vehicleType, null, seen, List.of());
        }

        Map<Boolean, List<String>> partitioned = roster.stream()
                .collect(Collectors.partitioningBy(seenIdsByNumber::containsKey));

        List<SeenVehicleResponse> seen = sorted(partitioned.get(true)).stream()
                .map(number -> new SeenVehicleResponse(seenIdsByNumber.get(number), number))
                .toList();
        List<String> missing = sorted(partitioned.get(false));

        return FleetDetailResponse.from(vehicleType, roster.size(), seen, missing);
    }

    // Fleets with a real roster report seen/missing against it; the displayed fleet
    // size is the roster size. Fleets without a seeded roster have no missing data,
    // so fleetSize is null and seenCount reflects every distinct vehicle sighted.
    private FleetSummaryResponse summarize(VehicleType vehicleType, List<String> roster, Set<String> seenNumbers) {
        if (roster.isEmpty()) {
            return FleetSummaryResponse.from(vehicleType, null, seenNumbers.size(), 0);
        }
        long seenCount = roster.stream().filter(seenNumbers::contains).count();
        return FleetSummaryResponse.from(vehicleType, roster.size(), seenCount, roster.size() - seenCount);
    }

    private List<String> sorted(List<String> numbers) {
        return numbers.stream().sorted().toList();
    }
}
