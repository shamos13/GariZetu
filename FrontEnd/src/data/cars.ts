// Customer-facing car types (separate from admin/backend types)
export type CarStatus = "available" | "rented" | "maintenance";
export type FuelType = "Petrol" | "Diesel" | "Electric" | "Hybrid";
export type TransmissionType = "Manual" | "Automatic";
export type BodyType = "Sedan" | "SUV" | "Hatchback" | "Coupe" | "Convertible" | "Van" | "Truck";

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
    bodyType: BodyType;
    rating: number;
    reviewCount: number;
    description: string;
    features: CarFeature[];
    location: string;
}

// Fallback/sample car data (reduced to 3 cars as you requested)
export const CARS_DATA: Car[] = [
    {
        id: 9999,  // High ID to avoid conflicts with backend
        make: "Toyota",
        model: "Camry",
        year: 2023,
        name: "Toyota Camry 2023",
        dailyPrice: 3500,
        mainImageUrl: "/toyota-camry-placeholder.jpg",  // ← Using mainImageUrl now
        gallery: [
            { id: 1, url: "/toyota-camry-placeholder.jpg", alt: "Toyota Camry Exterior" },
        ],
        mileage: "15,000 km",
        transmission: "Automatic",
        fuelType: "Petrol",
        seatingCapacity: 5,
        engineCapacity: "2.5L",
        color: "White",
        status: "available",
        bodyType: "Sedan",
        rating: 4.7,
        reviewCount: 32,
        description: "The Toyota Camry delivers reliable performance and comfort. Perfect for business trips or family outings.",
        features: [
            { name: "Leather Seats", available: true },
            { name: "Apple CarPlay & Android Auto", available: true },
            { name: "Backup Camera", available: true },
            { name: "Cruise Control", available: true },
        ],
        location: "Nairobi, Westlands",
    },
    {
        id: 9998,
        make: "Nissan",
        model: "X-Trail",
        year: 2023,
        name: "Nissan X-Trail 2023",
        dailyPrice: 4000,
        mainImageUrl: "/nissan-xtrail-placeholder.jpg",
        gallery: [
            { id: 1, url: "/nissan-xtrail-placeholder.jpg", alt: "Nissan X-Trail Exterior" },
        ],
        mileage: "12,000 km",
        transmission: "Automatic",
        fuelType: "Petrol",
        seatingCapacity: 7,
        engineCapacity: "2.0L",
        color: "Black",
        status: "available",
        bodyType: "SUV",
        rating: 4.6,
        reviewCount: 28,
        description: "The Nissan X-Trail offers spacious seating for seven and modern technology features.",
        features: [
            { name: "7 Seats", available: true },
            { name: "360° Camera", available: true },
            { name: "Keyless Entry", available: true },
            { name: "Climate Control", available: true },
        ],
        location: "Nairobi, Karen",
    },
    {
        id: 9997,
        make: "Mercedes-Benz",
        model: "E-Class",
        year: 2023,
        name: "Mercedes-Benz E-Class 2023",
        dailyPrice: 5500,
        mainImageUrl: "/mercedes-eclass-placeholder.jpg",
        gallery: [
            { id: 1, url: "/mercedes-eclass-placeholder.jpg", alt: "Mercedes E-Class Exterior" },
        ],
        mileage: "8,000 km",
        transmission: "Automatic",
        fuelType: "Hybrid",
        seatingCapacity: 5,
        engineCapacity: "2.0L Turbo",
        color: "Silver",
        status: "available",
        bodyType: "Sedan",
        rating: 4.9,
        reviewCount: 45,
        description: "Experience luxury and elegance with the Mercedes-Benz E-Class. Premium comfort meets cutting-edge technology.",
        features: [
            { name: "Premium Leather", available: true },
            { name: "Panoramic Sunroof", available: true },
            { name: "Ambient Lighting", available: true },
            { name: "Burmester Sound System", available: true },
        ],
        location: "Nairobi, Kilimani",
    },
];

// Helper functions
export const getUniqueMakes = () => [...new Set(CARS_DATA.map(car => car.make))];
export const getUniqueBodyTypes = () => [...new Set(CARS_DATA.map(car => car.bodyType))];
export const getPriceRange = () => {
    const prices = CARS_DATA.map(car => car.dailyPrice);
    return { min: Math.min(...prices), max: Math.max(...prices) };
};
export const getCarById = (id: number) => CARS_DATA.find(car => car.id === id);
