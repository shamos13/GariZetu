package com.amos.garizetu.User.DTO.Response;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * UserStatsDTO - Statistics about users in the system
 *
 * Purpose: Provide overview data for admin dashboard
 *
 * Use cases:
 * - Dashboard summary cards
 * - Analytics charts
 * - Monitoring system health
 *
 * Example Response:
 * {
 *   "totalUsers": 150,
 *   "activeUsers": 145,
 *   "blockedUsers": 3,
 *   "deletedUsers": 2,
 *   "totalAdmins": 5,
 *   "totalCustomers": 145,
 *   "newUsersThisMonth": 12,
 *   "newUsersToday": 2
 * }
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserStatsDTO {

    //Overall counts
    private long totalUsers;

    //By status
    private long activeUsers;
    private long blockedUsers;
    private long deletedUsers;

    //By role
    private long totalAdmins;
    private long totalCustomers;

    //Time-based stats
    private long newUsersThisMonth;
    private long newUsersToday;
}
