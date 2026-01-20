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

    private final JWTUtil jwtUtil;

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

        // STEP 2: Check if header exists and starts with "Bearer "
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            // No token present - let the request continue
            // If this is a protected endpoint, Spring Security will block it later
            filterChain.doFilter(request, response);
            return;
        }

        try {
            // STEP 3: Extract the token (remove "Bearer " prefix)
            // "Bearer eyJhbGci..." → "eyJhbGci..."
            final String jwt = authHeader.substring(7);

            // STEP 4: Validate the token
            if (jwtUtil.validateToken(jwt)) {

                // STEP 5: Extract user information from the token
                String email = jwtUtil.extractEmail(jwt);
                String role = jwtUtil.extractRole(jwt);

                log.debug("JWT validated for user: {} with role: {}", email, role);

                // STEP 6: Create authentication object for Spring Security
                // This tells Spring Security: "This user is authenticated!"

                // Convert role string to Spring Security authority
                // "CUSTOMER" → "ROLE_CUSTOMER" (Spring Security convention)
                SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + role);

                // Create authentication token with user's email and role
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                                email,                          // Principal (who is this user?)
                                null,                           // Credentials (not needed - token is proof)
                                List.of(authority)              // Authorities (what can they do?)
                        );

                // Add request details (IP address, session info, etc.)
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // STEP 7: Store authentication in Spring Security context
                // This is like putting a stamp on the request saying "AUTHENTICATED"
                SecurityContextHolder.getContext().setAuthentication(authToken);

                log.debug("Authentication set in SecurityContext for user: {}", email);
            } else {
                log.warn("Invalid JWT token");
            }

        } catch (Exception e) {
            log.error("Cannot set user authentication: {}", e.getMessage());
        }

        // STEP 8: Continue to the next filter/controller
        filterChain.doFilter(request, response);
    }
}