package ch.railobserver.auth;

import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;

@Service
public class AuthService {

    public static final String COOKIE_NAME = "ro_session";

    private final AuthProperties properties;
    private final SessionTokenService tokens;
    private final LoginAttemptService attempts;

    public AuthService(AuthProperties properties, SessionTokenService tokens, LoginAttemptService attempts) {
        this.properties = properties;
        this.tokens = tokens;
        this.attempts = attempts;
    }

    public ResponseCookie login(String pin, String client) {
        attempts.checkNotLocked(client);

        if (!matches(pin)) {
            attempts.recordFailure(client);
            throw new InvalidPinException();
        }

        attempts.recordSuccess(client);
        return cookie(tokens.issue(), properties.sessionTtl());
    }

    public ResponseCookie logout() {
        return cookie("", Duration.ZERO);
    }

    public boolean isAuthenticated(String token) {
        return !properties.isEnabled() || tokens.isValid(token);
    }

    public boolean isEnabled() {
        return properties.isEnabled();
    }

    private boolean matches(String pin) {
        byte[] expected = properties.pin().getBytes(StandardCharsets.UTF_8);
        byte[] actual = (pin == null ? "" : pin).getBytes(StandardCharsets.UTF_8);
        return MessageDigest.isEqual(expected, actual);
    }

    // SameSite=Lax keeps the cookie off cross-site requests, which is what makes
    // separate CSRF tokens unnecessary here.
    private ResponseCookie cookie(String value, Duration maxAge) {
        return ResponseCookie.from(COOKIE_NAME, value)
                .httpOnly(true)
                .secure(properties.cookieSecure())
                .sameSite("Lax")
                .path("/")
                .maxAge(maxAge)
                .build();
    }
}
