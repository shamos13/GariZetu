package com.amos.garizetu.util;

import com.amos.garizetu.Repository.UserRepository;
import com.amos.garizetu.User.Entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SecurityUtils {

    private final UserRepository userRepository;

    /**
     * Resolve the authenticated application's user ID from Spring Security context.
     *
     * Notes for this project:
     * - JWT filter stores email as principal (String), not User entity
     * - We map that email to User in DB to get a trusted userId
     */
    public Long getAuthenticatedUserId() {
        Authentication authentication = SecurityContextHolder
                .getContext()
                .getAuthentication();

        // guard against unauthenticated requests
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("No authenticated user found");
        }

        Object principal = authentication.getPrincipal();

        // If principal is already our User entity, use it directly.
        if (principal instanceof User user) {
            return user.getUserId();
        }

        // If principal is a Spring UserDetails implementation, read username/email.
        if (principal instanceof UserDetails userDetails) {
            return resolveUserIdByEmail(userDetails.getUsername());
        }

        // JwtAuthenticationFilter currently stores principal as email String.
        if (principal instanceof String email && !"anonymousUser".equalsIgnoreCase(email)) {
            return resolveUserIdByEmail(email);
        }

        throw new RuntimeException("Unsupported authentication principal type");
    }

    /**
     * Role check helper so service layer can enforce ownership/admin rules.
     */
    public boolean hasRole(String role) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getAuthorities() == null) {
            return false;
        }
        String requiredAuthority = "ROLE_" + role;
        return authentication.getAuthorities().stream()
                .anyMatch(authority -> requiredAuthority.equals(authority.getAuthority()));
    }

    private Long resolveUserIdByEmail(String email) {
        return userRepository.findByEmailIgnoreCase(email)
                .map(User::getUserId)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found for email: " + email));
    }
}
