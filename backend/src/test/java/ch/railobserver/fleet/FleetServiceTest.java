package ch.railobserver.fleet;

import ch.railobserver.fleet.dto.FleetDetailResponse;
import ch.railobserver.fleet.dto.FleetSummaryResponse;
import ch.railobserver.fleet.projection.FleetNumberProjection;
import ch.railobserver.fleet.projection.SeenVehicleProjection;
import ch.railobserver.vehicletype.VehicleType;
import ch.railobserver.vehicletype.VehicleTypeRepository;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class FleetServiceTest {

    private final VehicleTypeRepository vehicleTypeRepository = mock(VehicleTypeRepository.class);
    private final FleetStatisticsRepository fleetStatisticsRepository = mock(FleetStatisticsRepository.class);
    private final RosterVehicleRepository rosterVehicleRepository = mock(RosterVehicleRepository.class);
    private final FleetService service =
            new FleetService(vehicleTypeRepository, fleetStatisticsRepository, rosterVehicleRepository);

    @Test
    void detailPartitionsRosterIntoSeenAndMissing() {
        VehicleType type = vehicleType(1L, "Re 460");
        when(vehicleTypeRepository.findById(1L)).thenReturn(Optional.of(type));
        when(rosterVehicleRepository.findNumbersByVehicleTypeId(1L))
                .thenReturn(List.of("460-000", "460-001", "460-002"));
        when(fleetStatisticsRepository.findSeenVehicles(1L))
                .thenReturn(List.of(seen(10L, "460-002"), seen(11L, "460-000")));

        FleetDetailResponse response = service.findById(1L);

        assertThat(response.fleetSize()).isEqualTo(3);
        assertThat(response.seenCount()).isEqualTo(2);
        assertThat(response.missingCount()).isEqualTo(1);
        assertThat(response.seenVehicles()).extracting("number").containsExactly("460-000", "460-002");
        assertThat(response.seenVehicles()).extracting("id").containsExactly(11L, 10L);
        assertThat(response.missingNumbers()).containsExactly("460-001");
    }

    @Test
    void detailWithoutRosterReportsAllSeenAndNoMissing() {
        VehicleType type = vehicleType(2L, "RABe 515");
        when(vehicleTypeRepository.findById(2L)).thenReturn(Optional.of(type));
        when(rosterVehicleRepository.findNumbersByVehicleTypeId(2L)).thenReturn(List.of());
        when(fleetStatisticsRepository.findSeenVehicles(2L))
                .thenReturn(List.of(seen(20L, "515-005"), seen(21L, "515-001")));

        FleetDetailResponse response = service.findById(2L);

        assertThat(response.fleetSize()).isNull();
        assertThat(response.seenCount()).isEqualTo(2);
        assertThat(response.missingCount()).isZero();
        assertThat(response.seenVehicles()).extracting("number").containsExactly("515-001", "515-005");
        assertThat(response.missingNumbers()).isEmpty();
    }

    @Test
    void summaryDerivesFleetSizeFromRosterAndCountsOnlyRosterMembersAsSeen() {
        VehicleType withRoster = vehicleType(1L, "Re 460");
        VehicleType withoutRoster = vehicleType(2L, "RABe 515");
        when(vehicleTypeRepository.findAll()).thenReturn(List.of(withRoster, withoutRoster));
        when(rosterVehicleRepository.findAllNumbersByFleet())
                .thenReturn(List.of(number(1L, "460-000"), number(1L, "460-001"), number(1L, "460-002")));
        // "460-999" is sighted but not in the roster, so it must not inflate seenCount.
        when(fleetStatisticsRepository.findSeenNumbersByFleet())
                .thenReturn(List.of(number(1L, "460-000"), number(1L, "460-999"), number(2L, "515-001")));

        List<FleetSummaryResponse> responses = service.findAll();

        FleetSummaryResponse rostered = responses.stream().filter(r -> r.id().equals(1L)).findFirst().orElseThrow();
        assertThat(rostered.fleetSize()).isEqualTo(3);
        assertThat(rostered.seenCount()).isEqualTo(1);
        assertThat(rostered.missingCount()).isEqualTo(2);

        FleetSummaryResponse unrostered = responses.stream().filter(r -> r.id().equals(2L)).findFirst().orElseThrow();
        assertThat(unrostered.fleetSize()).isNull();
        assertThat(unrostered.seenCount()).isEqualTo(1);
        assertThat(unrostered.missingCount()).isZero();
    }

    private static VehicleType vehicleType(Long id, String name) {
        VehicleType type = new VehicleType();
        type.setId(id);
        type.setName(name);
        return type;
    }

    private static SeenVehicleProjection seen(Long id, String number) {
        return new SeenVehicleProjection() {
            public Long getId() {
                return id;
            }

            public String getNumber() {
                return number;
            }
        };
    }

    private static FleetNumberProjection number(Long vehicleTypeId, String number) {
        return new FleetNumberProjection() {
            public Long getVehicleTypeId() {
                return vehicleTypeId;
            }

            public String getNumber() {
                return number;
            }
        };
    }
}
