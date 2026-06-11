package ch.railobserver.vehicletype;

import ch.railobserver.vehicletype.dto.VehicleTypeResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/vehicle-types")
public class VehicleTypeController {

    private final VehicleTypeService service;

    public VehicleTypeController(VehicleTypeService service) {
        this.service = service;
    }

    @GetMapping
    public List<VehicleTypeResponse> getAll() {
        return service.findAll().stream()
                .map(VehicleTypeResponse::from)
                .toList();
    }

    @GetMapping("/{id}")
    public VehicleTypeResponse getById(@PathVariable Long id) {
        return VehicleTypeResponse.from(service.findById(id));
    }
}
