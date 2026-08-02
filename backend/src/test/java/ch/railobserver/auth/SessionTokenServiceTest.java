package ch.railobserver.auth;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class SessionTokenServiceTest {

    private static final String SECRET = "unit-test-secret-that-is-long-enough-01";

    private final SessionTokenService service = new SessionTokenService(properties(SECRET, 365));

    @Test
    void acceptsTokenItIssued() {
        assertThat(service.isValid(service.issue())).isTrue();
    }

    @Test
    void issuesDistinctTokens() {
        assertThat(service.issue()).isNotEqualTo(service.issue());
    }

    @Test
    void rejectsTamperedSignature() {
        String token = service.issue();
        String tampered = token.substring(0, token.lastIndexOf('.') + 1) + "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

        assertThat(service.isValid(tampered)).isFalse();
    }

    @Test
    void rejectsTamperedExpiry() {
        String token = service.issue();
        String forged = "9999999999" + token.substring(token.indexOf('.'));

        assertThat(service.isValid(forged)).isFalse();
    }

    @Test
    void rejectsTokenSignedWithAnotherSecret() {
        SessionTokenService other = new SessionTokenService(properties("a-completely-different-secret-value-01", 365));

        assertThat(service.isValid(other.issue())).isFalse();
    }

    @Test
    void rejectsExpiredToken() {
        SessionTokenService expiring = new SessionTokenService(properties(SECRET, 0));

        assertThat(expiring.isValid(expiring.issue())).isFalse();
    }

    @Test
    void rejectsMissingOrMalformedToken() {
        assertThat(service.isValid(null)).isFalse();
        assertThat(service.isValid("")).isFalse();
        assertThat(service.isValid("nonsense")).isFalse();
    }

    private static AuthProperties properties(String secret, int sessionDays) {
        return new AuthProperties("4711", secret, sessionDays, true, 5, 15);
    }
}
