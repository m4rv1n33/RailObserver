package ch.railobserver.vehicle;

import ch.railobserver.common.exception.DuplicateResourceException;
import ch.railobserver.common.exception.ResourceNotFoundException;
import ch.railobserver.vehicle.dto.CreateVehicleRequest;
import ch.railobserver.vehicletype.VehicleType;
import ch.railobserver.vehicletype.VehicleTypeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final VehicleTypeRepository vehicleTypeRepository;
    private final FleetRecognitionService fleetRecognitionService;

    public VehicleService(VehicleRepository vehicleRepository,
                           VehicleTypeRepository vehicleTypeRepository,
                           FleetRecognitionService fleetRecognitionService) {
        this.vehicleRepository = vehicleRepository;
        this.vehicleTypeRepository = vehicleTypeRepository;
        this.fleetRecognitionService = fleetRecognitionService;
    }

    public List<Vehicle> findAll() {
        return vehicleRepository.findAll();
    }

    public Vehicle findById(Long id) {
        return vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found: " + id));
    }

    @Transactional
    public Vehicle create(CreateVehicleRequest request) {
        if (vehicleRepository.existsByNumber(request.number())) {
            throw new DuplicateResourceException("Vehicle already exists: " + request.number());
        }

        Vehicle vehicle = new Vehicle();
        vehicle.setNumber(request.number());
        vehicle.setOperator(request.operator());
        vehicle.setManufacturer(request.manufacturer());
        vehicle.setVehicleType(resolveVehicleType(request));

        return vehicleRepository.save(vehicle);
    }

    @Transactional
    public Vehicle findOrCreateByNumber(String number) {
        return vehicleRepository.findByNumber(number)
                .orElseGet(() -> {
                    Vehicle vehicle = new Vehicle();
                    vehicle.setNumber(number);
                    vehicle.setVehicleType(fleetRecognitionService.recognize(number).orElse(null));
                    return vehicleRepository.save(vehicle);
                });
    }

    @Transactional
    public void delete(Long id) {
        if (!vehicleRepository.existsById(id)) {
            throw new ResourceNotFoundException("Vehicle not found: " + id);
        }
        vehicleRepository.deleteById(id);
    }

    private VehicleType resolveVehicleType(CreateVehicleRequest request) {
        if (request.vehicleTypeId() != null) {
            return vehicleTypeRepository.findById(request.vehicleTypeId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Vehicle type not found: " + request.vehicleTypeId()));
        }
        return fleetRecognitionService.recognize(request.number()).orElse(null);
    }
}
