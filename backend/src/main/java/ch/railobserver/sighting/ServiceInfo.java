package ch.railobserver.sighting;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
public class ServiceInfo {

    @Column(name = "service_line")
    private String line;

    @Column(name = "service_train_number")
    private String trainNumber;

    @Column(name = "service_destination")
    private String destination;

    @Column(name = "service_departure_time")
    private Instant departureTime;

    public boolean isEmpty() {
        return line == null && trainNumber == null && destination == null && departureTime == null;
    }
}
