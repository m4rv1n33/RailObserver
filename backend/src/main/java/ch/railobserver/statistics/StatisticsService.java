package ch.railobserver.statistics;

import ch.railobserver.statistics.dto.FamilyCountResponse;
import ch.railobserver.statistics.dto.FleetCountResponse;
import ch.railobserver.statistics.dto.MonthlyCountResponse;
import ch.railobserver.statistics.dto.OperatorCountResponse;
import ch.railobserver.statistics.dto.StationCountResponse;
import ch.railobserver.statistics.dto.VehicleCountResponse;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class StatisticsService {

    private static final int DEFAULT_LIMIT = 10;

    private final SightingVehicleStatisticsRepository sightingVehicleStatisticsRepository;
    private final SightingStatisticsRepository sightingStatisticsRepository;

    public StatisticsService(
            SightingVehicleStatisticsRepository sightingVehicleStatisticsRepository,
            SightingStatisticsRepository sightingStatisticsRepository) {
        this.sightingVehicleStatisticsRepository = sightingVehicleStatisticsRepository;
        this.sightingStatisticsRepository = sightingStatisticsRepository;
    }

    public List<VehicleCountResponse> mostSeenVehicles(Integer limit) {
        return sightingVehicleStatisticsRepository.findMostSeenVehicles(pageable(limit)).stream()
                .map(VehicleCountResponse::from)
                .toList();
    }

    public List<FleetCountResponse> mostSeenFleets(Integer limit) {
        return sightingVehicleStatisticsRepository.findMostSeenFleets(pageable(limit)).stream()
                .map(FleetCountResponse::from)
                .toList();
    }

    public List<StationCountResponse> mostVisitedStations(Integer limit) {
        return sightingStatisticsRepository.findMostVisitedStations(pageable(limit)).stream()
                .map(StationCountResponse::from)
                .toList();
    }

    public List<FamilyCountResponse> sightingsByFamily() {
        return sightingVehicleStatisticsRepository.countByFamily().stream()
                .map(FamilyCountResponse::from)
                .toList();
    }

    public List<OperatorCountResponse> sightingsByOperator() {
        return sightingVehicleStatisticsRepository.countByOperator().stream()
                .map(OperatorCountResponse::from)
                .toList();
    }

    public List<MonthlyCountResponse> sightingsByMonth() {
        return sightingStatisticsRepository.countByMonth().stream()
                .map(MonthlyCountResponse::from)
                .toList();
    }

    private Pageable pageable(Integer limit) {
        return Pageable.ofSize(limit != null && limit > 0 ? limit : DEFAULT_LIMIT);
    }
}
