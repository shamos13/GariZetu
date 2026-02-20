package com.amos.garizetu.security;

import com.amos.garizetu.util.JWTUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Locale;
import java.util.List;

/**
 * JWT Authentication Filter
 *
 * This filter runs BEFORE every request to check for JWT tokens.
 * Think of it as a security guard at the entrance checking ID badges.
 *
 * The flow:
 * 1. Request comes in
 * 2. Filter checks: "Do you have an Authorization header?"
 * 3. If yes: Extract token, validate it, extract user info
 * 4. If valid: Tell Spring Security "this user is authenticated"
 * 5. Continue to controller
 *
 * If the token is invalid or missing, Spring Security will block the request
 * (unless the endpoint is marked as permitAll() in SecurityConfig)
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String AUTH_PATH_PREFIX = "/api/v1/auth/";
    private static final String AUTH_PATH = "/api/v1/auth";
    private static final String BEARER_PREFIX = "Bearer ";

    private final JWTUtil jwtUtil;

    @Override
    protected boolean shouldNotFilter(@NonNull HttpServletRequest request) {
        String path = request.getServletPath();
        return AUTH_PATH.equals(path) || path.startsWith(AUTH_PATH_PREFIX);
    }

    /**
     * This method is called for EVERY request.
     *
     * It checks if there's a JWT token and validates it.
     *
     * @param request The incoming HTTP request
     * @param response The HTTP response
     * @param filterChain The chain of filters to continue processing
     */
    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        // STEP 1: Get the Authorization header from the request
        // Example: "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5..."
        final String authHeader = request.getHeader("Authorization");
        final String jwt = extractTokenFromHeader(authHeader);

        // STEP 2: Continue when no usable token was provided.
        if (jwt == null) {
            // No token present - let the request continue
            // If this is a protected endpoint, Spring Security will block it later
            filterChain.doFilter(request, response);
            return;
        }

        try {
            // STEP 3: Validate the token
            if (jwtUtil.validateToken(jwt)) {

                // STEP 4: Extract user information from the token
                String email = jwtUtil.extractEmail(jwt);
                String role = jwtUtil.extractRole(jwt);

                log.debug("JWT validated for user: {} with role: {}", email, role);

                // STEP 5: Create authentication object for Spring Security
                // This tells Spring Security: "This user is authenticated!"

                // Convert role string to Spring Security authority
                // "CUSTOMER" → "ROLE_CUSTOMER" (Spring Security convention)
                String normalizedRole = role == null ? "" : role.trim().toUpperCase(Locale.ROOT);
                String authorityValue = normalizedRole.startsWith("ROLE_")
                        ? normalizedRole
                        : "ROLE_" + normalizedRole;
                SimpleGrantedAuthority authority = new SimpleGrantedAuthority(authorityValue);

                // Create authentication token with user's email and role
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                                email,                          // Principal (who is this user?)
                                null,                           // Credentials (not needed - token is proof)
                                List.of(authority)              // Authorities (what can they do?)
                        );

                // Add request details (IP address, session info, etc.)
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // STEP 6: Store authentication in Spring Security context
                // This is like putting a stamp on the request saying "AUTHENTICATED"
                if (SecurityContextHolder.getContext().getAuthentication() == null) {
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    log.debug("Authentication set in SecurityContext for user: {}", email);
                }
            } else {
                // Validation details are already logged in JWTUtil.
                log.debug("JWT validation failed");
            }

        } catch (Exception e) {
            log.error("Cannot set user authentication: {}", e.getMessage());
        }

        // STEP 7: Continue to the next filter/controller
        filterChain.doFilter(request, response);
    }

    private String extractTokenFromHeader(String authHeader) {
        if (authHeader == null || authHeader.isBlank()) {
            return null;
        }

        String trimmed = authHeader.trim();

        // Standard "Bearer <token>" header (case-insensitive).
        if (trimmed.regionMatches(true, 0, BEARER_PREFIX, 0, BEARER_PREFIX.length())) {
            String token = trimmed.substring(BEARER_PREFIX.length()).trim();
            return token.isEmpty() ? null : token;
        }

        // Compatibility for malformed "Bearer<token>" with missing whitespace.
        if (trimmed.regionMatches(true, 0, "Bearer", 0, "Bearer".length())) {
            String token = trimmed.substring("Bearer".length()).trim();
            return token.isEmpty() ? null : token;
        }

        // Compatibility: some clients send raw JWT in Authorization header (no scheme).
        // Only accept raw values with no whitespace to avoid parsing other auth schemes.
        return trimmed.contains(" ") ? null : trimmed;
    }
}
