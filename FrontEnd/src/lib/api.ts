import axios from "axios";
import { emitAuthChanged } from "./authEvents.ts";

/**
 * Backend base URL.
 * In production set VITE_API_BASE_URL, e.g. https://api.example.com
 */
const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

const normalizeBaseUrl = (rawUrl?: string): string => {
    if (!rawUrl) {
        return "http://localhost:8080";
    }

    let normalized = rawUrl.trim();
    if (!normalized) {
        return "http://localhost:8080";
    }

    // Accept values like "example.up.railway.app" and turn them into a valid URL.
    if (!/^https?:\/\//i.test(normalized)) {
        const localHostLike = /^(localhost|127\.0\.0\.1)(:\d+)?$/i.test(normalized);
        normalized = `${localHostLike ? "http" : "https"}://${normalized}`;
    }

    normalized = normalized.replace(/\/+$/, "");
    normalized = normalized.replace(/\/api\/v1$/i, "");
    return normalized;
};

export const BASE_URL = normalizeBaseUrl(configuredBaseUrl);

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

const AUTH_MESSAGE_MARKERS = [
    "jwt",
    "token",
    "expired",
    "invalid",
    "unauthorized",
    "authentication",
    "not authenticated",
    "full authentication is required",
];

const getPathFromUrl = (url?: string): string => {
    if (!url) {
        return "";
    }

    try {
        // Supports relative axios URLs like "/bookings/create" and absolute URLs.
        const parsed = new URL(url, BASE_URL);
        const normalized = parsed.pathname.replace(/^\/api\/v1/, "");
        return normalized || "/";
    } catch {
        return url;
    }
};

const isAuthEndpoint = (url?: string): boolean => getPathFromUrl(url).startsWith("/auth/");

const getServerMessage = (payload: unknown): string => {
    if (!payload) {
        return "";
    }

    if (typeof payload === "string") {
        return payload.trim();
    }

    if (typeof payload === "object") {
        const data = payload as Record<string, unknown>;
        const candidates = [data.message, data.error, data.details, data.title];
        for (const candidate of candidates) {
            if (typeof candidate === "string" && candidate.trim().length > 0) {
                return candidate.trim();
            }
        }
    }

    return "";
};

const looksLikeAuthenticationFailure = (
    responseData: unknown,
    responseHeaders: unknown
): boolean => {
    const message = getServerMessage(responseData).toLowerCase();
    if (message) {
        return AUTH_MESSAGE_MARKERS.some((marker) => message.includes(marker));
    }

    if (responseHeaders && typeof responseHeaders === "object") {
        const headerValue = (responseHeaders as Record<string, unknown>)["www-authenticate"];
        if (typeof headerValue === "string" && headerValue.toLowerCase().includes("bearer")) {
            return true;
        }
    }

    return false;
};

const getUsableToken = (): string | null => {
    const rawToken = localStorage.getItem("garizetu_token");

    if (!rawToken) {
        return null;
    }

    const trimmedToken = rawToken.trim();
    if (!trimmedToken || trimmedToken === "undefined" || trimmedToken === "null") {
        localStorage.removeItem("garizetu_token");
        localStorage.removeItem("garizetu_user");
        emitAuthChanged();
        return null;
    }

    return trimmedToken;
};

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
        if (isAuthEndpoint(config.url)) {
            return config;
        }

        // Get the token from localStorage
        // We use the same key that authService uses
        const token = getUsableToken();

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
            const requestUrl = error.config?.url;
            const shouldClearAuth =
                !isAuthEndpoint(requestUrl)
                && looksLikeAuthenticationFailure(error.response?.data, error.response?.headers);

            // Only clear auth when the server response clearly indicates token/auth failure.
            // This avoids logging users out for business-rule failures that are incorrectly sent as 401.
            if (shouldClearAuth) {
                console.log("🚫 Authentication failure detected from API - clearing session");
                localStorage.removeItem("garizetu_token");
                localStorage.removeItem("garizetu_user");
                emitAuthChanged();
            } else {
                console.warn("⚠️  Received 401 without clear auth-expiry signal; preserving local session state");
            }
        }

        // Re-throw the error so the calling code can handle it
        return Promise.reject(error);
    }
);
