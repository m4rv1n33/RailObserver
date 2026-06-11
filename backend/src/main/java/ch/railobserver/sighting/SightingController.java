package ch.railobserver.sighting;

import ch.railobserver.sighting.dto.CreateSightingRequest;
import ch.railobserver.sighting.dto.SightingResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/sightings")
public class SightingController {

    private final SightingService service;

    public SightingController(SightingService service) {
        this.service = service;
    }

    @GetMapping
    public List<SightingResponse> getAll() {
        return service.findAll().stream()
                .map(SightingResponse::from)
                .toList();
    }

    @GetMapping("/{id}")
    public SightingResponse getById(@PathVariable Long id) {
        return SightingResponse.from(service.findById(id));
    }

    @PostMapping
    public ResponseEntity<SightingResponse> create(@Valid @RequestBody CreateSightingRequest request) {
        Sighting sighting = service.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(SightingResponse.from(sighting));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
