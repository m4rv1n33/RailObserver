package ch.railobserver.transport;

import ch.railobserver.transport.dto.DepartureResponse;
import ch.railobserver.transport.dto.StationResponse;

import java.util.List;

public interface TransportDataProvider {

    List<StationResponse> searchStations(String query);

    List<DepartureResponse> getDepartures(String station, int limit);
}
