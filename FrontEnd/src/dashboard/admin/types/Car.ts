export type CarStatus = "AVAILABLE" | "RENTED" | "MAINTENANCE";
export type FuelType = "PETROL" | "DIESEL" | "ELECTRIC" | "HYBRID";
export type TransmissionType = "MANUAL" | "AUTOMATIC";
export type BodyType = "SUV" | "SEDAN" | "HATCHBACK" | "COUPE" | "VAN" | "MINIVAN" | "TRUCK";
export type FeaturedCategory =
    | "Popular Car"
    | "Luxury Car"
    | "Vintage Car"
    | "Family Car"
    | "Off-Road Car";

export interface Car {
    carId: number;
    make: string;
    registrationNumber: string;
    vehicleModel: string;
    year: number;
    engineCapacity: number;
    colour: string;
    mileage: number;
    dailyPrice: number;
    seatingCapacity: number;
    mainImageUrl: string;
    galleryImageUrls?: string[];
    carStatus: CarStatus;
    transmissionType: TransmissionType;
    fuelType: FuelType;
    bodyType: BodyType;
    featuredCategory: FeaturedCategory;
    description: string;
    featureName: string[];
    // Backend may also return a features array with rich objects
    features?: Array<{
        featureId?: number;
        featureName: string;
        featureDescription?: string;
        featureCategory?: string;
        available?: boolean;
    }>;
    createdAt: string;
    updatedAt: string;
}

export interface CarCreateRequest {
    make: string;
    registrationNumber: string;
    vehicleModel: string;
    year: number;
    engineCapacity: number;
    colour: string;
    mileage: number;
    dailyPrice: number;
    seatingCapacity: number;
    transmissionType: TransmissionType;
    fuelType: FuelType;
    carStatus: CarStatus;
    bodyType: BodyType;
    featuredCategory: FeaturedCategory;
    description?: string;
    featureName?: string[];
}
