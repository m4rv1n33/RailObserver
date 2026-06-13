package ch.railobserver.transport;

import ch.railobserver.transport.dto.DepartureResponse;
import ch.railobserver.transport.dto.FormationVehicleResponse;
import ch.railobserver.transport.dto.StationResponse;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/transport")
public class TransportController {

    private final TransportDataProvider provider;
    private final FormationService formationService;

    public TransportController(TransportDataProvider provider, FormationService formationService) {
        this.provider = provider;
        this.formationService = formationService;
    }

    @GetMapping("/stations")
    public List<StationResponse> searchStations(@RequestParam String query) {
        return provider.searchStations(query);
    }

    @GetMapping("/departures")
    public List<DepartureResponse> getDepartures(
            @RequestParam String station,
            @RequestParam(defaultValue = "10") int limit) {
        return provider.getDepartures(station, limit);
    }

    @GetMapping("/formation")
    public List<FormationVehicleResponse> getFormation(
            @RequestParam String trainNumber,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return formationService.detect(trainNumber, date);
    }
}
