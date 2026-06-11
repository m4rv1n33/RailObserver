package ch.railobserver.vehicle;

import ch.railobserver.vehicle.dto.CreateVehicleRequest;
import ch.railobserver.vehicle.dto.UpdateVehicleRequest;
import ch.railobserver.vehicle.dto.VehicleDetailResponse;
import ch.railobserver.vehicle.dto.VehicleResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {

    private final VehicleService service;

    public VehicleController(VehicleService service) {
        this.service = service;
    }

    @GetMapping
    public List<VehicleResponse> getAll() {
        return service.findAll().stream()
                .map(VehicleResponse::from)
                .toList();
    }

    @GetMapping("/{id}")
    public VehicleResponse getById(@PathVariable Long id) {
        return VehicleResponse.from(service.findById(id));
    }

    @GetMapping("/{id}/detail")
    public VehicleDetailResponse getDetail(@PathVariable Long id) {
        return service.findDetail(id);
    }

    @PostMapping
    public ResponseEntity<VehicleResponse> create(@Valid @RequestBody CreateVehicleRequest request) {
        Vehicle vehicle = service.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(VehicleResponse.from(vehicle));
    }

    @PatchMapping("/{id}")
    public VehicleResponse updateNotes(@PathVariable Long id, @RequestBody UpdateVehicleRequest request) {
        return VehicleResponse.from(service.updateNotes(id, request.notes()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
