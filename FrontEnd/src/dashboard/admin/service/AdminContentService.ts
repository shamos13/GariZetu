import { api } from "../../../lib/api.ts";
import type { BrandLogoOverride, ContactSectionSettings } from "../../../services/SiteContentService.ts";
import type { SpringPage } from "../../../lib/pagination.ts";

export type ContactMessageStatus = "NEW" | "REPLIED" | "CLOSED";

export interface ContactMessageReply {
    replyId: number;
    message: string;
    repliedBy: string;
    repliedAt: string;
}

export interface AdminContactMessage {
    messageId: number;
    name: string;
    email: string;
    phone: string;
    subject: string | null;
    message: string;
    messageStatus: ContactMessageStatus;
    createdAt: string;
    updatedAt: string;
    replies: ContactMessageReply[];
}

export interface BrandLogoUpsertRequest {
    brandName: string;
    logoUrl: string;
}

export interface BrandLogoUploadResponse {
    fileName: string;
    logoUrl: string;
}

export interface ContactSectionSettingsUpdateRequest {
    phone?: string;
    altPhone?: string | null;
    email?: string;
    supportEmail?: string | null;
    whatsapp?: string;
    address?: string;
    city?: string;
    hours?: string;
    sundayHours?: string;
    jkiaDeskHours?: string | null;
    heroTitle?: string;
    heroDescription?: string;
}

export const adminContentService = {
    getBrandLogos: async (): Promise<BrandLogoOverride[]> => {
        const response = await api.get<BrandLogoOverride[]>("/admin/content/brand-logos");
        return response.data;
    },

    upsertBrandLogo: async (payload: BrandLogoUpsertRequest): Promise<BrandLogoOverride> => {
        const response = await api.put<BrandLogoOverride>("/admin/content/brand-logos", payload);
        return response.data;
    },

    uploadBrandLogoImage: async (file: File): Promise<BrandLogoUploadResponse> => {
        const formData = new FormData();
        formData.append("image", file);

        const response = await api.post<BrandLogoUploadResponse>(
            "/admin/content/brand-logos/upload",
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );
        return response.data;
    },

    deleteBrandLogo: async (brandKey: string): Promise<void> => {
        await api.delete(`/admin/content/brand-logos/${encodeURIComponent(brandKey)}`);
    },

    getContactSettings: async (): Promise<ContactSectionSettings> => {
        const response = await api.get<ContactSectionSettings>("/admin/content/contact");
        return response.data;
    },

    updateContactSettings: async (
        payload: ContactSectionSettingsUpdateRequest
    ): Promise<ContactSectionSettings> => {
        const response = await api.patch<ContactSectionSettings>("/admin/content/contact", payload);
        return response.data;
    },

    getMessages: async (
        status?: ContactMessageStatus,
        page: number = 0,
        size: number = 20
    ): Promise<SpringPage<AdminContactMessage>> => {
        const response = await api.get<SpringPage<AdminContactMessage>>("/admin/contact/messages/paged", {
            params: {
                ...(status ? { status } : {}),
                page,
                size,
            },
        });
        return response.data;
    },

    replyToMessage: async (messageId: number, message: string): Promise<AdminContactMessage> => {
        const response = await api.post<AdminContactMessage>(
            `/admin/contact/messages/${messageId}/replies`,
            { message }
        );
        return response.data;
    },

    updateMessageStatus: async (
        messageId: number,
        status: ContactMessageStatus
    ): Promise<AdminContactMessage> => {
        const response = await api.patch<AdminContactMessage>(
            `/admin/contact/messages/${messageId}/status`,
            { status }
        );
        return response.data;
    },
};
