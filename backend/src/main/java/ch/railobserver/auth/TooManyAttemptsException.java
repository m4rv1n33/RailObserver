package ch.railobserver.auth;

import java.time.Duration;
import java.time.Instant;

public class TooManyAttemptsException extends RuntimeException {

    private final Instant lockedUntil;

    public TooManyAttemptsException(Instant lockedUntil) {
        super("Too many failed attempts, try again later");
        this.lockedUntil = lockedUntil;
    }

    public long retryAfterSeconds() {
        return Math.max(1, Duration.between(Instant.now(), lockedUntil).toSeconds());
    }
}
