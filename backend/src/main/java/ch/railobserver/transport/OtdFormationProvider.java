package ch.railobserver.transport;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.time.LocalDate;
import java.util.List;
import java.util.Objects;

// opentransportdata.swiss Train Formation API. The access token is passed directly
// as a Bearer token. When no token is configured the provider is disabled and
// returns no data, leaving timetable lookup fully usable without formation.
@Component
public class OtdFormationProvider implements FormationProvider {

    private static final Logger log = LoggerFactory.getLogger(OtdFormationProvider.class);

    private final RestClient restClient;
    private final String token;
    private final boolean enabled;

    public OtdFormationProvider(
            RestClient.Builder builder,
            @Value("${railobserver.formation.base-url}") String baseUrl,
            @Value("${railobserver.formation.token:}") String token) {
        this.restClient = builder.baseUrl(baseUrl).build();
        this.token = token;
        this.enabled = token != null && !token.isBlank();
        if (!enabled) {
            log.info("Formation lookup disabled: no railobserver.formation.token configured");
        }
    }

    @Override
    public List<FormationVehicle> getFormation(String trainNumber, LocalDate operationDate, String evu) {
        if (!enabled || evu == null || evu.isBlank()) {
            return List.of();
        }
        String number = trainNumber == null ? "" : trainNumber.replaceFirst("^0+(?=\\d)", "").trim();
        if (number.isEmpty()) {
            return List.of();
        }
        LocalDate date = operationDate != null ? operationDate : LocalDate.now();
        try {
            FormationFullResponse response = restClient.get()
                    .uri(uriBuilder -> uriBuilder.path("/formations_full")
                            .queryParam("evu", evu)
                            .queryParam("operationDate", date.toString())
                            .queryParam("trainNumber", number)
                            .build())
                    .header("Authorization", "Bearer " + token)
                    .retrieve()
                    .body(FormationFullResponse.class);
            if (response == null || response.formations() == null) {
                return List.of();
            }
            return response.formations().stream()
                    .filter(formation -> formation.formationVehicles() != null)
                    .flatMap(formation -> formation.formationVehicles().stream())
                    .map(OtdFormationProvider::toVehicle)
                    .filter(Objects::nonNull)
                    .toList();
        } catch (HttpClientErrorException.NotFound | HttpClientErrorException.BadRequest e) {
            // Expected: 404 when no formation is published for this journey (e.g. a
            // non-standard set), 400 when the operator is not covered by the API.
            log.debug("No formation for train '{}' on {} (evu={}): {}", number, date, evu, e.getStatusCode());
            return List.of();
        } catch (RestClientException e) {
            log.warn("Could not load formation for train '{}' on {}: {}", number, date, e.getMessage());
            return List.of();
        }
    }

    // Map one API car node to our raw vehicle. Returns null when the node lacks
    // the identifying numbers we need. Unknown/missing rich fields degrade to
    // null/false rather than failing the whole lookup.
    private static FormationVehicle toVehicle(Node node) {
        VehicleIdentifier id = node.vehicleIdentifier();
        if (id == null || id.evn() == null || id.vehicleNumber() == null) {
            return null;
        }
        VehicleProperties props = node.vehicleProperties();
        return new FormationVehicle(
                node.position(),
                id.evn(),
                id.vehicleNumber(),
                id.typeCodeName(),
                travelClass(props),
                firstSectors(node.formationVehicleAtScheduledStops()),
                props != null && Boolean.TRUE.equals(props.lowFloorTrolley()),
                props != null && props.wheelchairSymbolProperties() != null);
    }

    private static String travelClass(VehicleProperties props) {
        if (props == null) {
            return null;
        }
        boolean first = positive(props.number1class());
        boolean second = positive(props.number2class());
        if (first && second) {
            return "12";
        }
        if (first) {
            return "1";
        }
        return second ? "2" : null;
    }

    private static boolean positive(Integer value) {
        return value != null && value > 0;
    }

    // Sectors can vary per scheduled stop; the boarding diagram only needs one
    // representative span, so take the first non-blank value.
    private static String firstSectors(List<ScheduledStop> stops) {
        if (stops == null) {
            return null;
        }
        return stops.stream()
                .map(ScheduledStop::sectors)
                .filter(s -> s != null && !s.isBlank())
                .findFirst()
                .orElse(null);
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record FormationFullResponse(List<Formation> formations) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record Formation(List<Node> formationVehicles) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record Node(
            int position,
            VehicleIdentifier vehicleIdentifier,
            VehicleProperties vehicleProperties,
            List<ScheduledStop> formationVehicleAtScheduledStops) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record VehicleIdentifier(String evn, String vehicleNumber, String typeCodeName) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record VehicleProperties(
            Integer number1class,
            Integer number2class,
            Boolean lowFloorTrolley,
            Object wheelchairSymbolProperties) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record ScheduledStop(String sectors) {
    }
}
