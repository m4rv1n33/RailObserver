package ch.railobserver.transport;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

// Parser for the opentransportdata FormationShortString, the per-position
// notation SBB's own visualizer uses (e.g. "[(2#NF,12#NF,2#BHP;NF,2)#NF]").
// Only the train body inside the outermost [ ... ] is relevant; the surrounding
// "F" / "@A" tokens describe platform sectors and are ignored.
//
// Inside the brackets, vehicles are comma-separated in running order. A vehicle
// is "<class>[#<attr>[;<attr>...]]" where class is 1, 2 or 12 (absent for a
// locomotive). Vehicles are wrapped in grouping brackets "( )"; an attribute
// after the closing ")" applies to the whole group, so it is propagated to every
// passenger car in that group (e.g. low-floor is marked once for the unit even
// when an individual car carries no per-car NF).
//
// The grouping brackets also delimit coupled units: every car inside one "( )"
// belongs to the same unit. This matters for trainsets like the RABe 501 Giruno
// whose 11 cars span two running-number blocks (501 0xx and 501 2xx), so the
// running number alone cannot tell that they form a single unit.
final class FormationShortString {

    // Attributes of one vehicle position: its travel class ("1"/"2"/"12" or null),
    // the set of attribute codes (NF, BHP, VH, ...) upper-cased, and the index of
    // the coupled unit it belongs to. Cars sharing a group index are one unit; a
    // car outside any "( )" gets its own index.
    record Attrs(String travelClass, Set<String> codes, int group) {
    }

    private FormationShortString() {
    }

    static List<Attrs> parse(String shortString) {
        if (shortString == null) {
            return List.of();
        }
        int open = shortString.indexOf('[');
        int close = shortString.lastIndexOf(']');
        if (open < 0 || close <= open) {
            return List.of();
        }
        String body = shortString.substring(open + 1, close).replaceAll("@[A-Za-z]+", "");

        List<String> classes = new ArrayList<>();
        List<Set<String>> codes = new ArrayList<>();
        List<Integer> groups = new ArrayList<>();
        int groupStart = -1;
        int currentGroup = -1;
        int nextGroup = 0;
        for (String raw : body.split(",")) {
            String token = raw.trim();
            if (token.startsWith("(")) {
                groupStart = classes.size();
                currentGroup = nextGroup++;
                token = token.substring(1);
            }
            int groupEnd = token.indexOf(')');
            String groupAttr = null;
            if (groupEnd >= 0) {
                groupAttr = token.substring(groupEnd + 1);
                token = token.substring(0, groupEnd);
            }
            if (!token.isEmpty()) {
                String[] parts = token.split("#");
                classes.add(switch (parts[0].trim()) {
                    case "1", "2", "12" -> parts[0].trim();
                    default -> null;
                });
                Set<String> vehicleCodes = new HashSet<>();
                for (int i = 1; i < parts.length; i++) {
                    addCodes(vehicleCodes, parts[i]);
                }
                codes.add(vehicleCodes);
                groups.add(currentGroup >= 0 ? currentGroup : nextGroup++);
            }
            if (groupEnd >= 0) {
                Set<String> groupCodes = new HashSet<>();
                addCodes(groupCodes, groupAttr);
                if (!groupCodes.isEmpty() && groupStart >= 0) {
                    for (int i = groupStart; i < classes.size(); i++) {
                        // Group attributes describe the passenger unit; do not
                        // attach them to a locomotive / power car (no class).
                        if (classes.get(i) != null) {
                            codes.get(i).addAll(groupCodes);
                        }
                    }
                }
                groupStart = -1;
                currentGroup = -1;
            }
        }

        List<Attrs> vehicles = new ArrayList<>(classes.size());
        for (int i = 0; i < classes.size(); i++) {
            vehicles.add(new Attrs(classes.get(i), Set.copyOf(codes.get(i)), groups.get(i)));
        }
        return vehicles;
    }

    private static void addCodes(Set<String> target, String raw) {
        if (raw == null) {
            return;
        }
        for (String code : raw.split("[#;]")) {
            if (!code.isBlank()) {
                target.add(code.trim().toUpperCase(Locale.ROOT));
            }
        }
    }
}
