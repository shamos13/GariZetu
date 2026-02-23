import { api } from "../../../lib/api.ts";
import { adminCarService } from "./AdminCarService.ts";
import type { Booking as BackendBooking, BookingStats, BookingStatus } from "../../../services/BookingService.ts";
import { getHttpStatus } from "../../../lib/errorUtils.ts";

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
    status: BookingStatus;
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

const REVENUE_INCLUDED_STATUSES: BookingStatus[] = ["CONFIRMED", "ACTIVE", "COMPLETED", "ADMIN_NOTIFIED"];
let pendingBookingsRequest: Promise<BackendBooking[]> | null = null;

const parseDate = (dateValue: string): Date | null => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
        const [year, month, day] = dateValue.split("-").map(Number);
        const localDate = new Date(year, month - 1, day);
        return Number.isNaN(localDate.getTime()) ? null : localDate;
    }

    const date = new Date(dateValue);
    return Number.isNaN(date.getTime()) ? null : date;
};

const calculatePercentageChange = (current: number, previous: number): number => {
    if (previous === 0) {
        return current > 0 ? 100 : 0;
    }

    return Math.round(((current - previous) / previous) * 100);
};

const getBookingDate = (booking: BackendBooking): Date | null => {
    return parseDate(booking.createdAt) ?? parseDate(booking.pickupDate);
};

const isRevenueBooking = (booking: BackendBooking): boolean => {
    return REVENUE_INCLUDED_STATUSES.includes(booking.bookingStatus);
};

const getRevenueForMonth = (bookings: BackendBooking[], year: number, month: number): number => {
    return bookings.reduce((sum, booking) => {
        if (!isRevenueBooking(booking)) {
            return sum;
        }

        const bookingDate = getBookingDate(booking);
        if (!bookingDate) {
            return sum;
        }

        if (bookingDate.getFullYear() === year && bookingDate.getMonth() === month) {
            return sum + booking.totalPrice;
        }

        return sum;
    }, 0);
};

const getBookingsForMonth = (bookings: BackendBooking[], year: number, month: number): number => {
    return bookings.filter((booking) => {
        const bookingDate = getBookingDate(booking);
        return Boolean(bookingDate && bookingDate.getFullYear() === year && bookingDate.getMonth() === month);
    }).length;
};

const toDashboardBooking = (booking: BackendBooking): Booking => {
    const carNameParts = [booking.carMake, booking.carModel, booking.carYear?.toString()].filter(Boolean);
    const bookingDate = booking.createdAt || booking.pickupDate;

    return {
        bookingId: `BK${String(booking.bookingId).padStart(4, "0")}`,
        customerName: booking.userName || "Unknown Customer",
        carName: carNameParts.join(" "),
        date: bookingDate,
        amount: booking.totalPrice,
        status: booking.bookingStatus,
    };
};

const getLastSixMonthBuckets = (): Array<{ key: string; label: string; revenue: number }> => {
    const buckets: Array<{ key: string; label: string; revenue: number }> = [];
    const now = new Date();

    for (let offset = 5; offset >= 0; offset--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - offset, 1);
        const key = `${monthDate.getFullYear()}-${monthDate.getMonth()}`;
        const label = monthDate.toLocaleDateString("en-US", { month: "short" });

        buckets.push({ key, label, revenue: 0 });
    }

    return buckets;
};

const fetchAllBookings = async (): Promise<BackendBooking[]> => {
    if (!pendingBookingsRequest) {
        pendingBookingsRequest = api
            .get<BackendBooking[]>("/bookings/admin/all")
            .then((response) => response.data)
            .finally(() => {
                pendingBookingsRequest = null;
            });
    }

    return pendingBookingsRequest;
};

const fetchBookingStats = async (): Promise<BookingStats> => {
    const response = await api.get<BookingStats>("/bookings/admin/stats");
    return response.data;
};

const isAuthorizationFailure = (error: unknown): boolean => {
    const status = getHttpStatus(error);
    return status === 401 || status === 403;
};

/**
 * Admin Dashboard Service
 * Fetches dashboard data from backend, falls back to safe static data on failure.
 */
export const adminDashboardService = {
    /**
     * Get dashboard statistics using real cars and bookings data.
     */
    getStats: async (): Promise<DashboardStats> => {
        try {
            const [cars, bookings, bookingStats] = await Promise.all([
                adminCarService.getAll(),
                fetchAllBookings(),
                fetchBookingStats(),
            ]);

            const totalCars = cars.length;
            const availableCars = cars.filter((car) => car.carStatus === "AVAILABLE").length;
            const rentedCars = cars.filter((car) => car.carStatus === "RENTED").length;
            const maintenanceCars = cars.filter((car) => car.carStatus === "MAINTENANCE").length;

            const now = new Date();
            const previousMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);

            const monthlyRevenue = getRevenueForMonth(bookings, now.getFullYear(), now.getMonth());
            const previousMonthlyRevenue = getRevenueForMonth(
                bookings,
                previousMonthDate.getFullYear(),
                previousMonthDate.getMonth()
            );

            const totalRevenue = bookings.reduce((sum, booking) => {
                return isRevenueBooking(booking) ? sum + booking.totalPrice : sum;
            }, 0);

            const currentMonthBookings = getBookingsForMonth(bookings, now.getFullYear(), now.getMonth());
            const previousMonthBookings = getBookingsForMonth(
                bookings,
                previousMonthDate.getFullYear(),
                previousMonthDate.getMonth()
            );

            return {
                totalCars,
                availableCars,
                rentedCars,
                maintenanceCars,
                activeBookings:
                    bookingStats.pendingCount
                    + bookingStats.adminNotifiedCount
                    + bookingStats.confirmedCount
                    + bookingStats.activeCount,
                totalRevenue,
                monthlyRevenue,
                revenueChange: calculatePercentageChange(monthlyRevenue, previousMonthlyRevenue),
                carsChange: 0,
                bookingsChange: calculatePercentageChange(currentMonthBookings, previousMonthBookings),
            };
        } catch (error) {
            console.error("Failed to fetch dashboard stats:", error);
            if (isAuthorizationFailure(error)) {
                throw error;
            }
            return getMockStats();
        }
    },

    /**
     * Get recent bookings from admin bookings endpoint.
     */
    getRecentBookings: async (limit: number = 5): Promise<Booking[]> => {
        try {
            const bookings = await fetchAllBookings();

            return [...bookings]
                .sort((a, b) => {
                    const aTime = getBookingDate(a)?.getTime() ?? 0;
                    const bTime = getBookingDate(b)?.getTime() ?? 0;
                    return bTime - aTime;
                })
                .slice(0, limit)
                .map(toDashboardBooking);
        } catch (error) {
            console.error("Failed to fetch recent bookings:", error);
            if (isAuthorizationFailure(error)) {
                throw error;
            }
            return getMockRecentBookings(limit);
        }
    },

    /**
     * Get revenue trend data for the last 6 months.
     */
    getRevenueTrend: async (): Promise<RevenueDataPoint[]> => {
        try {
            const bookings = await fetchAllBookings();
            const buckets = getLastSixMonthBuckets();
            const indexByKey = new Map<string, number>();

            buckets.forEach((bucket, index) => {
                indexByKey.set(bucket.key, index);
            });

            bookings.forEach((booking) => {
                if (!isRevenueBooking(booking)) {
                    return;
                }

                const bookingDate = getBookingDate(booking);
                if (!bookingDate) {
                    return;
                }

                const key = `${bookingDate.getFullYear()}-${bookingDate.getMonth()}`;
                const bucketIndex = indexByKey.get(key);

                if (bucketIndex === undefined) {
                    return;
                }

                buckets[bucketIndex].revenue += booking.totalPrice;
            });

            return buckets.map((bucket) => ({
                month: bucket.label,
                revenue: bucket.revenue,
            }));
        } catch (error) {
            console.error("Failed to fetch revenue trend:", error);
            if (isAuthorizationFailure(error)) {
                throw error;
            }
            return getMockRevenueTrend();
        }
    },

    /**
     * Get car availability breakdown.
     */
    getCarAvailability: async (): Promise<CarAvailability> => {
        try {
            const cars = await adminCarService.getAll();

            return {
                available: cars.filter((car) => car.carStatus === "AVAILABLE").length,
                rented: cars.filter((car) => car.carStatus === "RENTED").length,
                maintenance: cars.filter((car) => car.carStatus === "MAINTENANCE").length,
                total: cars.length,
            };
        } catch (error) {
            console.error("Failed to fetch car availability:", error);
            if (isAuthorizationFailure(error)) {
                throw error;
            }
            return {
                available: 24,
                rented: 18,
                maintenance: 3,
                total: 45,
            };
        }
    },
};

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
        carsChange: 0,
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

    for (let index = 0; index < limit; index++) {
        const date = new Date(now);
        date.setDate(date.getDate() - index);

        bookings.push({
            bookingId: `BK${String(index + 1).padStart(3, "0")}`,
            customerName: names[index % names.length],
            carName: cars[index % cars.length],
            date: date.toISOString(),
            amount: amounts[index % amounts.length],
            status: index < 2 ? "ACTIVE" : "COMPLETED",
        });
    }

    return bookings;
}

function getMockRevenueTrend(): RevenueDataPoint[] {
    const months = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const baseRevenue = 1800000;

    return months.map((month, index) => ({
        month,
        revenue: baseRevenue + index * 100000,
    }));
}
