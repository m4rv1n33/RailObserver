package ch.railobserver.auth;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Component
public class AuthProperties {

    private final String pin;
    private final String secret;
    private final Duration sessionTtl;
    private final boolean cookieSecure;
    private final int maxAttempts;
    private final Duration lockout;

    public AuthProperties(
            @Value("${railobserver.auth.pin:}") String pin,
            @Value("${railobserver.auth.secret:}") String secret,
            @Value("${railobserver.auth.session-days:365}") int sessionDays,
            @Value("${railobserver.auth.cookie-secure:true}") boolean cookieSecure,
            @Value("${railobserver.auth.max-attempts:5}") int maxAttempts,
            @Value("${railobserver.auth.lockout-minutes:15}") int lockoutMinutes) {
        this.pin = pin == null ? "" : pin.strip();
        this.secret = secret == null ? "" : secret.strip();
        this.sessionTtl = Duration.ofDays(sessionDays);
        this.cookieSecure = cookieSecure;
        this.maxAttempts = maxAttempts;
        this.lockout = Duration.ofMinutes(lockoutMinutes);
    }

    // Without a PIN there is nothing to check, so the API stays open. This keeps
    // local development friction-free; AuthStartupCheck refuses to start a
    // deployed instance in that state.
    public boolean isEnabled() {
        return !pin.isEmpty();
    }

    public String pin() {
        return pin;
    }

    public String secret() {
        return secret;
    }

    public Duration sessionTtl() {
        return sessionTtl;
    }

    public boolean cookieSecure() {
        return cookieSecure;
    }

    public int maxAttempts() {
        return maxAttempts;
    }

    public Duration lockout() {
        return lockout;
    }
}
