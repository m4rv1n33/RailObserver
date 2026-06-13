package ch.railobserver.transport;

import java.time.LocalDate;
import java.util.List;

public interface FormationProvider {

    List<FormationVehicle> getFormation(String trainNumber, LocalDate operationDate, String evu);
}
