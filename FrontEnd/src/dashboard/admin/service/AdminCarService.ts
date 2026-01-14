// File: services/adminCarService.ts
import { api } from "../../../lib/api";
import type { Car as BackendCar } from "../types/Car";

/**
 * Admin-only car service
 * Handles car management operations (create, update, delete)
 */
export const adminCarService = {
    /**
     * Create a new car
     *
     * @param formData - FormData containing car details and image
     * @returns Promise<BackendCar> - The created car from backend
     */
    createCar: async (formData: FormData): Promise<BackendCar> => {
        try {
            const res = await api.post<BackendCar>(
                "/cars/admin/create-car",  // Endpoint path (api already has base URL)
                formData,                   // The FormData to send
                {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                }
            );

            return res.data;
        } catch (error) {
            console.error("Failed to create car:", error);
            throw error;
        }
    },

    /**
     * Update an existing car
     * TODO: Implement when backend endpoint is ready
     */
    updateCar: async (id: number, formData: FormData): Promise<BackendCar> => {
        try {
            const res = await api.put<BackendCar>(
                `/cars/admin/${id}`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                }
            );

            return res.data;
        } catch (error) {
            console.error(`Failed to update car ${id}:`, error);
            throw error;
        }
    },

    /**
     * Delete a car
     * TODO: Implement when backend endpoint is ready
     */
    deleteCar: async (id: number): Promise<void> => {
        try {
            await api.delete(`/cars/admin/${id}`);
        } catch (error) {
            console.error(`Failed to delete car ${id}:`, error);
            throw error;
        }
    },
};