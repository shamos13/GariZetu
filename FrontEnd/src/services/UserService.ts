import {api} from "../lib/api";

// User type matching backend response

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

/**
 * UserService handles all related Api calls
 * ADMIN endpoints require JWT tokens!
 * The Token must be included in Authorization Header
 * */

export const userService = {
    // Get all users

    getAllUsers: async (): Promise<User[]> => {
        try {
            const response = await api.get<User[]>("/admin/users/allusers");
            return response.data;
        } catch (error) {
            console.error("Failed to fetch users:", error);
            throw error;
        }
    },
}
