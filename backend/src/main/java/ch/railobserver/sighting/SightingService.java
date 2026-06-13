package ch.railobserver.sighting;

import ch.railobserver.common.exception.ResourceNotFoundException;
import ch.railobserver.sighting.dto.CreateSightingRequest;
import ch.railobserver.sighting.dto.ServiceInfoRequest;
import ch.railobserver.vehicle.Vehicle;
import ch.railobserver.vehicle.VehicleService;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class SightingService {

    private final SightingRepository sightingRepository;
    private final VehicleService vehicleService;

    public SightingService(SightingRepository sightingRepository, VehicleService vehicleService) {
        this.sightingRepository = sightingRepository;
        this.vehicleService = vehicleService;
    }

    public List<Sighting> findAll() {
        return sightingRepository.findAllByOrderByObservedAtDesc();
    }

    public Sighting findById(Long id) {
        return sightingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sighting not found: " + id));
    }

    public List<Sighting> findForMap(Long vehicleId, Long fleetId, Instant from, Instant to) {
        Specification<Sighting> spec = Specification.where(SightingSpecifications.hasLocation());
        if (vehicleId != null) {
            spec = spec.and(SightingSpecifications.hasVehicle(vehicleId));
        }
        if (fleetId != null) {
            spec = spec.and(SightingSpecifications.hasFleet(fleetId));
        }
        if (from != null) {
            spec = spec.and(SightingSpecifications.observedAfter(from));
        }
        if (to != null) {
            spec = spec.and(SightingSpecifications.observedBefore(to));
        }
        return sightingRepository.findAll(spec, Sort.by(Sort.Direction.DESC, "observedAt"));
    }

    @Transactional
    public Sighting create(CreateSightingRequest request) {
        Sighting sighting = new Sighting();
        sighting.setObservedAt(request.observedAt() != null ? request.observedAt() : Instant.now());
        sighting.setStation(request.station());
        sighting.setLatitude(request.latitude());
        sighting.setLongitude(request.longitude());
        sighting.setDirection(request.direction());
        sighting.setNotes(request.notes());
        sighting.setService(toServiceInfo(request.service()));
        sighting.setFormation(request.formation());

        List<String> vehicleNumbers = request.vehicleNumbers();
        for (int position = 0; position < vehicleNumbers.size(); position++) {
            Vehicle vehicle = vehicleService.findOrCreateByNumber(vehicleNumbers.get(position));
            SightingVehicle sightingVehicle = new SightingVehicle();
            sightingVehicle.setVehicle(vehicle);
            sightingVehicle.setPosition(position);
            sighting.addVehicle(sightingVehicle);
        }

        return sightingRepository.save(sighting);
    }

    @Transactional
    public void delete(Long id) {
        if (!sightingRepository.existsById(id)) {
            throw new ResourceNotFoundException("Sighting not found: " + id);
        }
        sightingRepository.deleteById(id);
    }

    private ServiceInfo toServiceInfo(ServiceInfoRequest request) {
        if (request == null) {
            return null;
        }
        ServiceInfo serviceInfo = new ServiceInfo();
        serviceInfo.setLine(request.line());
        serviceInfo.setTrainNumber(request.trainNumber());
        serviceInfo.setDestination(request.destination());
        serviceInfo.setDepartureTime(request.departureTime());
        return serviceInfo;
    }
}
