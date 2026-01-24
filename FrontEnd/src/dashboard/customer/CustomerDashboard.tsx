import { useEffect, useState } from 'react';
import { CustomerLayout } from "./components/CustomerLayout.tsx";
import { carService } from "../../services/carService.ts";
import type { Car } from "../../data/cars.ts";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/AuthService.ts";
import { Calendar, Car as CarIcon, TrendingUp, User, Mail, Phone, CreditCard, MapPin, Edit } from "lucide-react";
import { Button } from "../../components/ui/button.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card.tsx";

interface CustomerDashboardProps {
    onBack: () => void;
}

export default function CustomerDashboard({ onBack }: CustomerDashboardProps) {
    const [currentPage, setCurrentPage] = useState("dashboard");
    const [cars, setCars] = useState<Car[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const user = authService.getUser();

    // Load cars on mount
    useEffect(() => {
        const fetchCars = async () => {
            try {
                setIsLoading(true);
                const fetchedCars = await carService.getAll();
                setCars(fetchedCars.slice(0, 6)); // Show only 6 cars in dashboard
            } catch (error) {
                console.error("Failed to fetch cars:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCars();
    }, []);

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

    const availableCarsCount = cars.filter(car => car.status === "available").length;
    const totalCarsCount = cars.length;

    const renderDashboard = () => (
        <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-white mb-2">
                    Welcome back, {user?.userName || "Customer"}! 👋
                </h2>
                <p className="text-gray-400">
                    Manage your bookings, explore available vehicles, and track your rental history.
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-[#1a1a1a] border-gray-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Available Vehicles</CardTitle>
                        <CarIcon className="h-4 w-4 text-emerald-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{availableCarsCount}</div>
                        <p className="text-xs text-gray-500 mt-1">Ready to rent</p>
                    </CardContent>
                </Card>

                <Card className="bg-[#1a1a1a] border-gray-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">My Bookings</CardTitle>
                        <Calendar className="h-4 w-4 text-emerald-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">0</div>
                        <p className="text-xs text-gray-500 mt-1">Active reservations</p>
                    </CardContent>
                </Card>

                <Card className="bg-[#1a1a1a] border-gray-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Total Rentals</CardTitle>
                        <TrendingUp className="h-4 w-4 text-emerald-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">0</div>
                        <p className="text-xs text-gray-500 mt-1">All time</p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                    onClick={() => navigate("/vehicles")}
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white h-auto py-4"
                >
                    <CarIcon className="w-5 h-5 mr-2" />
                    Browse All Vehicles
                </Button>
                <Button
                    onClick={() => navigate("/booking")}
                    variant="outline"
                    className="border-gray-700 text-gray-300 hover:bg-gray-800 h-auto py-4"
                >
                    <Calendar className="w-5 h-5 mr-2" />
                    Make a Booking
                </Button>
            </div>

            {/* Available Vehicles Section */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-white">Available Vehicles</h3>
                    <Button
                        variant="ghost"
                        onClick={() => navigate("/vehicles")}
                        className="text-emerald-400 hover:text-emerald-300"
                    >
                        View All →
                    </Button>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <Card key={i} className="bg-[#1a1a1a] border-gray-800 animate-pulse">
                                <div className="h-48 bg-gray-700 rounded-t-lg" />
                                <CardHeader>
                                    <div className="h-4 bg-gray-700 rounded w-3/4" />
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                ) : cars.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {cars.filter(car => car.status === "available").slice(0, 6).map((car) => (
                            <Card
                                key={car.id}
                                className="bg-[#1a1a1a] border-gray-800 hover:border-emerald-500/50 transition-all cursor-pointer group"
                                onClick={() => navigate(`/vehicles/${car.id}`)}
                            >
                                <div className="relative h-48 overflow-hidden rounded-t-lg">
                                    <img
                                        src={car.mainImageUrl}
                                        alt={car.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                    <div className="absolute top-2 right-2 bg-emerald-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                                        Available
                                    </div>
                                </div>
                                <CardHeader>
                                    <CardTitle className="text-white group-hover:text-emerald-400 transition-colors">
                                        {car.name}
                                    </CardTitle>
                                    <CardDescription className="text-gray-400">
                                        {car.bodyType} • {car.transmission} • {car.fuelType}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-2xl font-bold text-white">
                                                KES {car.dailyPrice.toLocaleString()}
                                            </p>
                                            <p className="text-xs text-gray-500">per day</p>
                                        </div>
                                        <Button
                                            size="sm"
                                            className="bg-emerald-500 hover:bg-emerald-600 text-white"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/vehicles/${car.id}`);
                                            }}
                                        >
                                            View Details
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="bg-[#1a1a1a] border-gray-800 p-8 text-center">
                        <CarIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400">No vehicles available at the moment.</p>
                        <Button
                            onClick={() => navigate("/vehicles")}
                            variant="outline"
                            className="mt-4 border-gray-700"
                        >
                            Browse All Vehicles
                        </Button>
                    </Card>
                )}
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
                    <div className="text-center py-12">
                        <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400 mb-4">You don't have any bookings yet.</p>
                        <Button
                            onClick={() => navigate("/vehicles")}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white"
                        >
                            Browse Vehicles
                        </Button>
                    </div>
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
