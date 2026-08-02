package ch.railobserver.transport;

import ch.railobserver.transport.FormationShortString.Attrs;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class FormationShortStringTest {

    @Test
    void parsesDostoWithSectorMarkersAndAttributes() {
        // RABe 511 S5 at Zürich Altstetten: sector layout outside the brackets,
        // six vehicles inside, low-floor on most, wheelchair (BHP) and bike (VH).
        List<Attrs> cars = FormationShortString.parse(
                "@A,F,F,F@B,F,F@C,[(2#NF,12#NF@D,2#BHP;NF,2#VH;KW;NF@E,12#NF,2)#NF]@F,F,F,F,F");

        assertThat(cars).hasSize(6);
        assertThat(cars).extracting(Attrs::travelClass)
                .containsExactly("2", "12", "2", "2", "12", "2");
        assertThat(cars.get(0).codes()).containsExactly("NF");
        assertThat(cars.get(2).codes()).containsExactlyInAnyOrder("BHP", "NF");
        assertThat(cars.get(3).codes()).containsExactlyInAnyOrder("VH", "KW", "NF");
        // The group-level ")#NF" propagates low-floor to the whole unit, so the
        // last car is low-floor too even though it carries no per-car NF.
        assertThat(cars.get(5).codes()).containsExactly("NF");
        assertThat(cars).allSatisfy(car -> assertThat(car.codes()).contains("NF"));
    }

    @Test
    void parsesGtwWithLocomotivePosition() {
        // Thurbo GTW RABe 526: the power car ("D") has no travel class.
        List<Attrs> cars = FormationShortString.parse("[(2#VH,D,2#VH;NF,12)#VH]");

        assertThat(cars).hasSize(4);
        assertThat(cars).extracting(Attrs::travelClass).containsExactly("2", null, "2", "12");
        // The power car carries its "D" class-slot marker as a code, no amenities.
        assertThat(cars.get(1).codes()).containsExactly("D");
        assertThat(cars.get(2).codes()).containsExactlyInAnyOrder("VH", "NF");
    }

    @Test
    void groupsCarsWithinTheSameParentheses() {
        // One parenthesised unit: all six cars share a group index.
        List<Attrs> cars = FormationShortString.parse(
                "@A,F,[(2#NF,12#NF,2#BHP;NF,2#VH;KW;NF,12#NF,2)#NF]");

        assertThat(cars).extracting(Attrs::group).containsOnly(cars.get(0).group());
    }

    @Test
    void assignsSeparateGroupsToCoupledUnits() {
        // Two coupled RABe 501 Giruno units, in the positional "class:seq" notation
        // the API uses for them. Each parenthesised block is its own unit; the
        // eleven cars of a set all share one group index.
        List<Attrs> cars = FormationShortString.parse(
                "@D,F,[(2:1,2:2,2:3,2:4,2:5,2:6,WR:7,1:8,1:9,1:10,1):11@B,"
                        + "(2:21,2:22,2:23,2:24,2:25,2:26,WR:27,1:28,1:29,1:30,1):31]");

        assertThat(cars).hasSize(22);
        List<Integer> groups = cars.stream().map(Attrs::group).distinct().toList();
        assertThat(groups).hasSize(2);
        assertThat(cars.subList(0, 11)).extracting(Attrs::group).containsOnly(groups.get(0));
        assertThat(cars.subList(11, 22)).extracting(Attrs::group).containsOnly(groups.get(1));
    }

    @Test
    void capturesFamilyCoachMarkerFromClassSlot() {
        // RABe 502 (single unit): the family coach is marked "FA" in the class
        // slot, with its own attributes after the closing bracket (":8#KW;NF").
        // The marker must surface as a code so the family amenity is detected.
        List<Attrs> cars = FormationShortString.parse(
                "@A,F,[(1:1#VR;BZ;NF,1:2#VR;KW;NF,1:3#VR;NF,W2:4#BHP;NF,"
                        + "2:5#BHP;NF,2:6#VR;KW;NF,2:7#VR;KW;NF,FA):8#KW;NF],F,F");

        assertThat(cars).hasSize(8);
        Attrs family = cars.get(7);
        assertThat(family.codes()).contains("FA", "NF");
        // Its attributes stay on the car, not propagated to the rest of the unit.
        assertThat(cars.get(0).codes()).doesNotContain("FA");
    }

    @Test
    void groupsSecondUnitWhenItsBracketFollowsAnOrientationMarker() {
        // EC 24 Bellinzona, two coupled RABe 501 Giruno. The second unit's group
        // opens as "-(1": the leading "-" is the car orientation and must not hide
        // the bracket, otherwise those 11 cars end up ungrouped and the set is
        // reported as two separate units.
        List<Attrs> cars = FormationShortString.parse(
                "[(1:11,1:10#BZ,1:9#KW,1:8#BHP;NF,WR:7#BHP,2:6#BHP;NF,-2,2:4#KW,2:3#VR,2:2#KW,2):1,"
                        + "-(1,-1,-1,-1,-WR,-2,-2,-2,-2,-2,-2)]");

        assertThat(cars).hasSize(22);
        assertThat(cars.subList(0, 11)).extracting(Attrs::group).containsOnly(cars.get(0).group());
        assertThat(cars.subList(11, 22)).extracting(Attrs::group).containsOnly(cars.get(11).group());
        assertThat(cars.get(0).group()).isNotEqualTo(cars.get(11).group());
    }

    @Test
    void returnsEmptyWhenNoTrainBody() {
        assertThat(FormationShortString.parse(null)).isEmpty();
        assertThat(FormationShortString.parse("@A,F,F,F")).isEmpty();
    }
}
