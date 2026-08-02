package ch.railobserver.auth;

import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;

// Stateless session tokens: "<expiryEpochSeconds>.<nonce>.<hmac>". Nothing is
// stored server side; rotating the secret invalidates every issued token.
@Service
public class SessionTokenService {

    private static final String ALGORITHM = "HmacSHA256";

    private final AuthProperties properties;
    private final SecureRandom random = new SecureRandom();
    private final Base64.Encoder encoder = Base64.getUrlEncoder().withoutPadding();

    public SessionTokenService(AuthProperties properties) {
        this.properties = properties;
    }

    public String issue() {
        byte[] nonce = new byte[12];
        random.nextBytes(nonce);
        String payload = Instant.now().plus(properties.sessionTtl()).getEpochSecond()
                + "." + encoder.encodeToString(nonce);
        return payload + "." + sign(payload);
    }

    public boolean isValid(String token) {
        if (token == null) {
            return false;
        }
        int separator = token.lastIndexOf('.');
        if (separator <= 0) {
            return false;
        }
        String payload = token.substring(0, separator);
        String signature = token.substring(separator + 1);

        byte[] expected = sign(payload).getBytes(StandardCharsets.UTF_8);
        byte[] actual = signature.getBytes(StandardCharsets.UTF_8);
        if (!MessageDigest.isEqual(expected, actual)) {
            return false;
        }

        return !isExpired(payload);
    }

    private boolean isExpired(String payload) {
        int dot = payload.indexOf('.');
        try {
            long expiresAt = Long.parseLong(dot < 0 ? payload : payload.substring(0, dot));
            return Instant.now().getEpochSecond() >= expiresAt;
        } catch (NumberFormatException e) {
            return true;
        }
    }

    private String sign(String payload) {
        try {
            Mac mac = Mac.getInstance(ALGORITHM);
            mac.init(new SecretKeySpec(properties.secret().getBytes(StandardCharsets.UTF_8), ALGORITHM));
            return encoder.encodeToString(mac.doFinal(payload.getBytes(StandardCharsets.UTF_8)));
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException("Cannot sign session token", e);
        }
    }
}
