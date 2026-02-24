import { api } from "../lib/api";
import type { SpringPage } from "../lib/pagination.ts";
import type { Car as BackendCar } from "../dashboard/admin/types/Car";
import type { Car as CustomerCar } from "../data/cars";
import { transformBackendCarsToCustomer, transformBackendCarToCustomer } from "../utils/CarTransformer.ts";

const CARS_CACHE_TTL_MS = 30_000;
let carsCache: CustomerCar[] | null = null;
let carsCacheTimestamp = 0;
let pendingCarsRequest: Promise<CustomerCar[]> | null = null;

const hasFreshCarsCache = (): boolean =>
    carsCache !== null && (Date.now() - carsCacheTimestamp) < CARS_CACHE_TTL_MS;

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
    getAll: async (options?: { forceRefresh?: boolean }): Promise<CustomerCar[]> => {
        const forceRefresh = options?.forceRefresh === true;

        if (!forceRefresh && hasFreshCarsCache()) {
            return carsCache as CustomerCar[];
        }

        if (!forceRefresh && pendingCarsRequest) {
            return pendingCarsRequest;
        }

        try {
            pendingCarsRequest = (async () => {
                const pageSize = 50;
                const fetchFromPagedEndpoint = async (endpoint: string): Promise<BackendCar[]> => {
                    let page = 0;
                    let totalPages = 1;
                    const cars: BackendCar[] = [];

                    while (page < totalPages) {
                        const res = await api.get<SpringPage<BackendCar>>(endpoint, {
                            params: { page, size: pageSize },
                        });
                        cars.push(...res.data.content);
                        totalPages = Math.max(1, res.data.totalPages);
                        page += 1;
                    }

                    return cars;
                };

                let allCars: BackendCar[] | null = null;

                const pagedEndpoints = ["/cars/getcars/paged", "/cars/paged"];
                for (const endpoint of pagedEndpoints) {
                    try {
                        allCars = await fetchFromPagedEndpoint(endpoint);
                        break;
                    } catch (error) {
                        console.warn(`Paged cars endpoint failed (${endpoint})`, error);
                    }
                }

                if (!allCars) {
                    const listEndpoints = ["/cars/getcars", "/cars"];
                    for (const endpoint of listEndpoints) {
                        try {
                            const response = await api.get<BackendCar[]>(endpoint);
                            allCars = response.data;
                            break;
                        } catch (error) {
                            console.warn(`Cars list endpoint failed (${endpoint})`, error);
                        }
                    }
                }

                if (!allCars) {
                    throw new Error("All car listing endpoints failed.");
                }

                const transformed = transformBackendCarsToCustomer(allCars);
                carsCache = transformed;
                carsCacheTimestamp = Date.now();
                return transformed;
            })()
                .finally(() => {
                    pendingCarsRequest = null;
                });

            return await pendingCarsRequest;
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

    invalidateCache: (): void => {
        carsCache = null;
        carsCacheTimestamp = 0;
    },
};
