package com.amos.garizetu.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

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

                // STEP 2: Configure which endpoints require authentication
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/v1/cars/admin/**").hasRole("ADMIN")
                        // PUBLIC endpoints - anyone can access without token
                        .requestMatchers("/api/v1/auth/**").permitAll()// Registration & Login
                        .requestMatchers("/api/v1/cars/**").permitAll()


                        // PROTECTED endpoints - require valid JWT token
                        .anyRequest().authenticated()  // Everything else needs authentication
                )

                // STEP 3: Configure session management
                // We use STATELESS because we're using JWT tokens
                // Server doesn't store session data - everything is in the token!
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                // STEP 4: Add our JWT filter before Spring Security's username/password filter
                // This filter runs FIRST to check for JWT tokens in requests
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
