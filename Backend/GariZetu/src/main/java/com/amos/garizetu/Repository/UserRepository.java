package com.amos.garizetu.Repository;

import com.amos.garizetu.User.Entity.User;
import com.amos.garizetu.User.UserRole;
import com.amos.garizetu.User.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByEmailIgnoreCase(String email);
    Optional<User> findByEmailIgnoreCase(String email);

    /**
     * Count users by role
     * SQL: SELECT COUNT(*) FROM users where user_role = 'ADMIN'
     * */
    long countByUserRole(UserRole role);
    long countByUserStatus(UserStatus status);

    long countByCreatedAtAfter(LocalDateTime date);

    /**
     * Filtering methods
     * Finding users by role
     */
    List<User> findByUserRole(UserRole role);
    List<User> findByUserStatus(UserStatus status);
    List<User> findByUserStatusAndUserRole(UserStatus status, UserRole role);


    //======Custom Queries=======//
    /**
     * Find inactive users (haven't logged in for X days)
     *
     * Purpose: Identify dormant accounts
     * Use for: Re-engagement campaigns, cleanup
     *
     * @param cutoffDate - Users who haven't logged in since this date
     */
    @Query("SELECT u FROM User u WHERE u.lastLogin < :cutoffDate OR u.lastLogin IS NULL")
    List<User> findInactiveUsers(@Param("cutoffDate") LocalDateTime cutoffDate);

    /**
     * Find recently active users
     *
     * Purpose: Track engagement
     * Use for: Analytics, "active users" metrics
     *
     * @param since - Users who logged in after this date
     */
    @Query("SELECT u FROM User u WHERE u.lastLogin > :since")
    List<User> findRecentlyActiveUsers(@Param("since") LocalDateTime since);

    /**
     * Search users by name or email
     *
     * Purpose: Admin search functionality
     * Use for: Finding specific users in dashboard
     *
     * SQL: SELECT * FROM users
     *      WHERE LOWER(user_name) LIKE %searchTerm%
     *         OR LOWER(email) LIKE %searchTerm%
     */
    @Query("SELECT u FROM User u WHERE " +
            "LOWER(u.userName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(u.email) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<User> searchUsers(@Param("searchTerm") String searchTerm);



}
