/**
 * Transformation utility to convert backend Car data to customer-facing Car format
 *
 * UPDATED: Now uses real backend fields (description, bodyType, features) instead of generating them
 *
 * This file bridges the gap between:
 * - Backend types (from dashboard/admin/types/Car.ts)
 * - Customer types (from data/cars.ts)
 */

import type { Car as BackendCar } from "../dashboard/admin/types/Car";
import type { Car as CustomerCar, BodyType, CarStatus, FuelType, TransmissionType, CarFeature } from "../data/cars";

/**
 * Transform a backend Car to customer Car format
 *
 * Now uses real backend data for:
 * ✅ description (from backend)
 * ✅ bodyType (from backend)
 * ✅ features (from backend featureName array)
 *
 * Still computed/defaulted:
 * - name (computed from make + model + year)
 * - rating (default 4.5 until reviews implemented)
 * - reviewCount (default 0 until reviews implemented)
 * - location (default "Nairobi, Kenya")
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

        // Direct mapping - both use mainImageUrl
        mainImageUrl: backendCar.mainImageUrl,

        // Create gallery from main image + optional gallery images
        gallery: buildGallery(backendCar),

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

        // ✅ UPDATED: Use real bodyType from backend (with fallback)
        bodyType: backendCar.bodyType
            ? normalizeBodyType(backendCar.bodyType)
            : inferBodyType(backendCar.vehicleModel),

        // ✅ UPDATED: Use real description from backend (with fallback)
        description: backendCar.description && backendCar.description.trim() !== ""
            ? backendCar.description
            : generateDescription(backendCar),

        // ✅ UPDATED: Transform backend features or featureName array to CarFeature objects
        features: transformFeatures(backendCar.features, backendCar.featureName),

        // Default values for fields not in backend yet
        rating: 4.5,  // TODO: Will come from reviews table later
        reviewCount: 0,  // TODO: Will come from reviews table later
        location: "Nairobi, Kenya",  // TODO: Will use backend location field later
    };
}

/**
 * Transform array of backend cars to customer format
 */
export function transformBackendCarsToCustomer(backendCars: BackendCar[]): CustomerCar[] {
    return backendCars.map(transformBackendCarToCustomer);
}

/**
 * ✅ NEW: Transform backend feature names to CarFeature objects
 *
 * Backend gives: ["GPS Navigation", "Bluetooth", "Leather Seats"]
 * Customer needs: [{ name: "GPS Navigation", available: true }, ...]
 */
function transformFeatures(features?: any[] , featureNames?: string[]): CarFeature[] {
    // Prefer rich features array from backend if available
    if (features && features.length > 0) {
        return features.map((f) => ({
            name: f.featureName ?? f.name ?? "Feature",
            available: f.available ?? true,
        }));
    }

    if (featureNames && featureNames.length > 0) {
        return featureNames.map(name => ({
            name: name,
            available: true  // All features from backend are available
        }));
    }

    return [];
}

function buildGallery(backendCar: BackendCar) {
    const urls = [
        backendCar.mainImageUrl,
        ...(backendCar.galleryImageUrls || []),
    ].filter(Boolean);

    const uniqueUrls = Array.from(new Set(urls));

    if (uniqueUrls.length === 0) {
        return [];
    }

    return uniqueUrls.map((url, index) => ({
        id: index + 1,
        url,
        alt: `${backendCar.make} ${backendCar.vehicleModel} image ${index + 1}`,
    }));
}

/**
 * ✅ NEW: Normalize backend BodyType to customer format
 * Backend: "SUV" or "SEDAN"
 * Customer: "SUV" or "Sedan"
 */
function normalizeBodyType(backendBodyType: string): BodyType {
    // Convert SEDAN → Sedan, SUV → SUV, HATCHBACK → Hatchback
    return backendBodyType.charAt(0).toUpperCase() +
    backendBodyType.slice(1).toLowerCase() as BodyType;
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
 * ⚠️ FALLBACK ONLY: Infer body type from vehicle model name
 * This is now only used as a fallback if backend bodyType is missing
 *
 * @deprecated Will be removed once all cars have bodyType in backend
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
 * ⚠️ FALLBACK ONLY: Generate a basic description from car details
 * This is now only used as a fallback if backend description is missing/empty
 *
 * @deprecated Will be removed once all cars have descriptions in backend
 */
function generateDescription(car: BackendCar): string {
    const transmission = normalizeTransmission(car.transmissionType).toLowerCase();
    const fuel = normalizeFuelType(car.fuelType).toLowerCase();
    const bodyType = car.bodyType
        ? normalizeBodyType(car.bodyType).toLowerCase()
        : inferBodyType(car.vehicleModel).toLowerCase();

    return `Experience the ${car.year} ${car.make} ${car.vehicleModel}, a ${bodyType} featuring a ${transmission} transmission and ${fuel} engine. This ${car.colour} vehicle seats ${car.seatingCapacity} passengers comfortably and is perfect for your next adventure in Nairobi.`;
}
