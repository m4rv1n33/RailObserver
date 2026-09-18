package ch.railobserver.meta;

import ch.railobserver.meta.dto.MetaResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// Says which instance this is. Prod and staging run on the same machine and are
// distinguished only by their compose project and .env, so without this the
// running app has no way to tell you which one you are looking at.
@RestController
@RequestMapping("/api/meta")
public class MetaController {

    private final MetaResponse meta;

    public MetaController(
            @Value("${railobserver.meta.server-name:}") String serverName,
            @Value("${railobserver.meta.environment:}") String environment) {
        this.meta = new MetaResponse(orNull(serverName), orNull(environment));
    }

    @GetMapping
    public MetaResponse get() {
        return meta;
    }

    private static String orNull(String value) {
        return value == null || value.isBlank() ? null : value.strip();
    }
}
