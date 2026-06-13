package ch.railobserver.transport;

import ch.railobserver.transport.dto.DepartureResponse;
import ch.railobserver.transport.dto.StationResponse;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.List;

// transport.opendata.ch is a free public API for the Swiss public transport network, no API key required
@Component
public class OpendataChProvider implements TransportDataProvider {

    private static final Logger log = LoggerFactory.getLogger(OpendataChProvider.class);

    private final RestClient restClient;

    public OpendataChProvider(RestClient.Builder builder) {
        this.restClient = builder.baseUrl("https://transport.opendata.ch/v1").build();
    }

    @Override
    public List<StationResponse> searchStations(String query) {
        try {
            LocationsResponse response = restClient.get()
                    .uri(uriBuilder -> uriBuilder.path("/locations")
                            .queryParam("query", query)
                            .queryParam("type", "station")
                            .build())
                    .retrieve()
                    .body(LocationsResponse.class);
            if (response == null || response.stations() == null) {
                return List.of();
            }
            return response.stations().stream()
                    .filter(station -> station.id() != null && station.name() != null)
                    .map(station -> new StationResponse(station.id(), station.name()))
                    .toList();
        } catch (RestClientException e) {
            log.warn("Could not search stations for query '{}': {}", query, e.getMessage());
            return List.of();
        }
    }

    @Override
    public List<DepartureResponse> getDepartures(String station, int limit) {
        try {
            StationboardResponse response = restClient.get()
                    .uri(uriBuilder -> uriBuilder.path("/stationboard")
                            .queryParam("station", station)
                            .queryParam("limit", limit)
                            .build())
                    .retrieve()
                    .body(StationboardResponse.class);
            if (response == null || response.stationboard() == null) {
                return List.of();
            }
            return response.stationboard().stream()
                    .map(OpendataChProvider::toDeparture)
                    .toList();
        } catch (RestClientException e) {
            log.warn("Could not load departures for station '{}': {}", station, e.getMessage());
            return List.of();
        }
    }

    private static DepartureResponse toDeparture(Connection connection) {
        Instant departureTime = null;
        String platform = null;
        if (connection.stop() != null) {
            departureTime = toInstant(connection.stop());
            platform = connection.stop().platform();
        }
        // opendata.ch puts the journey/train number in "name" (e.g. "018654") and the line
        // in category + number (e.g. "S" + "6" -> "S6"). Do not confuse the two.
        return new DepartureResponse(buildLine(connection), connection.name(), connection.to(),
                departureTime, platform, connection.operator());
    }

    private static String buildLine(Connection connection) {
        String category = connection.category() == null ? "" : connection.category().trim();
        String number = connection.number() == null ? "" : connection.number().trim();
        String line = (category + number).trim();
        return line.isEmpty() ? null : line;
    }

    private static Instant toInstant(Stop stop) {
        if (stop.departureTimestamp() != null) {
            return Instant.ofEpochSecond(stop.departureTimestamp());
        }
        if (stop.departure() != null) {
            return OffsetDateTime.parse(stop.departure()).toInstant();
        }
        return null;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record LocationsResponse(List<Station> stations) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record Station(String id, String name) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record StationboardResponse(List<Connection> stationboard) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record Connection(String name, String category, String number, String to, String operator, Stop stop) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record Stop(String departure, Long departureTimestamp, String platform) {
    }
}
