package ch.railobserver.auth;

import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseCookie;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class AuthServiceTest {

    private static final String CLIENT = "10.0.0.1";

    private final AuthService service = authService(new AuthProperties(
            "4711", "unit-test-secret-that-is-long-enough-01", 365, true, 3, 15));

    @Test
    void issuesSessionCookieForCorrectPin() {
        ResponseCookie cookie = service.login("4711", CLIENT);

        assertThat(cookie.getName()).isEqualTo(AuthService.COOKIE_NAME);
        assertThat(cookie.isHttpOnly()).isTrue();
        assertThat(cookie.isSecure()).isTrue();
        assertThat(cookie.getSameSite()).isEqualTo("Lax");
        assertThat(service.isAuthenticated(cookie.getValue())).isTrue();
    }

    @Test
    void rejectsWrongPin() {
        assertThatThrownBy(() -> service.login("0000", CLIENT)).isInstanceOf(InvalidPinException.class);
    }

    @Test
    void rejectsMissingOrEmptyPin() {
        assertThatThrownBy(() -> service.login(null, CLIENT)).isInstanceOf(InvalidPinException.class);
        assertThatThrownBy(() -> service.login("", CLIENT)).isInstanceOf(InvalidPinException.class);
    }

    @Test
    void locksOutAfterConfiguredFailures() {
        for (int i = 0; i < 3; i++) {
            assertThatThrownBy(() -> service.login("0000", CLIENT)).isInstanceOf(InvalidPinException.class);
        }

        // Even the correct PIN is refused while the lockout is active.
        assertThatThrownBy(() -> service.login("4711", CLIENT)).isInstanceOf(TooManyAttemptsException.class);
    }

    @Test
    void lockoutIsPerClient() {
        for (int i = 0; i < 3; i++) {
            assertThatThrownBy(() -> service.login("0000", CLIENT)).isInstanceOf(InvalidPinException.class);
        }

        assertThat(service.login("4711", "10.0.0.2")).isNotNull();
    }

    @Test
    void successfulLoginClearsFailureCount() {
        assertThatThrownBy(() -> service.login("0000", CLIENT)).isInstanceOf(InvalidPinException.class);
        assertThatThrownBy(() -> service.login("0000", CLIENT)).isInstanceOf(InvalidPinException.class);
        service.login("4711", CLIENT);

        assertThatThrownBy(() -> service.login("0000", CLIENT)).isInstanceOf(InvalidPinException.class);
        assertThatThrownBy(() -> service.login("0000", CLIENT)).isInstanceOf(InvalidPinException.class);
        assertThatThrownBy(() -> service.login("0000", CLIENT)).isInstanceOf(InvalidPinException.class);
        assertThatThrownBy(() -> service.login("4711", CLIENT)).isInstanceOf(TooManyAttemptsException.class);
    }

    @Test
    void logoutExpiresTheCookie() {
        assertThat(service.logout().getMaxAge().isZero()).isTrue();
    }

    @Test
    void treatsEveryRequestAsAuthenticatedWhenNoPinConfigured() {
        AuthService open = authService(new AuthProperties("", "", 365, true, 5, 15));

        assertThat(open.isEnabled()).isFalse();
        assertThat(open.isAuthenticated(null)).isTrue();
    }

    private static AuthService authService(AuthProperties properties) {
        return new AuthService(properties, new SessionTokenService(properties), new LoginAttemptService(properties));
    }
}
