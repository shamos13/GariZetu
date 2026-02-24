import axios from "axios";
import { authService } from "../services/AuthService.ts";
import { getErrorMessage, isForbiddenError, isUnauthorizedError } from "./errorUtils.ts";

const isPublicCarsReadRequestError = (error: unknown): boolean => {
    if (!axios.isAxiosError(error)) {
        return false;
    }

    const method = (error.config?.method ?? "GET").toUpperCase();
    if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
        return false;
    }

    const requestUrl = error.config?.url ?? "";
    try {
        const path = new URL(requestUrl, "http://localhost").pathname;
        return path.startsWith("/api/v1/cars/")
            || path.startsWith("/cars/");
    } catch {
        return requestUrl.startsWith("/api/v1/cars/")
            || requestUrl.startsWith("/cars/");
    }
};

export const getAdminActionErrorMessage = (error: unknown, fallback: string): string => {
    const isLoggedIn = authService.isAuthenticated();
    const isAdmin = authService.isAdmin();

    if (isUnauthorizedError(error)) {
        if (isPublicCarsReadRequestError(error)) {
            return "Fleet data is temporarily unavailable. Please try again shortly.";
        }

        if (isLoggedIn && isAdmin) {
            return "Your admin session could not be verified for this request. Refresh and try again. If it persists, sign out and sign in again.";
        }
        return "Your admin session has expired. Please sign in again.";
    }

    if (isForbiddenError(error)) {
        if (isLoggedIn && !isAdmin) {
            return "This action requires an administrator account.";
        }
        return "You are signed in, but this admin action is not permitted for your account.";
    }

    return getErrorMessage(error, fallback);
};
