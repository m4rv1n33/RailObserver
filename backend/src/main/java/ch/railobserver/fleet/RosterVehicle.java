package ch.railobserver.fleet;

import ch.railobserver.vehicletype.VehicleType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// One expected vehicle of a fleet: the canonical roster against which sightings
// are partitioned into seen/missing. Seeded from real running numbers, replacing
// the former synthetic 1..fleetSize range.
@Entity
@Table(name = "roster_vehicle")
@Getter
@Setter
@NoArgsConstructor
public class RosterVehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_type_id", nullable = false)
    private VehicleType vehicleType;

    @Column(nullable = false, unique = true)
    private String number;
}
