package ch.railobserver.auth;

import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class AuthConfigTest {

    private static final String SECRET = "unit-test-secret-that-is-long-enough-01";

    @Test
    void refusesToStartInProductionWithoutPin() {
        assertThatThrownBy(() -> new AuthConfig(properties("", ""), environment("prod")))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("RAILOBSERVER_AUTH_PIN");
    }

    @Test
    void refusesShortSecret() {
        assertThatThrownBy(() -> new AuthConfig(properties("4711", "too-short"), environment()))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("RAILOBSERVER_AUTH_SECRET");
    }

    @Test
    void allowsDisabledAuthOutsideProduction() {
        assertThatCode(() -> new AuthConfig(properties("", ""), environment())).doesNotThrowAnyException();
    }

    @Test
    void registersFilterForApiRequestsOnly() {
        AuthConfig config = new AuthConfig(properties("4711", SECRET), environment("prod"));
        AuthProperties properties = properties("4711", SECRET);
        AuthService service = new AuthService(
                properties, new SessionTokenService(properties), new LoginAttemptService(properties));

        assertThat(config.sessionAuthFilter(service).getUrlPatterns()).containsExactly("/api/*");
    }

    private static AuthProperties properties(String pin, String secret) {
        return new AuthProperties(pin, secret, 365, true, 5, 15);
    }

    private static MockEnvironment environment(String... profiles) {
        MockEnvironment environment = new MockEnvironment();
        environment.setActiveProfiles(profiles);
        return environment;
    }
}
