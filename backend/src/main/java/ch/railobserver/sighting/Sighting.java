package ch.railobserver.sighting;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "sighting")
@Getter
@Setter
@NoArgsConstructor
public class Sighting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "observed_at", nullable = false)
    private Instant observedAt;

    private String station;

    private Double latitude;

    private Double longitude;

    private String direction;

    @Embedded
    private ServiceInfo service;

    private String notes;

    @OneToMany(mappedBy = "sighting", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("position")
    private List<SightingVehicle> vehicles = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }

    public void addVehicle(SightingVehicle sightingVehicle) {
        sightingVehicle.setSighting(this);
        vehicles.add(sightingVehicle);
    }
}
