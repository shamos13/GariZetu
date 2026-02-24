package com.amos.garizetu.User;

import com.amos.garizetu.Service.UserService;
import com.amos.garizetu.User.DTO.Request.ForgotPasswordRequest;
import com.amos.garizetu.User.DTO.Request.UserLoginRequest;
import com.amos.garizetu.User.DTO.Request.UserRegistrationRequest;
import com.amos.garizetu.User.DTO.Response.LoginResponse;
import com.amos.garizetu.User.DTO.Response.UserResponseDTO;
import com.amos.garizetu.util.JWTUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {
    private static final String BEARER_PREFIX = "Bearer ";

    private final UserService userService;
    private final JWTUtil jwtUtil;

    @Value("${jwt.refresh-grace-ms:1800000}")
    private long refreshGraceMs;

    //Register a new User. return 201 response. Request Body JSON
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(
            @Valid @RequestBody UserRegistrationRequest request){
        log.info("Registering a new user: {}", request.getEmail());

        try {
            LoginResponse response = userService.registerUser(request);
            return ResponseEntity.status(201).body(response);
        } catch (RuntimeException e) {

            //if email already exists or another error
            log.error("Error registering user: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }

    }

    // Login and get JWT Token
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody UserLoginRequest request){
        log.info("Logging in user: {}", request.getEmail());

        try{
            LoginResponse response = userService.loginUser(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e){

            // if Email not found or password incorrect
            log.error("Error logging in user: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        log.info("Forgot-password request received for email: {}", request.getEmail());

        try {
            userService.resetPasswordByEmail(request.getEmail(), request.getNewPassword());
            return ResponseEntity.ok(Map.of("message", "Password reset successful. You can now sign in."));
        } catch (RuntimeException exception) {
            log.warn("Forgot-password failed for {}: {}", request.getEmail(), exception.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", exception.getMessage()));
        }
    }

    @GetMapping("/findusers")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponseDTO>> findAllUsers(){
        List<UserResponseDTO> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        String token = extractTokenFromHeader(authHeader);
        if (token == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Missing bearer token for refresh."));
        }

        try {
            if (!jwtUtil.isRefreshAllowed(token, refreshGraceMs)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Refresh token window has expired. Please sign in again."));
            }

            String email = jwtUtil.extractEmailAllowExpired(token);
            LoginResponse response = userService.refreshUserSession(email);
            return ResponseEntity.ok(response);
        } catch (RuntimeException exception) {
            log.warn("Token refresh failed: {}", exception.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Unable to refresh session. Please sign in again."));
        }
    }

    private String extractTokenFromHeader(String authHeader) {
        if (authHeader == null || authHeader.isBlank()) {
            return null;
        }

        String trimmed = authHeader.trim();
        if (trimmed.regionMatches(true, 0, BEARER_PREFIX, 0, BEARER_PREFIX.length())) {
            String token = trimmed.substring(BEARER_PREFIX.length()).trim();
            return token.isEmpty() ? null : token;
        }

        return trimmed.contains(" ") ? null : trimmed;
    }

}
