// Customer-facing car types (separate from admin/backend types)
export type CarStatus = "available" | "rented" | "maintenance";
export type CarAvailabilityStatus = "available" | "soft_locked" | "booked" | "maintenance";
export type FuelType = "Petrol" | "Diesel" | "Electric" | "Hybrid" | "Plug-In Hybrid";
export type TransmissionType = "Manual" | "Automatic";
export type BodyType = "Sedan" | "SUV" | "Hatchback" | "Coupe" | "Convertible" | "Van" | "Minivan" | "Truck";
export type FeaturedCategory =
    | "Popular Car"
    | "Luxury Car"
    | "Vintage Car"
    | "Family Car"
    | "Off-Road Car";

export interface CarImage {
    id: number;
    url: string;
    alt: string;
}

export interface CarFeature {
    name: string;
    available: boolean;
}

// Customer-facing Car interface (for display on website)
export interface Car {
    id: number;
    make: string;
    model: string;
    year: number;
    name: string; // computed: make + model + year
    dailyPrice: number;
    mainImageUrl: string;  // ← CHANGED from mainImage to match backend
    gallery: CarImage[];
    mileage: string;
    transmission: TransmissionType;
    fuelType: FuelType;
    seatingCapacity: number;
    engineCapacity: string;
    color: string;
    status: CarStatus;
    availabilityStatus?: CarAvailabilityStatus;
    availabilityMessage?: string | null;
    softLockExpiresAt?: string | null;
    nextAvailableAt?: string | null;
    blockedFromDate?: string | null;
    blockedToDate?: string | null;
    bodyType: BodyType;
    featuredCategory: FeaturedCategory;
    rating: number;
    reviewCount: number;
    description: string;
    features: CarFeature[];
    location: string;
}
