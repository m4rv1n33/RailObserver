package ch.railobserver;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

// The datasource is set here so the test does not depend on a local .env file.
@SpringBootTest(properties = {
		"spring.datasource.url=jdbc:postgresql://localhost:5432/railobserver",
		"spring.datasource.username=railobserver",
		"spring.datasource.password=railobserver"
})
class RailObserverApplicationTests {

	@Test
	void contextLoads() {
	}

}
