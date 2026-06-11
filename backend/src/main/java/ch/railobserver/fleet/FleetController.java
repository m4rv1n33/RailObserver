package ch.railobserver.fleet;

import ch.railobserver.fleet.dto.FleetDetailResponse;
import ch.railobserver.fleet.dto.FleetSummaryResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/fleets")
public class FleetController {

    private final FleetService service;

    public FleetController(FleetService service) {
        this.service = service;
    }

    @GetMapping
    public List<FleetSummaryResponse> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public FleetDetailResponse getById(@PathVariable Long id) {
        return service.findById(id);
    }
}
