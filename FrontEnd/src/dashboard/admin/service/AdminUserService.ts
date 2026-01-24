import { api } from "../../../lib/api.ts";

export interface User {
    userId: number;
    userName: string;
    email: string;
    phoneNumber: string | null;
    userRole: "ADMIN" | "CUSTOMER";
    status: "ACTIVE" | "BLOCKED" | "DELETED";
    lastLogin: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface UserStats {
    totalUsers: number;
    activeUsers: number;
    blockedUsers: number;
    deletedUsers: number;
    totalAdmins: number;
    totalCustomers: number;
    newUsersThisMonth: number;
    newUsersToday: number;
}

export interface UserUpdateData {
    userName?: string;
    email?: string;
    phoneNumber?: string;
}

/**
 * Admin User Service
 * Handles fetching and managing users for admin dashboard
 */
export const adminUserService = {
    /**
     * Get all users from the backend
     */
    getAll: async (): Promise<User[]> => {
        try {
            const response = await api.get<User[]>("/admin/users/allusers");
            return response.data;
        } catch (error) {
            console.error("Failed to fetch users:", error);
            throw error;
        }
    },

    /**
     * Get user by ID
     */
    getById: async (userId: number): Promise<User> => {
        try {
            const response = await api.get<User>(`/admin/users/${userId}`);
            return response.data;
        } catch (error) {
            console.error(`Failed to fetch user ${userId}:`, error);
            throw error;
        }
    },

    /**
     * Search users by name or email
     */
    search: async (query: string): Promise<User[]> => {
        try {
            const response = await api.get<User[]>(`/admin/users/search?query=${encodeURIComponent(query)}`);
            return response.data;
        } catch (error) {
            console.error("Failed to search users:", error);
            throw error;
        }
    },

    /**
     * Get user statistics
     */
    getStats: async (): Promise<UserStats> => {
        try {
            const response = await api.get<UserStats>("/admin/users/stats");
            return response.data;
        } catch (error) {
            console.error("Failed to fetch user stats:", error);
            throw error;
        }
    },

    /**
     * Update user details
     */
    update: async (userId: number, data: UserUpdateData): Promise<User> => {
        try {
            const response = await api.patch<User>(`/admin/users/${userId}`, data);
            return response.data;
        } catch (error) {
            console.error(`Failed to update user ${userId}:`, error);
            throw error;
        }
    },

    /**
     * Change user role
     */
    changeRole: async (userId: number, role: "ADMIN" | "CUSTOMER"): Promise<User> => {
        try {
            const response = await api.patch<User>(`/admin/users/${userId}/role`, { role });
            return response.data;
        } catch (error) {
            console.error(`Failed to change role for user ${userId}:`, error);
            throw error;
        }
    },

    /**
     * Block a user
     */
    block: async (userId: number): Promise<User> => {
        try {
            const response = await api.patch<User>(`/admin/users/${userId}/block`);
            return response.data;
        } catch (error) {
            console.error(`Failed to block user ${userId}:`, error);
            throw error;
        }
    },

    /**
     * Unblock a user
     */
    unblock: async (userId: number): Promise<User> => {
        try {
            const response = await api.patch<User>(`/admin/users/${userId}/unblock`);
            return response.data;
        } catch (error) {
            console.error(`Failed to unblock user ${userId}:`, error);
            throw error;
        }
    },

    /**
     * Soft delete a user
     */
    delete: async (userId: number): Promise<void> => {
        try {
            await api.delete(`/admin/users/${userId}`);
        } catch (error) {
            console.error(`Failed to delete user ${userId}:`, error);
            throw error;
        }
    },

    /**
     * Hard delete a user permanently
     */
    permanentDelete: async (userId: number): Promise<void> => {
        try {
            await api.delete(`/admin/users/${userId}/permanent`);
        } catch (error) {
            console.error(`Failed to permanently delete user ${userId}:`, error);
            throw error;
        }
    }
};
