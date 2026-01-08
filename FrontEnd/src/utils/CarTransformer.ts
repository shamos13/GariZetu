/**
 * Transformation utility to convert backend Car data to customer-facing Car format
 *
 * This file bridges the gap between:
 * - Backend types (from dashboard/admin/types/Car.ts)
 * - Customer types (from data/cars.ts)
 */

import type { Car as BackendCar } from "../dashboard/admin/types/Car";
import type { Car as CustomerCar, BodyType, CarStatus, FuelType, TransmissionType } from "../data/cars";

/**
 * Transform a backend Car to customer Car format
 *
 * Adds display fields that don't exist in backend yet:
 * - name (computed from make + model + year)
 * - bodyType (inferred from model)
 * - rating (default 4.5)
 * - reviewCount (default 0)
 * - description (generated)
 * - features (empty array for now)
 * - location (default)
 * - gallery (single image from mainImageUrl)
 */
export function transformBackendCarToCustomer(backendCar: BackendCar): CustomerCar {
    return {
        // Map backend fields to customer fields
        id: backendCar.carId,
        make: backendCar.make,
        model: backendCar.vehicleModel,
        year: backendCar.year,

        // Computed name
        name: `${backendCar.make} ${backendCar.vehicleModel} ${backendCar.year}`,

        dailyPrice: backendCar.dailyPrice,

        // Direct mapping - both use mainImageUrl now!
        mainImageUrl: backendCar.mainImageUrl,

        // Create gallery from main image
        gallery: [
            {
                id: 1,
                url: backendCar.mainImageUrl,
                alt: `${backendCar.make} ${backendCar.vehicleModel} exterior`
            }
        ],

        // Format mileage with comma separator
        mileage: `${backendCar.mileage.toLocaleString()} km`,

        // Normalize enum values (AUTOMATIC → Automatic, PETROL → Petrol)
        transmission: normalizeTransmission(backendCar.transmissionType),
        fuelType: normalizeFuelType(backendCar.fuelType),

        seatingCapacity: backendCar.seatingCapacity,

        // Format engine capacity
        engineCapacity: `${(backendCar.engineCapacity / 1000).toFixed(1)}L`,

        color: backendCar.colour,

        // Normalize status (AVAILABLE → available)
        status: normalizeStatus(backendCar.carStatus),

        // Infer body type from model name (default until backend has it)
        bodyType: inferBodyType(backendCar.vehicleModel),

        // Default values for fields not in backend yet
        rating: 4.5,
        reviewCount: 0,
        description: generateDescription(backendCar),
        features: [],  // Empty for now, will add when backend supports
        location: "Nairobi, Kenya",  // Default location
    };
}

/**
 * Transform array of backend cars to customer format
 */
export function transformBackendCarsToCustomer(backendCars: BackendCar[]): CustomerCar[] {
    return backendCars.map(transformBackendCarToCustomer);
}

/**
 * Normalize backend CarStatus to customer format
 * AVAILABLE → available
 * RENTED → rented
 * MAINTENANCE → maintenance
 */
function normalizeStatus(backendStatus: string): CarStatus {
    return backendStatus.toLowerCase() as CarStatus;
}

/**
 * Normalize backend TransmissionType to customer format
 * AUTOMATIC → Automatic
 * MANUAL → Manual
 */
function normalizeTransmission(backendTransmission: string): TransmissionType {
    return (backendTransmission.charAt(0).toUpperCase() +
        backendTransmission.slice(1).toLowerCase()) as TransmissionType;
}

/**
 * Normalize backend FuelType to customer format
 * PETROL → Petrol
 * DIESEL → Diesel
 * ELECTRIC → Electric
 * HYBRID → Hybrid
 */
function normalizeFuelType(backendFuel: string): FuelType {
    return (backendFuel.charAt(0).toUpperCase() +
        backendFuel.slice(1).toLowerCase()) as FuelType;
}

/**
 * Infer body type from vehicle model name
 * This is a temporary solution until backend has bodyType field
 */
function inferBodyType(model: string): BodyType {
    const modelLower = model.toLowerCase();

    // SUV detection
    if (modelLower.includes('suv') ||
        modelLower.includes('x5') ||
        modelLower.includes('x3') ||
        modelLower.includes('cayenne') ||
        modelLower.includes('cruiser') ||
        modelLower.includes('x-trail') ||
        modelLower.includes('range rover') ||
        modelLower.includes('q7') ||
        modelLower.includes('gle')) {
        return 'SUV';
    }

    // Hatchback detection
    if (modelLower.includes('hatchback') ||
        modelLower.includes('golf') ||
        modelLower.includes('polo') ||
        modelLower.includes('fit') ||
        modelLower.includes('vitz')) {
        return 'Hatchback';
    }

    // Coupe detection
    if (modelLower.includes('coupe') ||
        modelLower.includes('911') ||
        modelLower.includes('corvette')) {
        return 'Coupe';
    }

    // Van detection
    if (modelLower.includes('van') ||
        modelLower.includes('hiace') ||
        modelLower.includes('transit')) {
        return 'Van';
    }

    // Truck detection
    if (modelLower.includes('truck') ||
        modelLower.includes('hilux') ||
        modelLower.includes('ranger')) {
        return 'Truck';
    }

    // Default to Sedan for everything else
    return 'Sedan';
}

/**
 * Generate a basic description from car details
 * This is temporary until backend has descriptions
 */
function generateDescription(car: BackendCar): string {
    const transmission = normalizeTransmission(car.transmissionType).toLowerCase();
    const fuel = normalizeFuelType(car.fuelType).toLowerCase();

    return `Experience the ${car.year} ${car.make} ${car.vehicleModel}, featuring a ${transmission} transmission and ${fuel} engine. This ${car.colour} ${car.vehicleModel} seats ${car.seatingCapacity} passengers comfortably and is perfect for your next adventure in Nairobi.`;
}
