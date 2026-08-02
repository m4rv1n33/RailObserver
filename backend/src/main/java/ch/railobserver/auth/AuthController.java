package ch.railobserver.auth;

import ch.railobserver.auth.dto.LoginRequest;
import ch.railobserver.auth.dto.SessionResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<Void> login(@Valid @RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        ResponseCookie cookie = authService.login(request.pin(), clientOf(httpRequest));
        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .build();
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, authService.logout().toString())
                .build();
    }

    @GetMapping("/session")
    public ResponseEntity<SessionResponse> session(
            @CookieValue(name = AuthService.COOKIE_NAME, required = false) String token) {
        boolean authenticated = authService.isAuthenticated(token);
        SessionResponse body = new SessionResponse(authenticated, authService.isEnabled());
        return authenticated ? ResponseEntity.ok(body) : ResponseEntity.status(401).body(body);
    }

    private String clientOf(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].strip();
        }
        return request.getRemoteAddr();
    }
}
