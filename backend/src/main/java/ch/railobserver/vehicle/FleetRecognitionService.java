package ch.railobserver.vehicle;

import ch.railobserver.vehicletype.VehicleType;
import ch.railobserver.vehicletype.VehicleTypeRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

// Determines the vehicle type for a vehicle number, e.g. "511-001" -> RABe 511,
// based on the configurable number_prefix of each vehicle type.
@Service
public class FleetRecognitionService {

    private static final Pattern NUMBER_PATTERN = Pattern.compile("\\d+");
    private static final int PREFIX_LENGTH = 3;

    private final VehicleTypeRepository vehicleTypeRepository;

    public FleetRecognitionService(VehicleTypeRepository vehicleTypeRepository) {
        this.vehicleTypeRepository = vehicleTypeRepository;
    }

    public Optional<VehicleType> recognize(String vehicleNumber) {
        Matcher matcher = NUMBER_PATTERN.matcher(vehicleNumber);
        if (!matcher.find()) {
            return Optional.empty();
        }

        String digits = matcher.group();
        String prefix = digits.length() > PREFIX_LENGTH ? digits.substring(0, PREFIX_LENGTH) : digits;
        return vehicleTypeRepository.findByNumberPrefix(prefix);
    }
}
