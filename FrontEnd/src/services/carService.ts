import { api } from "../lib/api";
import type { Car as BackendCar } from "../dashboard/admin/types/Car";
import type { Car as CustomerCar } from "../data/cars";
import { transformBackendCarsToCustomer, transformBackendCarToCustomer } from "../utils/CarTransformer.ts";

/**
 * Customer-facing car service
 * Fetches cars from backend and transforms them for display on website
 */
export const carService = {
    /**
     * Get all cars for customer browsing
     *
     * Flow:
     * 1. Fetch from backend (returns BackendCar[])
     * 2. Transform to customer format (CustomerCar[])
     * 3. Return transformed data
     */
    getAll: async (): Promise<CustomerCar[]> => {
        try {
            const res = await api.get<BackendCar[]>("/cars/getcars");

            // Transform backend cars to customer format
            return transformBackendCarsToCustomer(res.data);
        } catch (error) {
            console.error("Failed to fetch cars:", error);
            throw error;  // Let component handle the error
        }
    },

    /**
     * Get a single car by ID for detail page
     */
    getById: async (id: number): Promise<CustomerCar> => {
        try {
            const res = await api.get<BackendCar>(`/cars/${id}`);

            // Transform single backend car to customer format
            return transformBackendCarToCustomer(res.data);
        } catch (error) {
            console.error(`Failed to fetch car ${id}:`, error);
            throw error;
        }
    },
};
