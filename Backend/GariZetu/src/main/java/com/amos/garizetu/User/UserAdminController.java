package com.amos.garizetu.User;

import com.amos.garizetu.Service.UserService;
import com.amos.garizetu.User.DTO.Response.UserResponseDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "http://localhost:5173")
public class UserAdminController {

    private final UserService userService;

    /**
     * GET /api/v1/admin/users
     *
     * Flow:
     * 1.Frontend sends request with JWT token in auth header
     * @PreAuthorize checks if role is ADMIN
     * */

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponseDTO>> getAllUsers(){
        log.info("Admin requesting all users");

        try {
            List<UserResponseDTO> users = userService.getAllUsers();

            log.info("Successfully retrieved {} users to admin", users.size());

            return ResponseEntity.ok(users);
        } catch (Exception e) {
            log.error("Error fetching users for admin: {}", e.getMessage());
            throw e;
        }
    }
}
