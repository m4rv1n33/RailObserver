package ch.railobserver.auth;

import ch.railobserver.common.exception.GlobalExceptionHandler;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// Covers the rule that matters most: no valid session cookie, no access to the
// data endpoints. A stub controller stands in for the real ones so the test
// needs no database.
class AuthEndpointTest {

    @RestController
    static class StubController {
        @GetMapping("/api/sightings")
        String sightings() {
            return "[]";
        }
    }

    private final AuthProperties properties =
            new AuthProperties("4711", "unit-test-secret-that-is-long-enough-01", 365, true, 5, 15);
    private final AuthService authService = new AuthService(
            properties, new SessionTokenService(properties), new LoginAttemptService(properties));
    private final MockMvc mvc = mockMvc(authService);

    @Test
    void rejectsProtectedEndpointWithoutCookie() throws Exception {
        mvc.perform(get("/api/sightings")).andExpect(status().isUnauthorized());
    }

    @Test
    void allowsProtectedEndpointWithSessionCookie() throws Exception {
        mvc.perform(get("/api/sightings").cookie(login())).andExpect(status().isOk());
    }

    @Test
    void rejectsTamperedCookie() throws Exception {
        Cookie tampered = new Cookie(AuthService.COOKIE_NAME, login().getValue() + "x");

        mvc.perform(get("/api/sightings").cookie(tampered)).andExpect(status().isUnauthorized());
    }

    @Test
    void reportsSessionStateWithoutCookie() throws Exception {
        mvc.perform(get("/api/auth/session"))
                .andExpect(status().isUnauthorized())
                .andExpect(result -> assertThat(result.getResponse().getContentAsString())
                        .contains("\"authenticated\":false")
                        .contains("\"authRequired\":true"));
    }

    @Test
    void logoutClearsTheCookie() throws Exception {
        MvcResult result = mvc.perform(post("/api/auth/logout").cookie(login()))
                .andExpect(status().isNoContent())
                .andReturn();

        Cookie cleared = result.getResponse().getCookie(AuthService.COOKIE_NAME);
        assertThat(cleared).isNotNull();
        assertThat(cleared.getMaxAge()).isZero();
        assertThat(authService.isAuthenticated(cleared.getValue())).isFalse();
    }

    @Test
    void rejectsWrongPinAndThrottlesRepeatedAttempts() throws Exception {
        for (int i = 0; i < 5; i++) {
            mvc.perform(loginRequest("0000")).andExpect(status().isUnauthorized());
        }

        mvc.perform(loginRequest("0000")).andExpect(status().isTooManyRequests());
    }

    @Test
    void leavesEndpointsOpenWhenNoPinConfigured() throws Exception {
        AuthProperties open = new AuthProperties("", "", 365, true, 5, 15);
        MockMvc openMvc = mockMvc(new AuthService(open, new SessionTokenService(open), new LoginAttemptService(open)));

        openMvc.perform(get("/api/sightings")).andExpect(status().isOk());
    }

    private Cookie login() throws Exception {
        MvcResult result = mvc.perform(loginRequest("4711"))
                .andExpect(status().isNoContent())
                .andReturn();

        Cookie cookie = result.getResponse().getCookie(AuthService.COOKIE_NAME);
        assertThat(cookie).isNotNull();
        return cookie;
    }

    private static org.springframework.test.web.servlet.RequestBuilder loginRequest(String pin) {
        return post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"pin\":\"" + pin + "\"}");
    }

    private static MockMvc mockMvc(AuthService authService) {
        return MockMvcBuilders.standaloneSetup(new AuthController(authService), new StubController())
                .setControllerAdvice(new GlobalExceptionHandler())
                .addFilters(new SessionAuthFilter(authService))
                .build();
    }
}
