package ch.railobserver.transport;

import ch.railobserver.transport.dto.FormationVehicleResponse;
import ch.railobserver.vehicle.FleetRecognitionService;
import ch.railobserver.vehicletype.VehicleType;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class FormationService {

    private static final int SWISS_RUNNING_NUMBER_LENGTH = 7;

    private final FormationProvider provider;
    private final FleetRecognitionService fleetRecognitionService;

    public FormationService(FormationProvider provider, FleetRecognitionService fleetRecognitionService) {
        this.provider = provider;
        this.fleetRecognitionService = fleetRecognitionService;
    }

    public List<FormationVehicleResponse> detect(String trainNumber, LocalDate operationDate) {
        Map<String, FormationVehicleResponse> byNumber = new LinkedHashMap<>();
        for (FormationVehicle vehicle : provider.getFormation(trainNumber, operationDate)) {
            // EVNs of tractive units and railcars start with a 9 (UIC types 90-99).
            // Hauled coaches (types 5x, 2x, ...) are not tracked as fleets, so skip them.
            if (vehicle.evn() == null || !vehicle.evn().startsWith("9")) {
                continue;
            }
            String number = toTrainsetNumber(vehicle.vehicleNumber());
            if (number == null) {
                continue;
            }
            byNumber.computeIfAbsent(number, n -> {
                String fleet = fleetRecognitionService.recognize(n).map(VehicleType::getName).orElse(null);
                return new FormationVehicleResponse(n, fleet);
            });
        }
        return List.copyOf(byNumber.values());
    }

    // Coaches of one unit share the trailing 6 digits of the 7-digit running number;
    // the leading digit only marks the position within the set. Dropping it yields
    // the trainset number, formatted as class-running (e.g. "1512042" -> "512-042").
    // The leading three digits remain the fleet class the FleetRecognitionService
    // matches against.
    private static String toTrainsetNumber(String vehicleNumber) {
        if (vehicleNumber == null) {
            return null;
        }
        String digits = vehicleNumber.replaceAll("\\D", "");
        if (digits.length() == SWISS_RUNNING_NUMBER_LENGTH) {
            String runningNumber = digits.substring(1);
            return runningNumber.substring(0, 3) + "-" + runningNumber.substring(3);
        }
        return digits.isEmpty() ? null : digits;
    }
}
