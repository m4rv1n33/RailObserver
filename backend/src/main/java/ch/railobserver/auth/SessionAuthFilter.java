package ch.railobserver.auth;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Set;

// Rejects every /api request without a valid session cookie. The auth endpoints
// themselves stay open so the client can log in and probe its session state, and
// so does /api/meta, which the lock screen reads before there is a session.
public class SessionAuthFilter extends OncePerRequestFilter {

    private static final String BODY = "{\"status\":401,\"message\":\"Authentication required\"}";

    // Matched exactly rather than by prefix: default-deny by path is what makes a
    // new controller under /api protected the moment it is written, and a prefix
    // here would quietly open anything that happens to start with the same text.
    private static final Set<String> OPEN_PATHS = Set.of("/api/meta");

    private final AuthService authService;

    public SessionAuthFilter(AuthService authService) {
        this.authService = authService;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String uri = request.getRequestURI();
        return !authService.isEnabled() || uri.startsWith("/api/auth/") || OPEN_PATHS.contains(uri);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        if (!authService.isAuthenticated(tokenOf(request))) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.getWriter().write(BODY);
            return;
        }
        chain.doFilter(request, response);
    }

    private String tokenOf(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return null;
        }
        for (Cookie cookie : cookies) {
            if (AuthService.COOKIE_NAME.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }
}
