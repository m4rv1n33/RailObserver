package ch.railobserver.auth;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.env.Environment;

@Configuration
public class AuthConfig {

    private static final Logger log = LoggerFactory.getLogger(AuthConfig.class);
    private static final int MIN_SECRET_LENGTH = 32;

    // Fails fast rather than exposing an unprotected instance by accident. Local
    // runs (no "prod" profile) may leave the PIN unset and keep the API open.
    public AuthConfig(AuthProperties properties, Environment environment) {
        boolean production = environment.matchesProfiles("prod");

        if (!properties.isEnabled()) {
            if (production) {
                throw new IllegalStateException(
                        "RAILOBSERVER_AUTH_PIN must be set when running with the prod profile");
            }
            log.warn("Authentication disabled: no railobserver.auth.pin configured");
            return;
        }

        if (properties.secret().length() < MIN_SECRET_LENGTH) {
            throw new IllegalStateException(
                    "RAILOBSERVER_AUTH_SECRET must be at least " + MIN_SECRET_LENGTH + " characters");
        }
    }

    @Bean
    public FilterRegistrationBean<SessionAuthFilter> sessionAuthFilter(AuthService authService) {
        FilterRegistrationBean<SessionAuthFilter> registration =
                new FilterRegistrationBean<>(new SessionAuthFilter(authService));
        registration.addUrlPatterns("/api/*");
        registration.setOrder(Ordered.HIGHEST_PRECEDENCE);
        return registration;
    }
}
