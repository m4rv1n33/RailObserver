package ch.railobserver.transport;

import ch.railobserver.transport.dto.FormationResponse;
import ch.railobserver.transport.dto.FormationUnitResponse;
import ch.railobserver.vehicle.FleetRecognitionService;
import ch.railobserver.vehicletype.VehicleType;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class FormationServiceTest {

    private final FormationProvider provider = mock(FormationProvider.class);
    private final FleetRecognitionService recognition = mock(FleetRecognitionService.class);
    private final FormationService service = new FormationService(provider, recognition, "SBBP");

    private static FormationVehicle car(int position, String evn, String vehicleNumber) {
        return new FormationVehicle(position, evn, vehicleNumber, null, null, null,
                false, false, false, false, false, false);
    }

    @Test
    void detect_dedupesTrainsetsIntoUnits_skipsCoaches_andResolvesFleet() {
        when(provider.getFormation(any(), any(), any())).thenReturn(List.of(
                // RABe 512 set 056: two coaches sharing the trailing six digits
                car(1, "94 85 1 512 056-6", "1512056"),
                car(2, "94 85 2 512 056-4", "2512056"),
                // Re 460 locomotive
                car(3, "91 85 4 460 037-5", "4460037"),
                // hauled coach (EVN type 50) is not a recordable unit
                car(4, "50 85 16-94 157-4", "1694157")
        ));
        VehicleType re460 = new VehicleType();
        re460.setName("Re 460");
        when(recognition.recognize("460-037")).thenReturn(Optional.of(re460));
        when(recognition.recognize("512-056")).thenReturn(Optional.empty());

        FormationResponse result = service.detect("4824", LocalDate.of(2026, 6, 13), "SBB");

        assertThat(result.units()).containsExactly(
                new FormationUnitResponse("512-056", null, false, "front"),
                new FormationUnitResponse("460-037", "Re 460", false, "back"));
        // The hauled coach appears in the diagram but carries no unit number.
        assertThat(result.cars()).hasSize(4);
        assertThat(result.cars().get(3).tractive()).isFalse();
        assertThat(result.cars().get(3).unitNumber()).isNull();
    }

    @Test
    void detect_marksUnitLowFloorFromRecognizedFleet() {
        when(provider.getFormation(any(), any(), any())).thenReturn(List.of(
                car(1, "94 85 0 521 001-0", "0521001")
        ));
        VehicleType flirt = new VehicleType();
        flirt.setName("RABe 521");
        flirt.setLowFloor(true);
        when(recognition.recognize("521-001")).thenReturn(Optional.of(flirt));

        FormationResponse result = service.detect("100", LocalDate.of(2026, 6, 13), "SBB");

        assertThat(result.units()).singleElement()
                .extracting(FormationUnitResponse::detectedFleet, FormationUnitResponse::lowFloor)
                .containsExactly("RABe 521", true);
    }

    @Test
    void detect_labelsTwoUnitsFrontAndBack() {
        when(provider.getFormation(any(), any(), any())).thenReturn(List.of(
                car(1, "94 85 0 512 002-0", "0512002"),
                car(2, "94 85 0 512 006-1", "0512006")
        ));
        when(recognition.recognize(any())).thenReturn(Optional.empty());

        FormationResponse result = service.detect("100", LocalDate.of(2026, 6, 13), "SBB");

        assertThat(result.units()).extracting(FormationUnitResponse::number, FormationUnitResponse::positionLabel)
                .containsExactly(
                        org.assertj.core.groups.Tuple.tuple("512-002", "front"),
                        org.assertj.core.groups.Tuple.tuple("512-006", "back"));
    }

    @Test
    void detect_singleUnitHasNoPositionLabel() {
        when(provider.getFormation(any(), any(), any())).thenReturn(List.of(
                car(1, "91 85 4 460 037-5", "4460037")
        ));
        when(recognition.recognize(any())).thenReturn(Optional.empty());

        FormationResponse result = service.detect("100", LocalDate.of(2026, 6, 13), "SBB");

        assertThat(result.units()).singleElement()
                .extracting(FormationUnitResponse::positionLabel)
                .isNull();
    }

    @Test
    void detect_mapsOperatorToEvuCode() {
        when(provider.getFormation(any(), any(), any())).thenReturn(List.of());
        LocalDate date = LocalDate.of(2026, 6, 13);

        service.detect("1", date, "SBB");          // mapped exception
        service.detect("2", date, "BLS-bls");      // normalized + mapped exception
        service.detect("3", date, "THURBO");       // operator name is the code
        service.detect("4", date, "SOB-sob");      // normalized to SOB
        service.detect("5", date, null);           // falls back to default

        ArgumentCaptor<String> evu = ArgumentCaptor.forClass(String.class);
        verify(provider, org.mockito.Mockito.times(5)).getFormation(any(), eq(date), evu.capture());
        assertThat(evu.getAllValues()).containsExactly("SBBP", "BLSP", "THURBO", "SOB", "SBBP");
    }
}
