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
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Set;

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
            return toVehicles(response);
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

    private static List<FormationVehicle> toVehicles(FormationFullResponse response) {
        List<Node> nodes = response.formations().stream()
                .filter(formation -> formation.formationVehicles() != null)
                .flatMap(formation -> formation.formationVehicles().stream())
                .filter(node -> node.vehicleIdentifier() != null
                        && node.vehicleIdentifier().evn() != null
                        && node.vehicleIdentifier().vehicleNumber() != null)
                .sorted(Comparator.comparingInt(Node::position))
                .toList();

        // The short string carries the displayed per-wagon attributes (low-floor,
        // bike, wheelchair, ...) that the boolean properties omit. Use it when its
        // vehicle count lines up with the formation; otherwise fall back to the
        // properties alone.
        List<FormationShortString.Attrs> shortAttrs = FormationShortString.parse(firstShortString(response));
        boolean alignsByPosition = shortAttrs.size() == nodes.size();

        List<FormationVehicle> vehicles = new ArrayList<>(nodes.size());
        for (int i = 0; i < nodes.size(); i++) {
            FormationShortString.Attrs attrs = alignsByPosition ? shortAttrs.get(i) : null;
            vehicles.add(toVehicle(nodes.get(i), attrs));
        }
        return vehicles;
    }

    private static FormationVehicle toVehicle(Node node, FormationShortString.Attrs attrs) {
        VehicleIdentifier id = node.vehicleIdentifier();
        VehicleProperties props = node.vehicleProperties();
        if (props == null) {
            props = new VehicleProperties(null, null, null, null, null, null, null, null);
        }
        Set<String> codes = attrs != null ? attrs.codes() : Set.of();
        String travelClass = attrs != null && attrs.travelClass() != null ? attrs.travelClass() : travelClass(props);
        Integer unitGroup = attrs != null ? attrs.group() : null;
        return new FormationVehicle(
                node.position(),
                id.evn(),
                id.vehicleNumber(),
                id.typeCodeName(),
                travelClass,
                firstSectors(node.formationVehicleAtScheduledStops()),
                codes.contains("NF"),
                codes.contains("BHP") || hasWheelchairAccess(props),
                codes.contains("VH") || codes.contains("VR")
                        || Boolean.TRUE.equals(props.bikePlatform()) || positive(props.numberBikeHooks()),
                codes.contains("WR") || positive(props.numberRestaurantSpace()),
                codes.contains("FA") || codes.contains("FZ") || picto(props, PictoProperties::familyZonePicto),
                codes.contains("BZ") || picto(props, PictoProperties::businessZonePicto),
                unitGroup);
    }

    private static String firstShortString(FormationFullResponse response) {
        if (response.formationsAtScheduledStops() == null) {
            return null;
        }
        return response.formationsAtScheduledStops().stream()
                .filter(stop -> stop.formationShort() != null)
                .map(stop -> stop.formationShort().formationShortString())
                .filter(s -> s != null && !s.isBlank())
                .findFirst()
                .orElse(null);
    }

    private static String travelClass(VehicleProperties props) {
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

    // A car offers wheelchair access if it has a dedicated disabled compartment,
    // reserved wheelchair spaces, or carries the wheelchair pictogram.
    private static boolean hasWheelchairAccess(VehicleProperties props) {
        AccessibilityProperties access = props.accessibilityProperties();
        if (access != null
                && (Boolean.TRUE.equals(access.disabledCompartment()) || positive(access.numberWheelchairSpaces()))) {
            return true;
        }
        return picto(props, PictoProperties::wheelchairPicto);
    }

    private static boolean picto(VehicleProperties props, java.util.function.Function<PictoProperties, Boolean> field) {
        PictoProperties pictos = props.pictoProperties();
        return pictos != null && Boolean.TRUE.equals(field.apply(pictos));
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
    private record FormationFullResponse(List<Formation> formations, List<FormationAtStop> formationsAtScheduledStops) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record Formation(List<Node> formationVehicles) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record FormationAtStop(FormationShort formationShort) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record FormationShort(String formationShortString) {
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
            Boolean bikePlatform,
            Integer numberBikeHooks,
            Integer numberRestaurantSpace,
            AccessibilityProperties accessibilityProperties,
            PictoProperties pictoProperties) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record AccessibilityProperties(Boolean disabledCompartment, Integer numberWheelchairSpaces) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record PictoProperties(Boolean familyZonePicto, Boolean businessZonePicto, Boolean wheelchairPicto) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record ScheduledStop(String sectors) {
    }
}
