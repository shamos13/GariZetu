import {BASE_URL} from "./api.ts";

export const getImageUrl = (relativeUrl: string| null | undefined): string => {
    if (!relativeUrl) {
        return "/placeholder-car.jpg";
    }

    if (relativeUrl.startsWith("http://") || relativeUrl.startsWith("https://")) {
        return relativeUrl;
    }

    // Backend-stored images (e.g. /api/v1/cars/images/...)
    if (relativeUrl.startsWith("/api/")) {
        return `${BASE_URL}${relativeUrl}`;
    }

    // Frontend public assets (e.g. /nissan-maxima-white.jpg)
    if (relativeUrl.startsWith("/")) {
        return relativeUrl;
    }

    // Fallback: treat as backend-relative path
    return `${BASE_URL}/${relativeUrl}`;
}