package com.amos.garizetu.User;

import com.amos.garizetu.Service.UserService;
import com.amos.garizetu.User.DTO.Request.UserUpdateDTO;
import com.amos.garizetu.User.DTO.Response.UserResponseDTO;
import com.amos.garizetu.User.DTO.Response.UserStatsDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
@Slf4j
public class UserAdminController {

    private final UserService userService;

    /**
     * GET /api/v1/admin/users
     *
     * Flow:
     * 1.Frontend sends request with JWT token in auth header
     * @PreAuthorize checks if role is ADMIN
     * */

    @GetMapping("/allusers")
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

    //Get by ID
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponseDTO> getUserById(@PathVariable Long id){
        log.info("Admin retrieving user with id: {}", id);
        UserResponseDTO user = userService.getUserByIdDTO(id);
        return ResponseEntity.ok(user);
    }

    // Search users by name or email
    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponseDTO>> searchUsers(@RequestParam(required = false) String query){
        log.info("Admin searching for users with query: {}", query);
        List<UserResponseDTO> users = userService.searchUsers(query);
        return ResponseEntity.ok(users);
    }

    // Get user stats
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserStatsDTO> getUserStats(){
        log.info("Admin retrieving user stats");
        UserStatsDTO stats = userService.getUserStats();
        return ResponseEntity.ok(stats);
    }

    // Update Operation
    // Patch update user details
    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponseDTO> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserUpdateDTO updateDTO) {
        log.info("Admin updating user with ID: {}", id);

        UserResponseDTO updatedUser = userService.updateUser(id, updateDTO);

        log.info("Successfully updated user {}", id);

        return ResponseEntity.ok(updatedUser);
    }

    // Patch update role
    @PatchMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponseDTO> changeUserRole(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        log.info("Admin changing role for user {}", id);

        String roleStr = request.get("role");
        if (roleStr == null) {
            return ResponseEntity.badRequest().build();
        }

        try {
            UserRole newRole = UserRole.valueOf(roleStr.toUpperCase());
            UserResponseDTO updatedUser = userService.changeUserRole(id, newRole);

            log.info("Successfully changed user {} role to {}", id, newRole);

            return ResponseEntity.ok(updatedUser);
        } catch (IllegalArgumentException e) {
            log.error("Invalid role: {}", roleStr);
            return ResponseEntity.badRequest().build();
        }
    }

    // Block User accounts
    // PATCH /api/v1/admin/users{id}/block
    @PatchMapping("/{id}/block")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponseDTO> blockUser(@PathVariable Long id) {
        log.info("Admin blocking user with ID: {}", id);

        UserResponseDTO updatedUser = userService.blockUser(id);

        log.info("Successfully blocked user {}", id);

        return ResponseEntity.ok(updatedUser);
    }

    // Unblock user account
    // UseCase: Restore access after blocking
    @PatchMapping("/{id}/unblock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponseDTO> unblockUser(@PathVariable Long id) {
        log.info("Admin unblocking user with ID: {}", id);

        UserResponseDTO updatedUser = userService.unblockUser(id);

        log.info("Successfully unblocked user {}", id);
        return ResponseEntity.ok(updatedUser);
    }

    //================DELETE Operations===========
    // Soft Delete just marks as deleted
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id){
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    // Hard delete
    @DeleteMapping("/{id}/permanent")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> permanentDeleteUser(@PathVariable Long id){
        log.warn("Admin permanently deleting user with ID: {}", id);

        userService.permanentlyDeleteUser(id);

        log.warn("User {} permanently deleted",id);
        return ResponseEntity.noContent().build();
    }


}
