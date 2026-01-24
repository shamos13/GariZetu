import { adminCarService } from "./AdminCarService.ts";
import { adminUserService } from "./AdminUserService.ts";
import type { Car } from "../types/Car.ts";

/**
 * Dashboard Statistics Interface
 */
export interface DashboardStats {
    totalCars: number;
    availableCars: number;
    rentedCars: number;
    maintenanceCars: number;
    activeBookings: number;
    totalRevenue: number;
    monthlyRevenue: number;
    revenueChange: number; // Percentage change from last month
    carsChange: number; // Percentage change from last month
    bookingsChange: number; // Percentage change from last month
}

/**
 * Booking Interface
 */
export interface Booking {
    bookingId: string;
    customerName: string;
    carName: string;
    date: string;
    amount: number;
    status: "ACTIVE" | "COMPLETED" | "CANCELLED";
}

/**
 * Revenue Data Point
 */
export interface RevenueDataPoint {
    month: string;
    revenue: number;
}

/**
 * Car Availability Data
 */
export interface CarAvailability {
    available: number;
    rented: number;
    maintenance: number;
    total: number;
}

/**
 * Admin Dashboard Service
 * Fetches dashboard data from backend, falls back to mock data if endpoints don't exist
 */
export const adminDashboardService = {
    /**
     * Get dashboard statistics
     * Uses real data from cars and users, calculates metrics
     */
    getStats: async (): Promise<DashboardStats> => {
        try {
            const cars = await adminCarService.getAll();

            const totalCars = cars.length;
            const availableCars = cars.filter(c => c.carStatus === "AVAILABLE").length;
            const rentedCars = cars.filter(c => c.carStatus === "RENTED").length;
            const maintenanceCars = cars.filter(c => c.carStatus === "MAINTENANCE").length;

            // No bookings API – derive from cars. Revenue is estimated.
            const activeBookings = rentedCars;
            const monthlyRevenue = rentedCars * 15000;
            const totalRevenue = monthlyRevenue * 1.5;

            const revenueChange = 15;
            const carsChange = 12;
            const bookingsChange = 8;

            return {
                totalCars,
                availableCars,
                rentedCars,
                maintenanceCars,
                activeBookings,
                totalRevenue,
                monthlyRevenue,
                revenueChange,
                carsChange,
                bookingsChange,
            };
        } catch (error) {
            console.error("Failed to fetch dashboard stats:", error);
            return getMockStats();
        }
    },

    /**
     * Get recent bookings
     * Uses mock data until /api/v1/bookings exists
     */
    getRecentBookings: async (limit: number = 5): Promise<Booking[]> => {
        return getMockRecentBookings(limit);
    },

    /**
     * Get revenue trend data (last 6 months)
     * Uses mock data until /api/v1/bookings/revenue/trend exists
     */
    getRevenueTrend: async (): Promise<RevenueDataPoint[]> => {
        return getMockRevenueTrend();
    },

    /**
     * Get car availability breakdown
     */
    getCarAvailability: async (): Promise<CarAvailability> => {
        try {
            const cars = await adminCarService.getAll();
            return {
                available: cars.filter(c => c.carStatus === "AVAILABLE").length,
                rented: cars.filter(c => c.carStatus === "RENTED").length,
                maintenance: cars.filter(c => c.carStatus === "MAINTENANCE").length,
                total: cars.length,
            };
        } catch (error) {
            console.error("Failed to fetch car availability:", error);
            return {
                available: 24,
                rented: 18,
                maintenance: 3,
                total: 45,
            };
        }
    },
};

// ========================
// MOCK DATA GENERATORS
// ========================

function getMockStats(): DashboardStats {
    return {
        totalCars: 45,
        availableCars: 24,
        rentedCars: 18,
        maintenanceCars: 3,
        activeBookings: 18,
        totalRevenue: 3600000,
        monthlyRevenue: 2400000,
        revenueChange: 15,
        carsChange: 12,
        bookingsChange: 8,
    };
}

function getMockRecentBookings(limit: number): Booking[] {
    const names = ["John Kamau", "Mary Wanjiku", "Peter Ochieng", "Sarah Muthoni", "David Kipchoge"];
    const cars = [
        "Audi A8 L 2022",
        "Nissan Maxima 2022",
        "Porsche Cayenne 2022",
        "Mercedes-Benz S-Class 2023",
        "BMW 7 Series 2022",
    ];
    const amounts = [12000, 10500, 16500, 18000, 14000];
    
    const bookings: Booking[] = [];
    const now = new Date();
    
    for (let i = 0; i < limit; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        
        bookings.push({
            bookingId: `BK${String(i + 1).padStart(3, '0')}`,
            customerName: names[i % names.length],
            carName: cars[i % cars.length],
            date: date.toISOString(),
            amount: amounts[i % amounts.length],
            status: i < 2 ? "ACTIVE" : "COMPLETED",
        });
    }
    
    return bookings;
}

function getMockRevenueTrend(): RevenueDataPoint[] {
    const months = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const baseRevenue = 1800000;
    
    return months.map((month, index) => ({
        month,
        revenue: baseRevenue + (index * 100000) + Math.random() * 50000,
    }));
}
