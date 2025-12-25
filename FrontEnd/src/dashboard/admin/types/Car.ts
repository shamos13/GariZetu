export interface Car {
    id: string;
    name: string;
    year: number;
    price: number;
    category: string;
    transmission: string;
    seats: number;
    fuelType: string;
    image: string;
    description?: string;
    available: boolean;
}