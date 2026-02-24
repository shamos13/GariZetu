package com.amos.garizetu.Service;

import com.amos.garizetu.Repository.UserRepository;
import com.amos.garizetu.User.DTO.Request.UserLoginRequest;
import com.amos.garizetu.User.DTO.Request.UserRegistrationRequest;
import com.amos.garizetu.User.DTO.Request.UserUpdateDTO;
import com.amos.garizetu.User.DTO.Response.LoginResponse;
import com.amos.garizetu.User.DTO.Response.UserResponseDTO;
import com.amos.garizetu.User.DTO.Response.UserStatsDTO;
import com.amos.garizetu.User.Entity.User;
import com.amos.garizetu.User.UserRole;
import com.amos.garizetu.User.UserStatus;
import com.amos.garizetu.User.mapper.UserMapper;
import com.amos.garizetu.util.JWTUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JWTUtil jwtUtil;
    private final UserMapper userMapper;


    // Helper method that allows auto sign in
    private LoginResponse createAuthResponse(User user) {
        String token = jwtUtil.generateToken(
                user.getEmail(),
                user.getUserRole().name()
        );

        return userMapper.toLoginResponse(user, token);
    }
    /**
     * Register a new user.
     *
     * Steps:
     * 1. Check if email already exists (prevent duplicates)
     * 2. Map DTO to entity
     * 3. Hash the password (NEVER store plain text!)
     * 4. Set role to CUSTOMER (users can't make themselves admins)
     * 5. Save to database
     * 6. Return success message
     *
     * @param request Registration data from the user
     * @return Success message
     * @throws RuntimeException if email already exists
     */

    public LoginResponse registerUser(UserRegistrationRequest request) {
        log.info("Registering user with email: {}", request.getEmail());

        // Step 1: check if email exists
        if (userRepository.existsByEmailIgnoreCase(request.getEmail())){
            log.warn("Email {} already exists", request.getEmail());
            throw new RuntimeException("Email already registered: " + request.getEmail());
        }

        //Step 2: Convert DTO to entity
        User user = userMapper.toEntity(request);

        //Step 3: hash the password
        String hashedPassword = passwordEncoder.encode(request.getPassword());
        user.setHashedPassword(hashedPassword);
        user.setUserRole(UserRole.CUSTOMER);
        user.setUserStatus(UserStatus.ACTIVE);

        log.debug("Password hashed successfully for user: {}", request.getEmail());

        //Step 4: set role automatically to CUSTOMER
        user.setUserRole(UserRole.CUSTOMER);

        //Step 5: save to database
        User savedUser = userRepository.save(user);
        log.info("User registered successfully with id: {}", savedUser.getUserId());

        // Step 6: Login the user automatically
        return createAuthResponse(savedUser);
    }

    /**
     * Authenticate a user and generate JWT token.
     *
     * Steps:
     * 1. Find user by email
     * 2. Check if password matches
     * 3. Generate JWT token
     * 4. Return token + user info
     *
     * @param request Login credentials (email + password)
     * @return LoginResponse with JWT token and user info
     * @throws RuntimeException if email not found or password incorrect
     */

    public LoginResponse loginUser(UserLoginRequest request){
        log.info("Authenticating user with email: {}", request.getEmail());

        // Step 1: Find user by email
        User user = userRepository.findByEmailIgnoreCase(request.getEmail())
                .orElseThrow(() -> {
                    log.warn("Email {} not found", request.getEmail());
                    return new RuntimeException("Invalid credentials. Please check your login details"); // This helps prevent attackers from discovering which email exists
                });

        //Check if account is active
        if (user.getUserStatus() != UserStatus.ACTIVE) {
            log.warn("User {} attempted to login but account is {}",
                    request.getEmail(), user.getUserStatus());
            throw new RuntimeException("Account is " + user.getUserStatus().toString().toLowerCase() +
                    ". Please contact support.");
        }

        //Step 2: Check if password Matches
        boolean passwordMatches = passwordEncoder.matches(request.getPassword(), user.getHashedPassword());
        if (!passwordMatches){
            log.warn("Invalid password for user: {}", request.getEmail());
            throw new RuntimeException("Invalid credentials. Please check your login details");
        }

        log.info("Password verified successfully for user: {}", request.getEmail());

        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        log.info("Login successful for user: {}", request.getEmail());

        return createAuthResponse(user);
    }

    public void resetPasswordByEmail(String email, String newPassword) {
        log.info("Processing forgot-password request for email: {}", email);

        if (email == null || email.isBlank()) {
            throw new RuntimeException("Email is required.");
        }

        if (newPassword == null || newPassword.length() < 8) {
            throw new RuntimeException("New password must be at least 8 characters.");
        }

        User user = userRepository.findByEmailIgnoreCase(email.trim())
                .orElseThrow(() -> new RuntimeException("No account found for this email."));

        if (user.getUserStatus() != UserStatus.ACTIVE) {
            throw new RuntimeException("Account is not active. Please contact support.");
        }

        if (passwordEncoder.matches(newPassword, user.getHashedPassword())) {
            throw new RuntimeException("New password must be different from your previous password.");
        }

        user.setHashedPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        log.info("Forgot-password update completed for user {}", user.getUserId());
    }

    /**
     * Get user by ID.
     *
     * This might be useful later for profile pages, admin user management, etc.
     *
     * @param userId The user's ID
     * @return The user entity
     * @throws RuntimeException if user not found
     */
    public UserResponseDTO getUserByIdDTO(Long userId) {
        log.debug("Fetching user with ID: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        return userMapper.toUserResponseDTO(user);
    }

    /**
     * Get user entity by ID (for internal use)
     */
    public User getUserById(Long userId) {
        log.debug("Fetching user entity with ID: {}", userId);
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
    }

    /**
     * Get user by email.
     *
     * Useful for profile lookups, admin tools, etc.
     *
     * @param email The user's email
     * @return The user entity
     * @throws RuntimeException if user not found
     */
    public User getUserByEmail(String email) {
        log.debug("Fetching user with email: {}", email);
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }


    // Get all Users for admin view only
    public List<UserResponseDTO> getAllUsers(){
        log.info("Admin Fetching all users");

        //Get all users form the database
        List<User> users = userRepository.findAll();

        // Transform each user entity to userResponseDTO using streams
        List<UserResponseDTO> userDTOs = users.stream()
                .map(userMapper::toUserResponseDTO) // convert each user to UserResponseDTO
                .collect(Collectors.toList()); // Collect each results into a list

        log.info("Successfully fetched {} users for admin view", userDTOs.size());

        return userDTOs;
    }


    // New Methods admin search functionality
    public List<UserResponseDTO> searchUsers(String searchTerm){
        log.info("Searching for users with search term: {}", searchTerm);

        if (searchTerm == null || searchTerm.trim().isEmpty()){
            return getAllUsers();
        }

        List<User> users = userRepository.searchUsers(searchTerm.trim());
        log.debug("Found {} users for search term: {}", users.size(), searchTerm);
        return users.stream()
                .map(userMapper::toUserResponseDTO)
                .collect(Collectors.toList());
    }

    //Update operations
    /**
     *  * Concept: Partial Update
     *      * - Only update fields that are provided (non-null)
     *      * - Other fields remain unchanged
     *      * - This is the standard PATCH behavior
     *      *
     *      * Security Notes:
     *      * - Email changes should verify the new email
     *      * - Role changes should be logged for audit
     *      * - Consider requiring password for sensitive changes
     *      *
     *      * @param userId ID of user to update
     *      * @param updateDTO DTO with fields to update
     *      * @return Updated user DTO
     *      * @throws RuntimeException if user not found or email already exists
     */
    public UserResponseDTO updateUser(Long userId, UserUpdateDTO updateDTO){
        log.info("Updating user with ID: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        // Update username if provided
        if (updateDTO.getUserName() != null){
            log.debug("Updating username from {} to: {}", user.getUserName() ,updateDTO.getUserName());
            user.setUserName(updateDTO.getUserName());
        }

        // update email if provided
        if (updateDTO.getEmail() != null){

            //Check if email is already in use by someone else
            if(!updateDTO.getEmail().equalsIgnoreCase(user.getEmail()) && userRepository.existsByEmailIgnoreCase(updateDTO.getEmail())){
                throw new RuntimeException("Email already registered: " + updateDTO.getEmail());
            }
            log.debug("Updating email from {} to: {}", user.getEmail(), updateDTO.getEmail());
            user.setEmail(updateDTO.getEmail());
        }

        // Update PhoneNumber if provided
        if (updateDTO.getPhoneNumber() != null){
            user.setPhoneNumber(updateDTO.getPhoneNumber());
        }

        // Update role if provided(ADMIN only)
        if (updateDTO.getUserRole() != null){
            log.info("Updating role from {} to: {}", user.getUserRole(), updateDTO.getUserRole());
            user.setUserRole(updateDTO.getUserRole());
        }

        // Update status if provided (admin operation)
        if (updateDTO.getStatus() != null) {
            log.info("Changing user {} status from {} to {}",
                    userId, user.getUserStatus(), updateDTO.getStatus());
            user.setUserStatus(updateDTO.getStatus());
        }

        // Update password if provided
        if (updateDTO.getPassword() != null) {
            String hashedPassword = passwordEncoder.encode(updateDTO.getPassword());
            user.setHashedPassword(hashedPassword);
            log.debug("Password updated for user {}", userId);
        }

        User savedUser = userRepository.save(user);
        log.info("Successfully updated user {}", userId);

        return userMapper.toUserResponseDTO(savedUser);
    }

    public void changePassword(Long userId, String currentPassword, String newPassword) {
        log.info("Changing password for user {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        if (currentPassword == null || currentPassword.isBlank()) {
            throw new RuntimeException("Current password is required.");
        }

        if (newPassword == null || newPassword.length() < 8) {
            throw new RuntimeException("New password must be at least 8 characters.");
        }

        if (!passwordEncoder.matches(currentPassword, user.getHashedPassword())) {
            throw new RuntimeException("Current password is incorrect.");
        }

        if (passwordEncoder.matches(newPassword, user.getHashedPassword())) {
            throw new RuntimeException("New password must be different from the current password.");
        }

        user.setHashedPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        log.info("Password updated successfully for user {}", userId);
    }

    // Change User Role
    // Promote customer to admin or demote admin to customer
    public UserResponseDTO changeUserRole(Long userId, UserRole newRole){
        log.info("Changing role for user {}  to {}", userId,  newRole);
        User user = userRepository.findById(userId)
                        .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        UserRole oldRole = user.getUserRole();
        user.setUserRole(newRole);
        User savedUser = userRepository.save(user);

        log.info("Successfully changed user {} role from {} to {}", userId, oldRole, newRole);

        return userMapper.toUserResponseDTO(savedUser);
    }

    // Block user. Suspend user access
    public UserResponseDTO blockUser(Long userId){
        log.info("Blocking user {}", userId);
        User user = userRepository.findById(userId)
                        .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        if (user.getUserStatus() == UserStatus.BLOCKED){
            log.warn("User {} is already blocked", userId);
            throw new RuntimeException("User is already blocked");
        }
        user.setUserStatus(UserStatus.BLOCKED);
        User savedUser = userRepository.save(user);
        log.info("Successfully blocked user {}", userId);
        return userMapper.toUserResponseDTO(savedUser);
    }

    //unblock user
    public UserResponseDTO unblockUser(Long userId){
        log.info("Unblocking user {}", userId);
        User user = userRepository.findById(userId)
                        .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        if (user.getUserStatus() == UserStatus.ACTIVE){
            log.warn("User {} is already active", userId);
            throw new RuntimeException("User is already active");
        }
        user.setUserStatus(UserStatus.ACTIVE);
        User savedUser = userRepository.save(user);
        log.info("Successfully unblocked user {}", userId);
        return userMapper.toUserResponseDTO(savedUser);
    }

    //============Delete Operations=============//

    //Soft delete
    public void deleteUser(Long userId){
        log.info("Soft Deleting user with ID: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        if (user.getUserStatus() == UserStatus.DELETED){
            log.warn("User {} is already deleted", userId);
        }

        user.setUserStatus(UserStatus.DELETED);
        userRepository.save(user);
        log.info("Successfully soft deleted user {}", userId);
    }

    public void permanentlyDeleteUser(Long userId){
        log.info("PERMANENTLY Deleting user with ID: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        userRepository.delete(user);
        log.info("Successfully deleted user {}", userId);
    }


    //==========Statistics Operations========//
    //provide overview data for admin dashboard

    public UserStatsDTO getUserStats() {
        log.info("Calculating user stats");

        // Overall count
        long totalUsers = userRepository.count();

        //By status
        long activeUsers = userRepository.countByUserStatus(UserStatus.ACTIVE);
        long blockedUsers = userRepository.countByUserStatus(UserStatus.BLOCKED);
        long deletedUsers = userRepository.countByUserStatus(UserStatus.DELETED);

        // By role
        long totalAdmins = userRepository.countByUserRole(UserRole.ADMIN);
        long totalCustomers = userRepository.countByUserRole(UserRole.CUSTOMER);

        //Time-based stats
        LocalDateTime startOfMonth = LocalDate.now()
                .withDayOfMonth(1)
                .atStartOfDay();

        long newUsersThisMonth = userRepository.countByCreatedAtAfter(startOfMonth);

        LocalDateTime startOfToday = LocalDate.now().atStartOfDay();
        long newUsersToday = userRepository.countByCreatedAtAfter(startOfToday);

        UserStatsDTO stats = new UserStatsDTO(
                totalUsers,
                activeUsers,
                blockedUsers,
                deletedUsers,
                totalAdmins,
                totalCustomers,
                newUsersThisMonth,
                newUsersToday
        );

        log.info("Statistics Calculated: {} total users, {} actve, {} new this month",
                totalUsers,activeUsers,newUsersThisMonth);

        return stats;

    }

}
