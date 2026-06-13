package ch.railobserver.transport;

import ch.railobserver.transport.dto.DepartureResponse;
import ch.railobserver.transport.dto.StationResponse;

import java.time.LocalDateTime;
import java.util.List;

public interface TransportDataProvider {

    List<StationResponse> searchStations(String query);

    // when is the local board time to query; null means now. Passing a past time
    // lets a sighting logged after the fact still pick up the right departure.
    List<DepartureResponse> getDepartures(String station, int limit, LocalDateTime when);
}
