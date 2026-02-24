// File: services/adminCarService.ts
import { api } from "../../../lib/api";
import { carService } from "../../../services/carService.ts";
import type {
    BodyType,
    Car as BackendCar,
    CarStatus,
    FeaturedCategory,
    FuelType,
    TransmissionType,
} from "../types/Car";

/**
 * Admin-only car service
 * Handles car management operations (create, update, delete)
 */
export const adminCarService = {
    /**
     * Get all cars (raw backend format for admin)
     */
    getAll: async (): Promise<BackendCar[]> => {
        try {
            const res = await api.get<BackendCar[]>("/cars/getcars");
            return res.data;
        } catch (error) {
            console.error("Failed to fetch admin cars:", error);
            throw error;
        }
    },
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

            carService.invalidateCache();
            return res.data;
        } catch (error) {
            console.error("Failed to create car:", error);
            throw error;
        }
    },

    /**
     * Update an existing car (partial update).
     * You can update any combination of: status, mileage, dailyPrice.
     * Optionally pass a new image file to update the photo.
     */
    updateCar: async (
        id: number,
        payload: {
            make?: string;
            registrationNumber?: string;
            vehicleModel?: string;
            year?: number;
            engineCapacity?: number;
            colour?: string;
            mileage?: number;
            dailyPrice?: number;
            seatingCapacity?: number;
            carStatus?: CarStatus;
            transmissionType?: TransmissionType;
            fuelType?: FuelType;
            bodyType?: BodyType;
            featuredCategory?: FeaturedCategory;
            description?: string;
            featureName?: string[];
        },
        image?: File,
        galleryImages?: File[],
        existingGalleryUrls: string[] = [],
        syncGallery = false
    ): Promise<BackendCar> => {
        try {
            // First update JSON fields (status, mileage, dailyPrice)
            const res = await api.patch<BackendCar>(
                `/cars/${id}`,
                payload
            );

            let updatedCar = res.data;

            // If there is a new image, update it in a separate call
            if (image) {
                const formData = new FormData();
                formData.append("image", image);

                const imageRes = await api.patch<BackendCar>(
                    `/cars/${id}/image`,
                    formData,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data"
                        }
                    }
                );

                updatedCar = imageRes.data;
            }

            const shouldSyncGallery = syncGallery || (galleryImages && galleryImages.length > 0);
            if (shouldSyncGallery) {
                const formData = new FormData();
                existingGalleryUrls.forEach((url) => formData.append("existingUrls", url));
                (galleryImages || []).forEach((file) => formData.append("images", file));

                const galleryRes = await api.patch<BackendCar>(
                    `/cars/${id}/gallery`,
                    formData,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data"
                        }
                    }
                );

                updatedCar = galleryRes.data;
            }

            carService.invalidateCache();
            return updatedCar;
        } catch (error) {
            console.error(`Failed to update car ${id}:`, error);
            throw error;
        }
    },

    deleteCar: async (id: number): Promise<void> => {
        try {
            await api.delete(`/cars/${id}`);
            carService.invalidateCache();
        } catch (error) {
            console.error(`Failed to delete car ${id}:`, error);
            throw error;
        }
    },
};
