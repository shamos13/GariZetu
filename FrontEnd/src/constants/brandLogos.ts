export const DEFAULT_BRAND_LOGOS: Record<string, string> = {
    toyota: "/logos/toyota-7.svg",
    "mercedes-benz": "/logos/mercedes-benz-8.svg",
    bmw: "/logos/bmw-7.svg",
    volkswagen: "/logos/volkswagen-10.svg",
    audi: "/logos/audi.svg",
    nissan: "/logos/nissan.svg",
};

export const toBrandKey = (brandName: string): string =>
    brandName
        .trim()
        .toLowerCase()
        .replace(/&/g, " and ")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
