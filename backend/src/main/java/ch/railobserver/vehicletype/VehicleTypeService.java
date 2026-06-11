package ch.railobserver.vehicletype;

import ch.railobserver.common.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class VehicleTypeService {

    private final VehicleTypeRepository repository;

    public VehicleTypeService(VehicleTypeRepository repository) {
        this.repository = repository;
    }

    public List<VehicleType> findAll() {
        return repository.findAll();
    }

    public VehicleType findById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle type not found: " + id));
    }
}
