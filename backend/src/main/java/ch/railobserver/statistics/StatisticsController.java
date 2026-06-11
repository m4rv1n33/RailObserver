package ch.railobserver.statistics;

import ch.railobserver.statistics.dto.FamilyCountResponse;
import ch.railobserver.statistics.dto.FleetCountResponse;
import ch.railobserver.statistics.dto.MonthlyCountResponse;
import ch.railobserver.statistics.dto.OperatorCountResponse;
import ch.railobserver.statistics.dto.StationCountResponse;
import ch.railobserver.statistics.dto.VehicleCountResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/statistics")
public class StatisticsController {

    private final StatisticsService service;

    public StatisticsController(StatisticsService service) {
        this.service = service;
    }

    @GetMapping("/vehicles")
    public List<VehicleCountResponse> mostSeenVehicles(@RequestParam(required = false) Integer limit) {
        return service.mostSeenVehicles(limit);
    }

    @GetMapping("/fleets")
    public List<FleetCountResponse> mostSeenFleets(@RequestParam(required = false) Integer limit) {
        return service.mostSeenFleets(limit);
    }

    @GetMapping("/stations")
    public List<StationCountResponse> mostVisitedStations(@RequestParam(required = false) Integer limit) {
        return service.mostVisitedStations(limit);
    }

    @GetMapping("/families")
    public List<FamilyCountResponse> sightingsByFamily() {
        return service.sightingsByFamily();
    }

    @GetMapping("/operators")
    public List<OperatorCountResponse> sightingsByOperator() {
        return service.sightingsByOperator();
    }

    @GetMapping("/monthly")
    public List<MonthlyCountResponse> sightingsByMonth() {
        return service.sightingsByMonth();
    }
}
