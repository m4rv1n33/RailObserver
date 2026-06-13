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
        // The trailing group-level attribute ")#NF" is not a vehicle attribute.
        assertThat(cars.get(5).codes()).isEmpty();
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
    void returnsEmptyWhenNoTrainBody() {
        assertThat(FormationShortString.parse(null)).isEmpty();
        assertThat(FormationShortString.parse("@A,F,F,F")).isEmpty();
    }
}
