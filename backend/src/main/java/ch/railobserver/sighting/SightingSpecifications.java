package ch.railobserver.sighting;

import jakarta.persistence.criteria.Join;
import org.springframework.data.jpa.domain.Specification;

import java.time.Instant;

public final class SightingSpecifications {

    private SightingSpecifications() {
    }

    public static Specification<Sighting> hasLocation() {
        return (root, query, cb) -> cb.and(
                cb.isNotNull(root.get("latitude")),
                cb.isNotNull(root.get("longitude"))
        );
    }

    public static Specification<Sighting> hasVehicle(Long vehicleId) {
        return (root, query, cb) -> {
            query.distinct(true);
            Join<Object, Object> sightingVehicle = root.join("vehicles");
            Join<Object, Object> vehicle = sightingVehicle.join("vehicle");
            return cb.equal(vehicle.get("id"), vehicleId);
        };
    }

    public static Specification<Sighting> hasFleet(Long fleetId) {
        return (root, query, cb) -> {
            query.distinct(true);
            Join<Object, Object> sightingVehicle = root.join("vehicles");
            Join<Object, Object> vehicle = sightingVehicle.join("vehicle");
            Join<Object, Object> vehicleType = vehicle.join("vehicleType");
            return cb.equal(vehicleType.get("id"), fleetId);
        };
    }

    public static Specification<Sighting> observedAfter(Instant from) {
        return (root, query, cb) -> cb.greaterThanOrEqualTo(root.get("observedAt"), from);
    }

    public static Specification<Sighting> observedBefore(Instant to) {
        return (root, query, cb) -> cb.lessThanOrEqualTo(root.get("observedAt"), to);
    }
}
