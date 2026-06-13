package ch.railobserver.transport;

import ch.railobserver.transport.dto.FormationVehicleResponse;
import ch.railobserver.vehicle.FleetRecognitionService;
import ch.railobserver.vehicletype.VehicleType;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class FormationServiceTest {

    private final FormationProvider provider = mock(FormationProvider.class);
    private final FleetRecognitionService recognition = mock(FleetRecognitionService.class);
    private final FormationService service = new FormationService(provider, recognition);

    @Test
    void detect_dedupesTrainsets_skipsCoaches_andResolvesFleet() {
        when(provider.getFormation(any(), any())).thenReturn(List.of(
                // RABe 512 set 056: six coaches sharing the trailing six digits
                new FormationVehicle("94 85 1 512 056-6", "1512056"),
                new FormationVehicle("94 85 2 512 056-4", "2512056"),
                // Re 460 locomotive
                new FormationVehicle("91 85 4 460 037-5", "4460037"),
                // hauled coach (EVN type 50) must be ignored
                new FormationVehicle("50 85 16-94 157-4", "1694157")
        ));
        VehicleType re460 = new VehicleType();
        re460.setName("Re 460");
        when(recognition.recognize("460037")).thenReturn(Optional.of(re460));
        when(recognition.recognize("512056")).thenReturn(Optional.empty());

        List<FormationVehicleResponse> result = service.detect("4824", LocalDate.of(2026, 6, 13));

        assertThat(result).containsExactly(
                new FormationVehicleResponse("512056", null),
                new FormationVehicleResponse("460037", "Re 460"));
    }
}
