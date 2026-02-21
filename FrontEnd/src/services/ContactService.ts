import { api } from "../lib/api.ts";

export interface ContactMessageRequest {
    name: string;
    email: string;
    phone: string;
    subject?: string;
    message: string;
}

export interface ContactMessageResponse {
    message: string;
}

export const contactService = {
    submitMessage: async (payload: ContactMessageRequest): Promise<ContactMessageResponse> => {
        const response = await api.post<ContactMessageResponse>("/contact/messages", payload);
        return response.data;
    },
};
