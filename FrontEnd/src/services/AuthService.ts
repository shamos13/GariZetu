import { api } from "../lib/api.ts";

/**
 * Authentication Service
 *
 * This service handles all authentication-related operations.
 * Think of it as a specialized helper that knows how to talk to your backend's auth endpoints.
 */

// ========================
// TYPE DEFINITIONS
// ========================

/**
 * These types match your backend DTOs exactly.
 * This ensures type safety - TypeScript will catch errors if we send wrong data.
 */

// What we send when registering a new user
export interface RegisterRequest {
    userName: string;      // Must be 5-15 characters (backend validation)
    email: string;         // Must be valid email format
    password: string;      // Must be 8+ characters
    phoneNumber?: string;  // Optional field
}

// What we send when logging in
export interface LoginRequest {
    email: string;
    password: string;
}

// What the backend sends back after successful login
export interface LoginResponse {
    token: string;      // The JWT token - this is the "key" to access protected resources
    userId: number;
    userName: string;
    email: string;
    role: string;       // "ADMIN" or "CUSTOMER"
}

// ========================
// TOKEN MANAGEMENT
// ========================

/**
 * Local Storage Keys
 *
 * We store the token and user info in the browser's localStorage.
 * Think of localStorage as a small database that persists even when you close the browser.
 */
const TOKEN_KEY = "garizetu_token";
const USER_KEY = "garizetu_user";

/**
 * Save authentication data to localStorage
 *
 * Why do we do this?
 * - So the user stays logged in even if they refresh the page
 * - So we can include the token in future API requests
 */
const saveAuthData = (loginResponse: LoginResponse): void => {
    // Save the JWT token
    localStorage.setItem(TOKEN_KEY, loginResponse.token);

    // Save user info (everything except the token)
    // We convert it to JSON string because localStorage only stores strings
    const userInfo = {
        userId: loginResponse.userId,
        userName: loginResponse.userName,
        email: loginResponse.email,
        role: loginResponse.role,
    };
    localStorage.setItem(USER_KEY, JSON.stringify(userInfo));
};

/**
 * Get the stored JWT token
 *
 * This will be called whenever we need to make an authenticated request.
 * Returns null if user is not logged in.
 */
const getToken = (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
};

/**
 * Get the stored user information
 *
 * Returns null if user is not logged in.
 * We parse the JSON string back into an object.
 */
const getUser = (): Omit<LoginResponse, "token"> | null => {
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;

    try {
        return JSON.parse(userStr);
    } catch {
        // If JSON is corrupted, clear it and return null
        localStorage.removeItem(USER_KEY);
        return null;
    }
};

/**
 * Clear all authentication data
 *
 * Called when user logs out or when token becomes invalid.
 */
const clearAuthData = (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
};

/**
 * Check if user is currently logged in
 *
 * Simply checks if we have a token stored.
 * Note: This doesn't validate if the token is still valid -
 * the backend will reject expired tokens automatically.
 */
const isAuthenticated = (): boolean => {
    return getToken() !== null;
};

/**
 * Check if current user is an admin
 *
 * Useful for showing/hiding admin-only features in the UI.
 */
const isAdmin = (): boolean => {
    const user = getUser();
    return user?.role === "ADMIN";
};

// ========================
// API CALLS
// ========================

/**
 * Register a new user
 *
 * Flow:
 * 1. Send POST request to /auth/register with user data
 * 2. Backend validates and creates the user
 * 3. Return success message
 *
 * Note: Registration does NOT automatically log the user in.
 * They need to use the login function after registering.
 */
const register = async (data: RegisterRequest): Promise<LoginResponse> => {
    try {
        // Make the API call
        const response = await api.post<LoginResponse>("/auth/register", data);

        //Log in the user automatically
        saveAuthData(response.data)

        // Return the response message
        return response.data;

    } catch (error: any) {
        // Handle errors gracefully
        // The backend might return specific error messages like "Email already registered"
        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error("Registration failed. Please try again.");
    }
};

/**
 * Log in an existing user
 *
 * Flow:
 * 1. Send POST request to /auth/login with credentials
 * 2. Backend validates credentials and generates JWT token
 * 3. Save token and user info to localStorage
 * 4. Return the login response
 *
 * After this succeeds, the user is considered "logged in"
 */
const login = async (data: LoginRequest): Promise<LoginResponse> => {
    try {
        // Make the API call
        const response = await api.post<LoginResponse>("/auth/login", data);

        // Save the authentication data to localStorage
        saveAuthData(response.data);

        // Return the full response (component might need user info)
        return response.data;

    } catch (error: any) {
        // Handle errors gracefully
        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error("Login failed. Please check your credentials.");
    }
};

/**
 * Log out the current user
 *
 * This is a local operation - we just clear the stored data.
 * The backend doesn't need to know (JWT tokens can't be "revoked" easily).
 */
const logout = (): void => {
    clearAuthData();
    // Optionally, you could redirect to home page here
    // window.location.href = "/";
};

// ========================
// EXPORTS
// ========================

/**
 * Export everything as a single object
 *
 * This makes it easy to import: import { authService } from "./authService"
 * Then use: authService.login(...), authService.isAuthenticated(), etc.
 */
export const authService = {
    // API calls
    register,
    login,
    logout,

    // Token management
    getToken,
    getUser,
    isAuthenticated,
    isAdmin,
};