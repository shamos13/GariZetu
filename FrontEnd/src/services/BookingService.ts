import { api } from "../lib/api.ts";

export type BookingStatus =
    | "PENDING_PAYMENT"
    | "PENDING"
    | "ADMIN_NOTIFIED"
    | "CONFIRMED"
    | "ACTIVE"
    | "COMPLETED"
    | "CANCELLED"
    | "EXPIRED"
    | "REJECTED";

export type PaymentStatus = "UNPAID" | "PAID" | "FAILED" | "SIMULATED_PAID" | "REFUNDED";

export interface Booking {
    bookingId: number;
    carId: number;
    userId: number;
    carMake: string;
    carModel: string;
    registrationNumber: string;
    colour: string;
    carYear: number;
    userName: string;
    userEmail: string;
    phoneNumber: string | null;
    pickupDate: string;
    returnDate: string;
    numberOfDays: number;
    dailyPrice: number;
    totalPrice: number;
    pickupLocation: string;
    returnLocation: string;
    specialRequests: string | null;
    bookingStatus: BookingStatus;
    paymentStatus: PaymentStatus | null;
    paymentReference: string | null;
    paymentMethod: string | null;
    paymentSimulatedAt: string | null;
    paymentExpiresAt: string | null;
    adminNotifiedAt: string | null;
    adminNotificationRead: boolean;
    adminNotificationReadAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface BookingCreateRequest {
    carId: number;
    pickupDate: string;
    returnDate: string;
    pickupLocation: string;
    returnLocation?: string;
    specialRequests?: string;
}

export interface BookingUpdateRequest {
    bookingStatus?: BookingStatus;
    returnLocation?: string;
    specialRequests?: string;
    refundAmount?: number;
}

export interface BookingPaymentSimulationRequest {
    paymentMethod?: string;
    paymentSuccessful?: boolean;
}

export interface BookingStats {
    totalBookings: number;
    pendingCount: number;
    adminNotifiedCount: number;
    confirmedCount: number;
    activeCount: number;
    completedCount: number;
    cancelledCount: number;
    expiredCount: number;
    rejectedCount: number;
    overdueCount: number;
}

export const bookingService = {
    create: async (payload: BookingCreateRequest): Promise<Booking> => {
        const response = await api.post<Booking>("/bookings/create", payload);
        return response.data;
    },

    getMyBookings: async (): Promise<Booking[]> => {
        const response = await api.get<Booking[]>("/bookings/my-bookings");
        return response.data;
    },

    getById: async (bookingId: number): Promise<Booking> => {
        const response = await api.get<Booking>(`/bookings/${bookingId}`);
        return response.data;
    },

    update: async (bookingId: number, payload: BookingUpdateRequest): Promise<Booking> => {
        const response = await api.patch<Booking>(`/bookings/${bookingId}`, payload);
        return response.data;
    },

    simulatePayment: async (bookingId: number, payload: BookingPaymentSimulationRequest = {}): Promise<Booking> => {
        const response = await api.post<Booking>(`/bookings/${bookingId}/simulate-payment`, payload);
        return response.data;
    },

    cancel: async (bookingId: number, reason?: string): Promise<Booking> => {
        const params = reason ? { reason } : undefined;
        const response = await api.delete<Booking>(`/bookings/${bookingId}`, { params });
        return response.data;
    },

    getAllAdmin: async (status?: BookingStatus): Promise<Booking[]> => {
        const params = status ? { status } : undefined;
        const response = await api.get<Booking[]>("/bookings/admin/all", { params });
        return response.data;
    },

    getAdminStats: async (): Promise<BookingStats> => {
        const response = await api.get<BookingStats>("/bookings/admin/stats");
        return response.data;
    },

    getCarBookings: async (carId: number): Promise<Booking[]> => {
        const response = await api.get<Booking[]>(`/bookings/admin/car/${carId}`);
        return response.data;
    },

    getAdminNotifications: async (includeRead = false): Promise<Booking[]> => {
        const response = await api.get<Booking[]>("/bookings/admin/notifications", {
            params: { includeRead },
        });
        return response.data;
    },

    markAdminNotificationRead: async (bookingId: number): Promise<Booking> => {
        const response = await api.patch<Booking>(`/bookings/admin/notifications/${bookingId}/read`);
        return response.data;
    },
};
