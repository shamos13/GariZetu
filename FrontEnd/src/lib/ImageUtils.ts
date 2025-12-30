import {BASE_URL} from "./api.ts";

export const getImageUrl = (relativeUrl: string| null | undefined): string => {
    if (!relativeUrl) {
        return "/placeholder-car.jpg";
    }

    if (relativeUrl.startsWith("http://") || relativeUrl.startsWith("https://")) {
        return relativeUrl;
    }

    return `${BASE_URL}${relativeUrl}`;
}