package ch.railobserver.transport;

import ch.railobserver.transport.dto.DepartureResponse;
import ch.railobserver.transport.dto.StationResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/transport")
public class TransportController {

    private final TransportDataProvider provider;

    public TransportController(TransportDataProvider provider) {
        this.provider = provider;
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
}
