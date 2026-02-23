import axios from "axios";

type ApiErrorPayload = {
    message?: string;
    error?: string;
    details?: string;
    title?: string;
    errors?: string[] | Record<string, unknown>;
};

const isMeaningful = (value: unknown): value is string =>
    typeof value === "string" && value.trim().length > 0;

const parseValidationErrors = (errors: unknown): string | null => {
    if (Array.isArray(errors)) {
        const messages = errors.filter(isMeaningful);
        return messages.length > 0 ? messages.join(", ") : null;
    }

    if (errors && typeof errors === "object") {
        const values = Object.values(errors as Record<string, unknown>);
        const flatMessages = values
            .flatMap((value) => (Array.isArray(value) ? value : [value]))
            .filter(isMeaningful);
        return flatMessages.length > 0 ? flatMessages.join(", ") : null;
    }

    return null;
};

export const getHttpStatus = (error: unknown): number | null =>
    axios.isAxiosError(error) ? (error.response?.status ?? null) : null;

export const isUnauthorizedError = (error: unknown): boolean => getHttpStatus(error) === 401;
export const isForbiddenError = (error: unknown): boolean => getHttpStatus(error) === 403;

export const getErrorMessage = (error: unknown, fallback: string): string => {
    if (axios.isAxiosError(error)) {
        if (!error.response) {
            return "Unable to reach the server. Please check your connection and try again.";
        }

        const status = error.response.status;
        const data = (error.response.data ?? {}) as ApiErrorPayload;

        if (isMeaningful(data.message)) return data.message;
        if (isMeaningful(data.error)) return data.error;
        if (isMeaningful(data.details)) return data.details;
        if (isMeaningful(data.title)) return data.title;

        const validationMessage = parseValidationErrors(data.errors);
        if (validationMessage) return validationMessage;

        if (status === 401) return "Your session is not authorized for this request.";
        if (status === 403) return "You do not have permission to perform this action.";
        if (status >= 500) return "A server error occurred. Please try again shortly.";
    }

    if (error instanceof Error && isMeaningful(error.message)) {
        return error.message;
    }

    return fallback;
};
