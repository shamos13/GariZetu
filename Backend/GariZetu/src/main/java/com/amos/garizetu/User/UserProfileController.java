package com.amos.garizetu.User;

import com.amos.garizetu.Service.UserService;
import com.amos.garizetu.User.DTO.Request.PasswordChangeRequest;
import com.amos.garizetu.util.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/users/me")
@RequiredArgsConstructor
@Slf4j
public class UserProfileController {

    private final UserService userService;
    private final SecurityUtils securityUtils;

    @PatchMapping("/password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> changeMyPassword(@Valid @RequestBody PasswordChangeRequest request) {
        Long userId = securityUtils.getAuthenticatedUserId();
        log.info("Password change requested by user {}", userId);

        try {
            userService.changePassword(userId, request.getCurrentPassword(), request.getNewPassword());
            return ResponseEntity.ok(Map.of("message", "Password updated successfully."));
        } catch (RuntimeException exception) {
            log.warn("Password change failed for user {}: {}", userId, exception.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", exception.getMessage()));
        }
    }
}
