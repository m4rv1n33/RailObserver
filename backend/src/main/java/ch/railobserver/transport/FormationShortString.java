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
// locomotive). Grouping brackets "( )" and any group-level attribute after ")"
// are not vehicle attributes and are stripped.
final class FormationShortString {

    // Attributes of one vehicle position: its travel class ("1"/"2"/"12" or null)
    // and the set of attribute codes (NF, BHP, VH, ...), upper-cased.
    record Attrs(String travelClass, Set<String> codes) {
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

        List<Attrs> vehicles = new ArrayList<>();
        for (String raw : body.split(",")) {
            String token = raw.trim().replaceFirst("^\\(+", "");
            int groupEnd = token.indexOf(')');
            if (groupEnd >= 0) {
                token = token.substring(0, groupEnd);
            }
            if (token.isEmpty()) {
                continue;
            }
            String[] parts = token.split("#");
            String travelClass = switch (parts[0].trim()) {
                case "1", "2", "12" -> parts[0].trim();
                default -> null;
            };
            Set<String> codes = new HashSet<>();
            for (int i = 1; i < parts.length; i++) {
                for (String code : parts[i].split(";")) {
                    if (!code.isBlank()) {
                        codes.add(code.trim().toUpperCase(Locale.ROOT));
                    }
                }
            }
            vehicles.add(new Attrs(travelClass, codes));
        }
        return vehicles;
    }
}
