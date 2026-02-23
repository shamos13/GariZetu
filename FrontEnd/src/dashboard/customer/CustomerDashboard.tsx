import { useCallback, useEffect, useMemo, useState } from "react";
import { CustomerLayout } from "./components/CustomerLayout.tsx";
import { carService } from "../../services/carService.ts";
import type { Car } from "../../data/cars.ts";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/AuthService.ts";
import { ArrowRight, Calendar, Car as CarIcon, CheckCircle2, Clock3, CreditCard, Edit, FileText, Mail, MapPin, Phone, Star, User } from "lucide-react";
import { Button } from "../../components/ui/button.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card.tsx";
import { bookingService, type Booking, type BookingStatus } from "../../services/BookingService.ts";
import { getImageUrl } from "../../lib/ImageUtils.ts";

interface CustomerDashboardProps {
    onBack: () => void;
    initialPage?: string;
}

const ACTIVE_BOOKING_STATUSES: BookingStatus[] = ["PENDING", "CONFIRMED", "ACTIVE"];

export default function CustomerDashboard({ onBack, initialPage = "dashboard" }: CustomerDashboardProps) {
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [cars, setCars] = useState<Car[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoadingCars, setIsLoadingCars] = useState(true);
    const [isLoadingBookings, setIsLoadingBookings] = useState(true);
    const [bookingsError, setBookingsError] = useState<string | null>(null);
    const navigate = useNavigate();
    const user = authService.getUser();
    const isAuthenticated = authService.isAuthenticated();

    const fetchCars = useCallback(async () => {
        try {
            setIsLoadingCars(true);
            const fetchedCars = await carService.getAll();
            setCars(fetchedCars.slice(0, 6)); // Show only 6 cars in dashboard
        } catch (error) {
            console.error("Failed to fetch cars:", error);
        } finally {
            setIsLoadingCars(false);
        }
    }, []);

    const fetchBookings = useCallback(async () => {
        if (!isAuthenticated) {
            setBookings([]);
            setBookingsError(null);
            setIsLoadingBookings(false);
            return;
        }

        try {
            setIsLoadingBookings(true);
            setBookingsError(null);
            const fetchedBookings = await bookingService.getMyBookings();
            setBookings(fetchedBookings);
        } catch (error) {
            console.error("Failed to fetch customer bookings:", error);
            setBookingsError("Unable to load bookings right now.");
        } finally {
            setIsLoadingBookings(false);
        }
    }, [isAuthenticated]);

    // Load cars and bookings on mount
    useEffect(() => {
        void fetchCars();
        void fetchBookings();
    }, [fetchCars, fetchBookings]);

    useEffect(() => {
        setCurrentPage(initialPage);
    }, [initialPage]);

    const getPageTitle = () => {
        switch (currentPage) {
            case "dashboard":
                return "Dashboard";
            case "profile":
                return "My Profile";
            case "bookings":
                return "My Bookings";
            default:
                return "Dashboard";
        }
    };

    const activeBookingsCount = bookings.filter((booking) => ACTIVE_BOOKING_STATUSES.includes(booking.bookingStatus)).length;
    const totalRentalsCount = bookings.length;
    const completedTripsCount = bookings.filter((booking) => booking.bookingStatus === "COMPLETED").length;

    const sortedBookings = useMemo(() => {
        return [...bookings].sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return dateB - dateA;
        });
    }, [bookings]);

    const featuredBooking = useMemo(() => {
        const active = sortedBookings.find((booking) => ACTIVE_BOOKING_STATUSES.includes(booking.bookingStatus));
        return active || sortedBookings[0] || null;
    }, [sortedBookings]);

    const featuredCar = useMemo(() => {
        if (!featuredBooking) {
            return cars[0] || null;
        }
        return cars.find((car) => car.id === featuredBooking.carId) || cars[0] || null;
    }, [cars, featuredBooking]);

    const recommendedCars = useMemo(
        () => cars.filter((car) => car.status === "available").slice(0, 3),
        [cars]
    );

    const rewardPoints = useMemo(() => {
        return completedTripsCount * 150 + activeBookingsCount * 75 + totalRentalsCount * 20;
    }, [completedTripsCount, activeBookingsCount, totalRentalsCount]);

    const formatBookingDate = (value: string): string => {
        let date: Date;
        if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            const [year, month, day] = value.split("-").map(Number);
            date = new Date(year, month - 1, day);
        } else {
            date = new Date(value);
        }

        if (Number.isNaN(date.getTime())) {
            return value;
        }

        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const getBookingBadgeClass = (status: BookingStatus): string => {
        switch (status) {
            case "PENDING":
                return "bg-amber-500/20 text-amber-400 border border-amber-500/30";
            case "CONFIRMED":
                return "bg-blue-500/20 text-blue-400 border border-blue-500/30";
            case "ACTIVE":
                return "bg-violet-500/20 text-violet-400 border border-violet-500/30";
            case "COMPLETED":
                return "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
            case "CANCELLED":
            default:
                return "bg-red-500/20 text-red-400 border border-red-500/30";
        }
    };

    const renderDashboard = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-3xl border border-gray-200 bg-white p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <p className="text-sm text-gray-500">Upcoming Rentals</p>
                    </div>
                    <p className="text-4xl font-semibold text-[#111827]">{activeBookingsCount.toString().padStart(2, "0")}</p>
                </div>

                <div className="rounded-3xl border border-gray-200 bg-white p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-11 h-11 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center">
                            <Clock3 className="w-5 h-5" />
                        </div>
                        <p className="text-sm text-gray-500">Past Trips</p>
                    </div>
                    <p className="text-4xl font-semibold text-[#111827]">{completedTripsCount}</p>
                </div>

                <div className="rounded-3xl border border-black bg-[#0c0c0f] p-5 text-white">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-11 h-11 rounded-2xl bg-white/10 text-amber-300 flex items-center justify-center">
                            <Star className="w-5 h-5" />
                        </div>
                        <button className="px-3 py-1.5 text-xs rounded-full bg-white text-black font-semibold">Redeem</button>
                    </div>
                    <p className="text-sm text-gray-400">Reward Points</p>
                    <p className="text-4xl font-semibold">{rewardPoints.toLocaleString()}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                <div className="xl:col-span-8 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <h3 className="text-2xl md:text-3xl font-semibold text-[#111827]">Active Booking</h3>
                        <button
                            onClick={() => setCurrentPage("bookings")}
                            className="text-sm text-gray-500 hover:text-gray-700 inline-flex items-center gap-1"
                        >
                            View Details <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="rounded-3xl border border-gray-200 bg-white p-3 md:p-4">
                        {isLoadingBookings || isLoadingCars ? (
                            <div className="h-[280px] rounded-2xl bg-gray-100 animate-pulse" />
                        ) : featuredBooking ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="relative rounded-2xl overflow-hidden bg-black min-h-[260px]">
                                    <img
                                        src={getImageUrl(featuredCar?.mainImageUrl || "/porsche-cayenne-black.jpg")}
                                        alt={featuredCar?.name || "Booked Vehicle"}
                                        className="w-full h-full object-cover"
                                    />
                                    <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-semibold">
                                        {featuredBooking.bookingStatus === "ACTIVE" ? "On Trip" : "Ready for Pickup"}
                                    </span>
                                </div>

                                <div className="p-1 space-y-4">
                                    <div>
                                        <h4 className="text-2xl md:text-3xl font-semibold text-[#111827]">
                                            {featuredBooking.carMake} {featuredBooking.carModel}
                                        </h4>
                                        <p className="text-gray-500">{featuredBooking.carYear} • Premium Package</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="rounded-2xl bg-gray-100 p-3">
                                            <p className="text-xs text-gray-500 uppercase tracking-wide">Pick-up</p>
                                            <p className="text-[#111827] font-semibold mt-1">{formatBookingDate(featuredBooking.pickupDate)}</p>
                                            <p className="text-xs text-gray-500 mt-1">{featuredBooking.pickupLocation}</p>
                                        </div>
                                        <div className="rounded-2xl bg-gray-100 p-3">
                                            <p className="text-xs text-gray-500 uppercase tracking-wide">Drop-off</p>
                                            <p className="text-[#111827] font-semibold mt-1">{formatBookingDate(featuredBooking.returnDate)}</p>
                                            <p className="text-xs text-gray-500 mt-1">{featuredBooking.returnLocation}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            onClick={() => navigate("/dashboard/bookings")}
                                            className="bg-black hover:bg-black/90 text-white rounded-xl"
                                        >
                                            Get Directions
                                        </Button>
                                        <Button
                                            onClick={() => setCurrentPage("bookings")}
                                            variant="outline"
                                            className="border-gray-300 text-gray-700 hover:bg-gray-100 rounded-xl"
                                        >
                                            Modify
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-14">
                                <CarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 mb-4">No active bookings yet.</p>
                                <Button onClick={() => navigate("/vehicles")} className="bg-black hover:bg-black/90 text-white">
                                    Browse Vehicles
                                </Button>
                            </div>
                        )}
                    </div>

                    <div>
                        <h3 className="text-2xl md:text-3xl font-semibold text-[#111827] mb-4">Recommended for You</h3>
                        {isLoadingCars ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-[280px] rounded-3xl bg-gray-100 animate-pulse" />
                                ))}
                            </div>
                        ) : recommendedCars.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {recommendedCars.map((car) => (
                                    <div key={car.id} className="rounded-3xl border border-gray-200 bg-white overflow-hidden">
                                        <div className="h-40 overflow-hidden">
                                            <img src={getImageUrl(car.mainImageUrl)} alt={car.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="p-4">
                                            <h4 className="text-[#111827] text-xl font-semibold">{car.make} {car.model}</h4>
                                            <p className="text-xs text-gray-500 mt-1">{car.transmission} • {car.seatingCapacity} seats • {car.bodyType}</p>
                                            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                                                <p className="text-2xl font-semibold text-[#111827] leading-none">
                                                    KES {car.dailyPrice.toLocaleString()}
                                                    <span className="ml-1 text-sm text-gray-500 font-normal">/day</span>
                                                </p>
                                                <button
                                                    onClick={() => navigate(`/booking?carId=${car.id}`)}
                                                    className="inline-flex items-center justify-center rounded-xl bg-[#111827] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-black sm:shrink-0"
                                                >
                                                    Book Now
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-3xl border border-gray-200 bg-white p-8 text-center">
                                <p className="text-gray-500">No recommendations available right now.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="xl:col-span-4">
                    <div className="rounded-3xl border border-gray-200 bg-white p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-2xl md:text-3xl font-semibold text-[#111827]">Recent Activity</h3>
                        </div>
                        <div className="space-y-5">
                            <div className="flex gap-3">
                                <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mt-1">
                                    <CheckCircle2 className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="font-medium text-[#111827]">Booking Confirmed</p>
                                    <p className="text-sm text-gray-500">
                                        {featuredBooking ? `${featuredBooking.carMake} ${featuredBooking.carModel} was confirmed.` : "Your latest booking was confirmed."}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mt-1">
                                    <FileText className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="font-medium text-[#111827]">Invoice Available</p>
                                    <p className="text-sm text-gray-500">Your latest trip invoice is ready for download.</p>
                                    <p className="text-xs text-blue-600 mt-1 cursor-pointer">Download PDF</p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mt-1">
                                    <Star className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="font-medium text-[#111827]">Points Earned</p>
                                    <p className="text-sm text-gray-500">You earned {Math.max(75, completedTripsCount * 50)} points from recent rentals.</p>
                                    <p className="text-xs text-gray-400 mt-1">Today</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderProfile = () => {
        if (!user) return null;

        // Get initials from user name (first and second name)
        const getInitials = (name: string): string => {
            const parts = name.trim().split(/\s+/);
            if (parts.length >= 2) {
                return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
            }
            return name.charAt(0).toUpperCase();
        };

        // Get member since date
        const getMemberSince = () => {
            const now = new Date();
            const month = now.toLocaleString('default', { month: 'long' });
            return `Member since ${month} ${now.getFullYear()}`;
        };

        return (
            <div className="space-y-6">
                {/* Header Card with Avatar and Edit Button */}
                <Card className="bg-[#1a1a1a] border-gray-800">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                                    <span className="text-3xl font-semibold text-white">
                                        {getInitials(user.userName || "User")}
                                    </span>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-1">{user.userName}</h2>
                                    <p className="text-gray-400 text-sm">{getMemberSince()}</p>
                                </div>
                            </div>
                            <Button
                                onClick={() => {
                                    // TODO: Implement edit profile functionality
                                    console.log("Edit profile clicked");
                                }}
                                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-6 py-2 rounded-lg flex items-center gap-2"
                            >
                                <Edit className="w-4 h-4" />
                                Edit Profile
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Profile Information Card */}
                <Card className="bg-[#1a1a1a] border-gray-800">
                    <CardHeader>
                        <CardTitle className="text-white text-xl">Profile Information</CardTitle>
                        <CardDescription className="text-gray-400">Your account details</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left Column */}
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <User className="w-5 h-5 text-emerald-400" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-400 mb-1">Full Name</p>
                                        <p className="text-white font-medium">{user.userName || "Not specified"}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <CreditCard className="w-5 h-5 text-emerald-400" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-400 mb-1">User ID</p>
                                        <p className="text-white font-medium">#{user.userId || "Not specified"}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Phone className="w-5 h-5 text-emerald-400" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-400 mb-1">Phone Number</p>
                                        <p className="text-white font-medium">Not specified</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <User className="w-5 h-5 text-emerald-400" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-400 mb-1">Bio</p>
                                        <p className="text-white font-medium">No bio yet.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Mail className="w-5 h-5 text-emerald-400" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-400 mb-1">Email</p>
                                        <p className="text-white font-medium">{user.email || "Not specified"}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <User className="w-5 h-5 text-emerald-400" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-400 mb-1">Role</p>
                                        <p className="text-white font-medium capitalize">{user.role?.toLowerCase() || "Not specified"}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <MapPin className="w-5 h-5 text-emerald-400" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-400 mb-1">Location</p>
                                        <p className="text-white font-medium">Kenya</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    };

    const renderBookings = () => (
        <div className="space-y-6">
            <Card className="bg-[#1a1a1a] border-gray-800">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-emerald-400" />
                        My Bookings
                    </CardTitle>
                    <CardDescription>Your rental history and upcoming reservations</CardDescription>
                </CardHeader>
                <CardContent>
                    {!isAuthenticated ? (
                        <div className="text-center py-10">
                            <p className="text-gray-400 mb-4">Log in to view your booking history.</p>
                            <Button onClick={() => navigate("/")} className="bg-emerald-500 hover:bg-emerald-600 text-white">
                                Go to Home
                            </Button>
                        </div>
                    ) : isLoadingBookings ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map((item) => (
                                <div key={item} className="h-24 rounded-xl bg-gray-800/60 animate-pulse" />
                            ))}
                        </div>
                    ) : bookingsError ? (
                        <div className="text-center py-10">
                            <p className="text-red-400 mb-4">{bookingsError}</p>
                            <Button
                                onClick={() => void fetchBookings()}
                                variant="outline"
                                className="border-gray-700 text-gray-300 hover:bg-gray-800"
                            >
                                Try Again
                            </Button>
                        </div>
                    ) : sortedBookings.length === 0 ? (
                        <div className="text-center py-12">
                            <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-400 mb-4">You don&apos;t have any bookings yet.</p>
                            <Button
                                onClick={() => navigate("/vehicles")}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white"
                            >
                                Browse Vehicles
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {sortedBookings.map((booking) => (
                                <div key={booking.bookingId} className="rounded-xl border border-gray-800 bg-[#141414] p-4">
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                        <div>
                                            <p className="text-sm text-gray-500">Booking #{booking.bookingId}</p>
                                            <p className="text-white font-semibold">
                                                {booking.carMake} {booking.carModel} {booking.carYear}
                                            </p>
                                            <p className="text-sm text-gray-400">
                                                {formatBookingDate(booking.pickupDate)} to {formatBookingDate(booking.returnDate)}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Pick-up: {booking.pickupLocation}
                                            </p>
                                        </div>

                                        <div className="text-left md:text-right space-y-2">
                                            <p className="text-emerald-400 font-semibold">
                                                KES {booking.totalPrice.toLocaleString()}
                                            </p>
                                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getBookingBadgeClass(booking.bookingStatus)}`}>
                                                {booking.bookingStatus}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );

    const renderPage = () => {
        switch (currentPage) {
            case "profile":
                return renderProfile();
            case "bookings":
                return renderBookings();
            default:
                return renderDashboard();
        }
    };

    return (
        <CustomerLayout
            title={getPageTitle()}
            currentPage={currentPage}
            onNavigate={setCurrentPage}
            onBack={onBack}
        >
            {renderPage()}
        </CustomerLayout>
    );
}
