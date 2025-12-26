export type CarStatus = "AVAILABLE" | "RENTED" | "MAINTENANCE";
export type FuelType = "PETROL" | "DIESEL" | "ELECTRIC" | "HYBRID";
export type TransmissionType = "MANUAL" | "AUTOMATIC";

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
    carStatus: CarStatus;
    transmissionType: TransmissionType;
    fuelType: FuelType;
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
}
