package ch.railobserver.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;

// Loads key=value pairs from a local .env file (if present) into the Spring
// Environment, so secrets like OTD_API_TOKEN can live in backend/.env instead of
// being exported by hand. The file is optional and real environment variables
// take precedence, so deployments that inject configuration directly are unaffected.
public class DotenvEnvironmentPostProcessor implements EnvironmentPostProcessor {

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        Path envFile = Path.of(".env");
        if (!Files.isRegularFile(envFile)) {
            return;
        }

        Map<String, Object> values = new HashMap<>();
        try {
            for (String line : Files.readAllLines(envFile)) {
                String trimmed = line.strip();
                if (trimmed.isEmpty() || trimmed.startsWith("#")) {
                    continue;
                }
                int separator = trimmed.indexOf('=');
                if (separator <= 0) {
                    continue;
                }
                String key = trimmed.substring(0, separator).strip();
                String value = unquote(trimmed.substring(separator + 1).strip());
                values.put(key, value);
            }
        } catch (IOException e) {
            return;
        }

        if (!values.isEmpty()) {
            // addLast: real environment variables and system properties keep priority.
            environment.getPropertySources().addLast(new MapPropertySource("dotenv", values));
        }
    }

    private static String unquote(String value) {
        if (value.length() >= 2
                && (value.charAt(0) == '"' || value.charAt(0) == '\'')
                && value.charAt(value.length() - 1) == value.charAt(0)) {
            return value.substring(1, value.length() - 1);
        }
        return value;
    }
}
