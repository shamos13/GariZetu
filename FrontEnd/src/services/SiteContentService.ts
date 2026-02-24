import { api } from "../lib/api.ts";

export interface BrandLogoOverride {
    brandName: string;
    brandKey: string;
    logoUrl: string;
    updatedAt: string;
}

export interface ContactSectionSettings {
    phone: string;
    altPhone: string | null;
    email: string;
    supportEmail: string | null;
    whatsapp: string;
    address: string;
    city: string;
    hours: string;
    sundayHours: string;
    jkiaDeskHours: string | null;
    heroTitle: string;
    heroDescription: string;
}

export const siteContentService = {
    getPublicBrandLogos: async (): Promise<BrandLogoOverride[]> => {
        const response = await api.get<BrandLogoOverride[]>("/content/brand-logos");
        return response.data;
    },

    getContactSettings: async (): Promise<ContactSectionSettings> => {
        const response = await api.get<ContactSectionSettings>("/contact/settings");
        return response.data;
    },
};
