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
        assertThat(cars.get(1).codes()).isEmpty();
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
    void returnsEmptyWhenNoTrainBody() {
        assertThat(FormationShortString.parse(null)).isEmpty();
        assertThat(FormationShortString.parse("@A,F,F,F")).isEmpty();
    }
}
