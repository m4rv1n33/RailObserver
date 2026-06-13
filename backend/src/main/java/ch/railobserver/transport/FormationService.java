package ch.railobserver.transport;

import ch.railobserver.transport.dto.FormationCarResponse;
import ch.railobserver.transport.dto.FormationResponse;
import ch.railobserver.transport.dto.FormationUnitResponse;
import ch.railobserver.vehicle.FleetRecognitionService;
import ch.railobserver.vehicletype.VehicleType;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class FormationService {

    private static final int SWISS_RUNNING_NUMBER_LENGTH = 7;

    // Most operators use their (normalized) name as the formation API EVU code.
    // These are the exceptions where the code differs from the operator name.
    private static final Map<String, String> EVU_BY_OPERATOR = Map.of(
            "SBB", "SBBP",
            "BLS", "BLSP"
    );

    private final FormationProvider provider;
    private final FleetRecognitionService fleetRecognitionService;
    private final String defaultEvu;

    public FormationService(FormationProvider provider,
                            FleetRecognitionService fleetRecognitionService,
                            @Value("${railobserver.formation.default-evu:SBBP}") String defaultEvu) {
        this.provider = provider;
        this.fleetRecognitionService = fleetRecognitionService;
        this.defaultEvu = defaultEvu;
    }

    public FormationResponse detect(String trainNumber, LocalDate operationDate, String operator) {
        List<FormationVehicle> vehicles = provider.getFormation(trainNumber, operationDate, resolveEvu(operator));
        if (vehicles.isEmpty()) {
            return FormationResponse.empty();
        }

        List<FormationCarResponse> cars = new ArrayList<>();
        Map<String, FormationUnitResponse> unitsByNumber = new LinkedHashMap<>();
        for (FormationVehicle vehicle : vehicles) {
            // EVNs of tractive units and railcars start with a 9 (UIC types 90-99).
            // Hauled coaches (types 5x, 2x, ...) are shown in the diagram but not
            // tracked as recordable fleets.
            boolean tractive = vehicle.evn() != null && vehicle.evn().startsWith("9");
            String unitNumber = tractive ? toTrainsetNumber(vehicle.vehicleNumber()) : null;
            if (tractive && unitNumber != null) {
                unitsByNumber.computeIfAbsent(unitNumber, n -> {
                    String fleet = fleetRecognitionService.recognize(n).map(VehicleType::getName).orElse(null);
                    return new FormationUnitResponse(n, fleet, null);
                });
            }
            cars.add(new FormationCarResponse(
                    vehicle.position(),
                    toRunningNumber(vehicle.vehicleNumber()),
                    tractive,
                    vehicle.travelClass(),
                    vehicle.sectors(),
                    vehicle.lowFloor(),
                    vehicle.wheelchair(),
                    unitNumber));
        }

        cars.sort((a, b) -> Integer.compare(a.position(), b.position()));
        return new FormationResponse(List.copyOf(cars), labelPositions(unitsByNumber.values()));
    }

    // opendata.ch operator strings ("SBB", "THURBO", "BLS-bls", "SOB-sob") map to
    // formation API EVU codes. Normalize to the part before any "-" and apply the
    // known exceptions; everything else uses the operator name as the code. A blank
    // operator falls back to the configured default.
    private String resolveEvu(String operator) {
        if (operator == null || operator.isBlank()) {
            return defaultEvu;
        }
        String normalized = operator.toUpperCase(Locale.ROOT).split("-")[0].strip();
        return EVU_BY_OPERATOR.getOrDefault(normalized, normalized);
    }

    // A train of exactly two units gets front/back labels; the order follows the
    // formation position. Single units and longer trains carry no label.
    private static List<FormationUnitResponse> labelPositions(java.util.Collection<FormationUnitResponse> units) {
        List<FormationUnitResponse> list = new ArrayList<>(units);
        if (list.size() == 2) {
            return List.of(
                    withLabel(list.get(0), "front"),
                    withLabel(list.get(1), "back"));
        }
        return List.copyOf(list);
    }

    private static FormationUnitResponse withLabel(FormationUnitResponse unit, String label) {
        return new FormationUnitResponse(unit.number(), unit.detectedFleet(), label);
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

    // Display form of an individual car's full running number (e.g. "1512042"
    // -> "512-042"), keeping the per-car leading digit out of the way.
    private static String toRunningNumber(String vehicleNumber) {
        if (vehicleNumber == null) {
            return null;
        }
        String digits = vehicleNumber.replaceAll("\\D", "");
        if (digits.length() == SWISS_RUNNING_NUMBER_LENGTH) {
            return digits.substring(1, 4) + "-" + digits.substring(4);
        }
        return digits.isEmpty() ? null : digits;
    }
}
