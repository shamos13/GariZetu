import { authService } from "../services/AuthService.ts";
import { getErrorMessage, isForbiddenError, isUnauthorizedError } from "./errorUtils.ts";

export const getAdminActionErrorMessage = (error: unknown, fallback: string): string => {
    const isLoggedIn = authService.isAuthenticated();
    const isAdmin = authService.isAdmin();

    if (isUnauthorizedError(error)) {
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
