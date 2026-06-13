package ch.railobserver.transport;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
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
    private final String evu;
    private final boolean enabled;

    public OtdFormationProvider(
            RestClient.Builder builder,
            @Value("${railobserver.formation.base-url}") String baseUrl,
            @Value("${railobserver.formation.token:}") String token,
            @Value("${railobserver.formation.default-evu:SBBP}") String evu) {
        this.restClient = builder.baseUrl(baseUrl).build();
        this.token = token;
        this.evu = evu;
        this.enabled = token != null && !token.isBlank();
        if (!enabled) {
            log.info("Formation lookup disabled: no railobserver.formation.token configured");
        }
    }

    @Override
    public List<FormationVehicle> getFormation(String trainNumber, LocalDate operationDate) {
        if (!enabled) {
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
                    .map(Node::vehicleIdentifier)
                    .filter(Objects::nonNull)
                    .filter(identifier -> identifier.evn() != null && identifier.vehicleNumber() != null)
                    .map(identifier -> new FormationVehicle(identifier.evn(), identifier.vehicleNumber()))
                    .toList();
        } catch (RestClientException e) {
            log.warn("Could not load formation for train '{}' on {}: {}", number, date, e.getMessage());
            return List.of();
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record FormationFullResponse(List<Formation> formations) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record Formation(List<Node> formationVehicles) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record Node(VehicleIdentifier vehicleIdentifier) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record VehicleIdentifier(String evn, String vehicleNumber) {
    }
}
