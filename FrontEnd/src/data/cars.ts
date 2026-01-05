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

export interface Car {
    id: number;
    make: string;
    model: string;
    year: number;
    name: string; // computed: make + model + year
    dailyPrice: number;
    mainImage: string;
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

// Sample car data
export const CARS_DATA: Car[] = [
    {
        id: 1,
        make: "Audi",
        model: "A8 L",
        year: 2022,
        name: "Audi A8 L 2022",
        dailyPrice: 4000,
        mainImage: "/audi-a8-gray.jpg",
        gallery: [
            { id: 1, url: "/audi-a8-gray.jpg", alt: "Audi A8 L Exterior" },
            { id: 2, url: "/audi-a8-gray.jpg", alt: "Audi A8 L Interior" },
            { id: 3, url: "/audi-a8-gray.jpg", alt: "Audi A8 L Dashboard" },
        ],
        mileage: "12 km/L",
        transmission: "Automatic",
        fuelType: "Petrol",
        seatingCapacity: 4,
        engineCapacity: "3.0L V6",
        color: "Gray",
        status: "available",
        bodyType: "Sedan",
        rating: 4.9,
        reviewCount: 47,
        description: "The Audi A8 L is the epitome of luxury and sophistication. With its extended wheelbase, you'll enjoy unparalleled rear-seat comfort while being surrounded by cutting-edge technology and premium materials. Perfect for business executives or anyone seeking the ultimate in automotive luxury.",
        features: [
            { name: "Leather Seats", available: true },
            { name: "Apple CarPlay & Android Auto", available: true },
            { name: "360° Camera", available: true },
            { name: "Adaptive Cruise Control", available: true },
            { name: "Heated & Cooled Seats", available: true },
            { name: "Bang & Olufsen Sound System", available: true },
            { name: "Panoramic Sunroof", available: true },
            { name: "Wireless Charging", available: true },
        ],
        location: "Nairobi, Westlands",
    },
    {
        id: 2,
        make: "Nissan",
        model: "Maxima Platinum",
        year: 2022,
        name: "Nissan Maxima Platinum 2022",
        dailyPrice: 3500,
        mainImage: "/nissan-maxima-white.jpg",
        gallery: [
            { id: 1, url: "/nissan-maxima-white.jpg", alt: "Nissan Maxima Exterior" },
            { id: 2, url: "/nissan-maxima-white.jpg", alt: "Nissan Maxima Interior" },
            { id: 3, url: "/nissan-maxima-white.jpg", alt: "Nissan Maxima Dashboard" },
        ],
        mileage: "14 km/L",
        transmission: "Automatic",
        fuelType: "Petrol",
        seatingCapacity: 5,
        engineCapacity: "3.5L V6",
        color: "White",
        status: "available",
        bodyType: "Sedan",
        rating: 4.7,
        reviewCount: 32,
        description: "The Nissan Maxima Platinum delivers an exhilarating driving experience with its powerful V6 engine and sport-tuned suspension. Its bold design turns heads while the premium interior keeps you comfortable on every journey.",
        features: [
            { name: "Premium Leather Seats", available: true },
            { name: "Apple CarPlay & Android Auto", available: true },
            { name: "Intelligent Around View Monitor", available: true },
            { name: "ProPILOT Assist", available: true },
            { name: "Heated Seats", available: true },
            { name: "Bose Premium Audio", available: true },
            { name: "Dual Panel Moonroof", available: true },
            { name: "Navigation System", available: true },
        ],
        location: "Nairobi, Karen",
    },
    {
        id: 3,
        make: "Porsche",
        model: "Cayenne GTS",
        year: 2022,
        name: "Porsche Cayenne GTS 2022",
        dailyPrice: 5500,
        mainImage: "/porsche-cayenne-black.jpg",
        gallery: [
            { id: 1, url: "/porsche-cayenne-black.jpg", alt: "Porsche Cayenne Exterior" },
            { id: 2, url: "/porsche-cayenne-black.jpg", alt: "Porsche Cayenne Interior" },
            { id: 3, url: "/porsche-cayenne-black.jpg", alt: "Porsche Cayenne Dashboard" },
        ],
        mileage: "10 km/L",
        transmission: "Automatic",
        fuelType: "Petrol",
        seatingCapacity: 5,
        engineCapacity: "4.0L V8",
        color: "Black",
        status: "available",
        bodyType: "SUV",
        rating: 4.9,
        reviewCount: 56,
        description: "The Porsche Cayenne GTS combines the practicality of an SUV with the soul of a sports car. Its twin-turbo V8 engine delivers thrilling performance while maintaining the luxury and comfort Porsche is known for.",
        features: [
            { name: "Sport Leather Seats", available: true },
            { name: "Porsche Communication Management", available: true },
            { name: "360° Surround View", available: true },
            { name: "Adaptive Air Suspension", available: true },
            { name: "Heated & Ventilated Seats", available: true },
            { name: "Burmester Sound System", available: true },
            { name: "Panoramic Roof", available: true },
            { name: "Sport Chrono Package", available: true },
        ],
        location: "Nairobi, Kilimani",
    },
    {
        id: 4,
        make: "Mercedes-Benz",
        model: "E-Class",
        year: 2023,
        name: "Mercedes-Benz E-Class 2023",
        dailyPrice: 4500,
        mainImage: "/mercedes-e-class.jpg",
        gallery: [
            { id: 1, url: "/mercedes-e-class.jpg", alt: "Mercedes E-Class Exterior" },
            { id: 2, url: "/mercedes-e-class.jpg", alt: "Mercedes E-Class Interior" },
            { id: 3, url: "/mercedes-e-class.jpg", alt: "Mercedes E-Class Dashboard" },
        ],
        mileage: "13 km/L",
        transmission: "Automatic",
        fuelType: "Hybrid",
        seatingCapacity: 5,
        engineCapacity: "2.0L Turbo",
        color: "Silver",
        status: "available",
        bodyType: "Sedan",
        rating: 4.8,
        reviewCount: 41,
        description: "The Mercedes-Benz E-Class represents the perfect balance of comfort, technology, and performance. Its elegant design and refined interior make every drive a first-class experience.",
        features: [
            { name: "Nappa Leather Seats", available: true },
            { name: "MBUX Infotainment", available: true },
            { name: "360° Camera", available: true },
            { name: "Active Distance Assist", available: true },
            { name: "Heated & Cooled Seats", available: true },
            { name: "Burmester Surround Sound", available: true },
            { name: "Panoramic Sunroof", available: true },
            { name: "Ambient Lighting", available: true },
        ],
        location: "Nairobi, Lavington",
    },
    {
        id: 5,
        make: "BMW",
        model: "X5 xDrive40i",
        year: 2023,
        name: "BMW X5 xDrive40i 2023",
        dailyPrice: 5000,
        mainImage: "/bmw-x5.jpg",
        gallery: [
            { id: 1, url: "/bmw-x5.jpg", alt: "BMW X5 Exterior" },
            { id: 2, url: "/bmw-x5.jpg", alt: "BMW X5 Interior" },
            { id: 3, url: "/bmw-x5.jpg", alt: "BMW X5 Dashboard" },
        ],
        mileage: "11 km/L",
        transmission: "Automatic",
        fuelType: "Petrol",
        seatingCapacity: 7,
        engineCapacity: "3.0L Turbo I6",
        color: "Blue",
        status: "available",
        bodyType: "SUV",
        rating: 4.8,
        reviewCount: 38,
        description: "The BMW X5 delivers commanding presence with athletic performance. Its spacious interior accommodates up to seven passengers while offering the driving dynamics BMW is famous for.",
        features: [
            { name: "Vernasca Leather Seats", available: true },
            { name: "BMW Live Cockpit Professional", available: true },
            { name: "Parking Assistant Plus", available: true },
            { name: "Driving Assistance Professional", available: true },
            { name: "4-Zone Climate Control", available: true },
            { name: "Harman Kardon Sound", available: true },
            { name: "Panoramic Sky Lounge", available: true },
            { name: "Gesture Control", available: true },
        ],
        location: "Nairobi, Upperhill",
    },
    {
        id: 6,
        make: "Toyota",
        model: "Land Cruiser 300",
        year: 2023,
        name: "Toyota Land Cruiser 300 2023",
        dailyPrice: 6000,
        mainImage: "/toyota-landcruiser.jpg",
        gallery: [
            { id: 1, url: "/toyota-landcruiser.jpg", alt: "Land Cruiser Exterior" },
            { id: 2, url: "/toyota-landcruiser.jpg", alt: "Land Cruiser Interior" },
            { id: 3, url: "/toyota-landcruiser.jpg", alt: "Land Cruiser Dashboard" },
        ],
        mileage: "9 km/L",
        transmission: "Automatic",
        fuelType: "Diesel",
        seatingCapacity: 7,
        engineCapacity: "3.3L V6 Diesel",
        color: "White",
        status: "available",
        bodyType: "SUV",
        rating: 4.9,
        reviewCount: 63,
        description: "The legendary Toyota Land Cruiser 300 combines unmatched off-road capability with luxury refinement. Whether conquering rough terrain or cruising city streets, it delivers exceptional performance.",
        features: [
            { name: "Premium Leather Seats", available: true },
            { name: "Toyota Safety Sense", available: true },
            { name: "Multi-Terrain Monitor", available: true },
            { name: "Crawl Control", available: true },
            { name: "Heated & Ventilated Seats", available: true },
            { name: "JBL Premium Audio", available: true },
            { name: "Moonroof", available: true },
            { name: "Kinetic Dynamic Suspension", available: true },
        ],
        location: "Nairobi, Runda",
    },
    {
        id: 7,
        make: "Range Rover",
        model: "Sport HSE",
        year: 2023,
        name: "Range Rover Sport HSE 2023",
        dailyPrice: 7000,
        mainImage: "/range-rover-sport.jpg",
        gallery: [
            { id: 1, url: "/range-rover-sport.jpg", alt: "Range Rover Sport Exterior" },
            { id: 2, url: "/range-rover-sport.jpg", alt: "Range Rover Sport Interior" },
            { id: 3, url: "/range-rover-sport.jpg", alt: "Range Rover Sport Dashboard" },
        ],
        mileage: "10 km/L",
        transmission: "Automatic",
        fuelType: "Petrol",
        seatingCapacity: 5,
        engineCapacity: "3.0L I6 Turbo",
        color: "Gray",
        status: "available",
        bodyType: "SUV",
        rating: 4.9,
        reviewCount: 52,
        description: "The Range Rover Sport HSE embodies British luxury and capability. Its striking design, commanding road presence, and sophisticated interior make it the ultimate statement vehicle.",
        features: [
            { name: "Windsor Leather Seats", available: true },
            { name: "Pivi Pro Infotainment", available: true },
            { name: "3D Surround Camera", available: true },
            { name: "Adaptive Dynamics", available: true },
            { name: "Executive Class Rear Seats", available: true },
            { name: "Meridian Signature Sound", available: true },
            { name: "Sliding Panoramic Roof", available: true },
            { name: "ClearSight Digital Mirror", available: true },
        ],
        location: "Nairobi, Muthaiga",
    },
    {
        id: 8,
        make: "Lexus",
        model: "ES 350",
        year: 2023,
        name: "Lexus ES 350 2023",
        dailyPrice: 3800,
        mainImage: "/lexus-es350.jpg",
        gallery: [
            { id: 1, url: "/lexus-es350.jpg", alt: "Lexus ES 350 Exterior" },
            { id: 2, url: "/lexus-es350.jpg", alt: "Lexus ES 350 Interior" },
            { id: 3, url: "/lexus-es350.jpg", alt: "Lexus ES 350 Dashboard" },
        ],
        mileage: "14 km/L",
        transmission: "Automatic",
        fuelType: "Petrol",
        seatingCapacity: 5,
        engineCapacity: "3.5L V6",
        color: "Pearl White",
        status: "available",
        bodyType: "Sedan",
        rating: 4.7,
        reviewCount: 29,
        description: "The Lexus ES 350 delivers effortless luxury with whisper-quiet comfort. Its refined powertrain and meticulously crafted interior create a sanctuary on wheels.",
        features: [
            { name: "Semi-Aniline Leather", available: true },
            { name: "Lexus Interface", available: true },
            { name: "Panoramic View Monitor", available: true },
            { name: "Lexus Safety System+", available: true },
            { name: "Heated & Ventilated Seats", available: true },
            { name: "Mark Levinson Audio", available: true },
            { name: "Panoramic Glass Roof", available: true },
            { name: "Digital Rearview Mirror", available: true },
        ],
        location: "Nairobi, Gigiri",
    },
];

// Filter helper functions
export const getUniqueMakes = () => [...new Set(CARS_DATA.map(car => car.make))];
export const getUniqueBodyTypes = () => [...new Set(CARS_DATA.map(car => car.bodyType))];
export const getPriceRange = () => {
    const prices = CARS_DATA.map(car => car.dailyPrice);
    return { min: Math.min(...prices), max: Math.max(...prices) };
};
export const getCarById = (id: number) => CARS_DATA.find(car => car.id === id);

