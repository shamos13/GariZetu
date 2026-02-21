package com.amos.garizetu.security;

import lombok.RequiredArgsConstructor;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
// Required for @PreAuthorize annotations in controllers/services to actually be enforced.
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CorsConfigurationSource corsConfigurationSource;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }


    /**
     * Security filter chain configuration.
     *
     * This is where we define:
     * - Which URLs are public vs protected
     * - How to handle authentication
     * - Session management (stateless for JWT)
     *
     * @param http HttpSecurity configuration object
     * @return Configured SecurityFilterChain
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // STEP 1: Disable CSRF (not needed for stateless JWT APIs)
                .csrf(csrf -> csrf.disable())

                // STEP 2: Enable CORS (allows frontend at localhost:5173 to call API)
                .cors(cors -> cors.configurationSource(corsConfigurationSource))

                // STEP 3: Configure which endpoints require authentication
                .authorizeHttpRequests(auth -> auth

                        // CORS preflight - must be public or browser blocks all API calls
                        .requestMatchers(HttpMethod.OPTIONS, "/api/**").permitAll()

                        // PUBLIC endpoints - anyone can access without token
                        .requestMatchers("/api/v1/auth/**").permitAll()
                        .requestMatchers("/api/v1/cars/**").permitAll()
                        .requestMatchers("/api/v1/contact/**").permitAll()

                        // ADMIN-ONLY endpoints (@PreAuthorize does role checking)
                        .requestMatchers("/api/v1/admin/users/**").authenticated()
                        .requestMatchers("/api/v1/admin/cars/**").authenticated()

                        // PROTECTED endpoints - require valid JWT token
                        .anyRequest().authenticated()
                )

                // STEP 3: Configure session management
                // We use STATELESS because we're using JWT tokens
                // Server doesn't store session data - everything is in the token!
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                // STEP 4: Return clear auth error codes for API clients.
                // 401 = not authenticated (missing/invalid token), 403 = authenticated but not allowed.
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint((request, response, authException) ->
                                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized"))
                        .accessDeniedHandler((request, response, accessDeniedException) ->
                                response.sendError(HttpServletResponse.SC_FORBIDDEN, "Forbidden"))
                )

                // STEP 5: Add our JWT filter before Spring Security's username/password filter
                // This filter runs FIRST to check for JWT tokens in requests
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
