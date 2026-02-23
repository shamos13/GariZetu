import axios from "axios";

/**
 * Base URL for your backend API
 * This should point to where your Spring Boot application is running
 */
export const BASE_URL = "http://localhost:8080";

/**
 * Create an axios instance with custom configuration
 *
 * Think of this as creating a specialized HTTP client that knows
 * how to talk to your backend API. We configure it once here,
 * and then use it throughout the app.
 */
export const api = axios.create({
    baseURL: `${BASE_URL}/api/v1/`,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

/**
 * REQUEST INTERCEPTOR
 *
 * This is the MAGIC that makes authentication work smoothly!
 *
 * An interceptor is like a middleware that runs before every request.
 * Think of it as a security guard that adds your ID badge (JWT token)
 * to every request you make.
 *
 * How it works:
 * 1. You call api.get("/cars/getcars")
 * 2. BEFORE the request goes out, this interceptor runs
 * 3. It checks: "Do we have a token stored?"
 * 4. If yes, it adds "Authorization: Bearer <token>" header
 * 5. NOW the request goes to the backend
 * 6. Backend sees the Authorization header and knows who you are!
 *
 * Why is this so useful?
 * - You don't have to manually add the token to every single request
 * - If user logs out, requests automatically stop including the token
 * - Keeps your code DRY (Don't Repeat Yourself)
 */
api.interceptors.request.use(
    (config) => {
        // Get the token from localStorage
        // We use the same key that authService uses
        const token = localStorage.getItem("garizetu_token");

        if (token) {
            // Add the Authorization header
            // The format MUST be: "Bearer <token>" - this is the JWT standard
            if (!config.headers) {
                config.headers = {} as any;
            }

            // Axios v1 uses AxiosHeaders with a .set() API
            if (typeof (config.headers as any).set === "function") {
                (config.headers as any).set("Authorization", `Bearer ${token}`);
            } else {
                (config.headers as any).Authorization = `Bearer ${token}`;
            }

            console.log("🔐 Request interceptor: Token attached to request");
        } else {
            console.log("⚠️  Request interceptor: No token found (user not logged in)");
        }

        // Return the modified config so the request can proceed
        return config;
    },
    (error) => {
        // If something goes wrong in the interceptor itself, handle it
        return Promise.reject(error);
    }
);

/**
 * RESPONSE INTERCEPTOR
 *
 * This runs AFTER receiving a response from the backend.
 * It's useful for handling common errors in one place.
 *
 * For example:
 * - If backend returns 401 (Unauthorized), we know the token expired
 * - We can automatically log the user out and redirect to login
 * - This prevents having to check for 401 in every component
 */
api.interceptors.response.use(
    (response) => {
        // If response is successful (status 200-299), just return it
        return response;
    },
    (error) => {
        // Check if the error is due to authentication failure
        if (error.response?.status === 401) {
            console.log("🚫 Token expired or invalid - logging out user");

            // Clear the invalid token
            localStorage.removeItem("garizetu_token");
            localStorage.removeItem("garizetu_user");

            // Optionally redirect to login page
            // window.location.href = "/";
        }

        // Re-throw the error so the calling code can handle it
        return Promise.reject(error);
    }
);
