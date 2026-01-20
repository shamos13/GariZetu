package com.amos.garizetu.Service;

import com.amos.garizetu.Repository.UserRepository;
import com.amos.garizetu.User.DTO.Request.UserLoginRequest;
import com.amos.garizetu.User.DTO.Request.UserRegistrationRequest;
import com.amos.garizetu.User.DTO.Response.LoginResponse;
import com.amos.garizetu.User.DTO.Response.RegistrationResponse;
import com.amos.garizetu.User.Entity.User;
import com.amos.garizetu.User.UserRole;
import com.amos.garizetu.User.mapper.UserMapper;
import com.amos.garizetu.util.JWTUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JWTUtil jwtUtil;
    private final UserMapper userMapper;

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

    public RegistrationResponse registerUser(UserRegistrationRequest request) {
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

        log.debug("Password hashed successfully for user: {}", request.getEmail());

        //Step 4: set role automatically to CUSTOMER
        user.setUserRole(UserRole.CUSTOMER);

        //Step 5: save to database
        User savedUser = userRepository.save(user);
        log.info("User registered successfully with id: {}", savedUser.getUserId());

        //Step 6: return success message
        return new RegistrationResponse("User Registered Successfully. Please log in");
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

        //Step 2: Check if password Matches
        boolean passwordMatches = passwordEncoder.matches(request.getPassword(), user.getHashedPassword());
        if (!passwordMatches){
            log.warn("Invalid password for user: {}", request.getEmail());
            throw new RuntimeException("Invalid credentials. Please check your login details");
        }

        log.info("Password verified successfully for user: {}", request.getEmail());

        //Step 3: Generate JWT token
        String token = jwtUtil.generateToken(
                user.getEmail(),
                user.getUserRole().name() // convert enum to String
        );
        log.info("JWT token generated successfully for user: {}", request.getEmail());

        //Step 4: Return token + user info
        LoginResponse response = userMapper.toLoginResponse(user, token);
        log.info("Login successful for user: {}", request.getEmail());

        return response;
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
    public User getUserById(Long userId) {
        log.debug("Fetching user with ID: {}", userId);
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
}
