package ch.railobserver.auth;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

// In-memory brute force guard. A short PIN is only a few thousand guesses wide,
// so attempts are throttled per client address. Restarting the app clears the
// counters, which is acceptable for a single-user deployment.
@Service
public class LoginAttemptService {

    private static final int MAX_TRACKED_CLIENTS = 1000;

    private final AuthProperties properties;
    private final Map<String, Attempts> attempts = new ConcurrentHashMap<>();

    public LoginAttemptService(AuthProperties properties) {
        this.properties = properties;
    }

    public void checkNotLocked(String client) {
        Attempts current = attempts.get(client);
        if (current != null && current.lockedUntil != null && Instant.now().isBefore(current.lockedUntil)) {
            throw new TooManyAttemptsException(current.lockedUntil);
        }
    }

    public void recordFailure(String client) {
        pruneIfNeeded();
        attempts.compute(client, (key, current) -> {
            Attempts updated = current == null || current.isStale() ? new Attempts() : current;
            updated.count++;
            if (updated.count >= properties.maxAttempts()) {
                updated.lockedUntil = Instant.now().plus(properties.lockout());
                updated.count = 0;
            }
            return updated;
        });
    }

    public void recordSuccess(String client) {
        attempts.remove(client);
    }

    private void pruneIfNeeded() {
        if (attempts.size() >= MAX_TRACKED_CLIENTS) {
            attempts.values().removeIf(Attempts::isStale);
        }
    }

    private static final class Attempts {
        private int count;
        private Instant lockedUntil;
        private final Instant createdAt = Instant.now();

        private boolean isStale() {
            boolean lockExpired = lockedUntil == null || Instant.now().isAfter(lockedUntil);
            return lockExpired && Instant.now().isAfter(createdAt.plusSeconds(3600));
        }
    }
}
