import { useCallback, useEffect, useMemo, useState } from "react";
import { CustomerLayout } from "./components/CustomerLayout.tsx";
import { carService } from "../../services/carService.ts";
import type { Car } from "../../data/cars.ts";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/AuthService.ts";
import {
    ArrowRight,
    Calendar,
    Car as CarIcon,
    CheckCircle2,
    Clock3,
    CreditCard,
    Download,
    Edit,
    FileText,
    Gift,
    Mail,
    MapPin,
    Phone,
    Plus,
    SlidersHorizontal,
    Star,
    User,
} from "lucide-react";
import { Button } from "../../components/ui/button.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card.tsx";
import { bookingService, type Booking, type BookingStatus } from "../../services/BookingService.ts";
import { getImageUrl } from "../../lib/ImageUtils.ts";
import { getErrorMessage, getHttpStatus, isUnauthorizedError } from "../../lib/errorUtils.ts";
import { emitAuthChanged } from "../../lib/authEvents.ts";
import { toast } from "sonner";
import { pushUserNotification } from "../../lib/userNotifications.ts";
import {
    getAvailabilityClassName,
    getAvailabilityLabel,
    getCarAvailabilityStatus,
    isCarBookable,
} from "../../lib/carAvailability.ts";

interface CustomerDashboardProps {
    onBack: () => void;
    initialPage?: string;
}

interface CustomerProfileDetails {
    userName: string;
    email: string;
    phoneNumber: string;
    location: string;
    bio: string;
}

const ACTIVE_BOOKING_STATUSES: BookingStatus[] = [
    "PENDING_PAYMENT",
    "PENDING",
    "ADMIN_NOTIFIED",
    "CONFIRMED",
    "ACTIVE",
];
const PAYMENT_ALLOWED_STATUSES: BookingStatus[] = ["PENDING_PAYMENT", "PENDING"];
const CANCELLABLE_STATUSES: BookingStatus[] = ["PENDING_PAYMENT", "PENDING", "ADMIN_NOTIFIED", "CONFIRMED"];
const PROFILE_STORAGE_KEY_PREFIX = "garizetu_customer_profile_v1";

export default function CustomerDashboard({ onBack, initialPage = "dashboard" }: CustomerDashboardProps) {
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [cars, setCars] = useState<Car[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoadingCars, setIsLoadingCars] = useState(true);
    const [isLoadingBookings, setIsLoadingBookings] = useState(true);
    const [bookingsError, setBookingsError] = useState<string | null>(null);
    const [bookingActionMessage, setBookingActionMessage] = useState<string | null>(null);
    const [processingBookingId, setProcessingBookingId] = useState<number | null>(null);
    const [profileDetails, setProfileDetails] = useState<CustomerProfileDetails>({
        userName: "",
        email: "",
        phoneNumber: "",
        location: "Kenya",
        bio: "",
    });
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [profileFormError, setProfileFormError] = useState<string | null>(null);
    const navigate = useNavigate();
    const user = authService.getUser();
    const isAuthenticated = authService.isAuthenticated();

    const getProfileStorageKey = useCallback((): string => {
        if (!user?.userId) {
            return `${PROFILE_STORAGE_KEY_PREFIX}:guest`;
        }
        return `${PROFILE_STORAGE_KEY_PREFIX}:${user.userId}`;
    }, [user?.userId]);

    const loadProfileDetails = useCallback(() => {
        const baseDetails: CustomerProfileDetails = {
            userName: user?.userName || "",
            email: user?.email || "",
            phoneNumber: "",
            location: "Kenya",
            bio: "",
        };

        const storageKey = getProfileStorageKey();
        const rawStoredProfile = localStorage.getItem(storageKey);

        if (!rawStoredProfile) {
            setProfileDetails(baseDetails);
            return;
        }

        try {
            const stored = JSON.parse(rawStoredProfile) as Partial<CustomerProfileDetails>;
            setProfileDetails({
                userName: typeof stored.userName === "string" && stored.userName.trim() ? stored.userName : baseDetails.userName,
                email: typeof stored.email === "string" && stored.email.trim() ? stored.email : baseDetails.email,
                phoneNumber: typeof stored.phoneNumber === "string" ? stored.phoneNumber : baseDetails.phoneNumber,
                location: typeof stored.location === "string" && stored.location.trim() ? stored.location : baseDetails.location,
                bio: typeof stored.bio === "string" ? stored.bio : baseDetails.bio,
            });
        } catch {
            setProfileDetails(baseDetails);
        }
    }, [getProfileStorageKey, user?.email, user?.userName]);

    const fetchCars = useCallback(async () => {
        try {
            setIsLoadingCars(true);
            const fetchedCars = await carService.getAll();
            setCars(fetchedCars.slice(0, 6)); // Show only 6 cars in dashboard
        } catch (error) {
            console.error("Failed to fetch cars:", error);
            setBookingActionMessage((previous) =>
                previous ?? getErrorMessage(error, "Unable to load recommended vehicles right now.")
            );
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
            const resolvedMessage = getErrorMessage(error, "Unable to load bookings right now.");
            if (isUnauthorizedError(error) && authService.isAuthenticated()) {
                setBookingsError("Unable to load your bookings right now. Please refresh and try again.");
                return;
            }
            setBookingsError(resolvedMessage);
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

    useEffect(() => {
        loadProfileDetails();
    }, [loadProfileDetails]);

    useEffect(() => {
        const bookingNotice = sessionStorage.getItem("garizetu_booking_notice");
        if (!bookingNotice) {
            return;
        }
        setBookingActionMessage(bookingNotice);
        sessionStorage.removeItem("garizetu_booking_notice");
    }, []);

    const getPageTitle = () => {
        switch (currentPage) {
            case "dashboard":
                return "Dashboard";
            case "profile":
                return "My Profile";
            case "bookings":
                return "My Bookings";
            case "payments":
                return "Payments";
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
        () => cars.filter((car) => isCarBookable(car)).slice(0, 3),
        [cars]
    );

    const rewardPoints = useMemo(() => {
        return completedTripsCount * 150 + activeBookingsCount * 75 + totalRentalsCount * 20;
    }, [completedTripsCount, activeBookingsCount, totalRentalsCount]);

    const rewardsTarget = 10000;

    const paidBookings = useMemo(() => {
        return sortedBookings.filter((booking) => {
            return (
                booking.paymentStatus === "PAID" ||
                booking.paymentStatus === "SIMULATED_PAID" ||
                booking.bookingStatus === "COMPLETED"
            );
        });
    }, [sortedBookings]);

    const annualExpenditureTotal = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const currentYearPaid = paidBookings
            .filter((booking) => new Date(booking.createdAt).getFullYear() === currentYear)
            .reduce((total, booking) => total + booking.totalPrice, 0);

        if (currentYearPaid > 0) {
            return currentYearPaid;
        }

        return paidBookings.reduce((total, booking) => total + booking.totalPrice, 0);
    }, [paidBookings]);

    const pendingPaymentBookings = useMemo(() => {
        return sortedBookings.filter((booking) => PAYMENT_ALLOWED_STATUSES.includes(booking.bookingStatus));
    }, [sortedBookings]);

    const pendingDuesTotal = useMemo(() => {
        return pendingPaymentBookings.reduce((total, booking) => total + booking.totalPrice, 0);
    }, [pendingPaymentBookings]);

    const paymentMethods = useMemo(() => {
        const cardHolder = (user?.userName || "GariZetu Customer").toUpperCase();
        return [
            {
                id: "visa",
                provider: "Visa",
                last4: "8842",
                expires: "12/27",
                holder: cardHolder,
            },
            {
                id: "mastercard",
                provider: "Mastercard",
                last4: "1095",
                expires: "08/25",
                holder: cardHolder,
            },
        ];
    }, [user?.userName]);

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
            case "PENDING_PAYMENT":
            case "PENDING":
                return "bg-amber-500/20 text-amber-400 border border-amber-500/30";
            case "ADMIN_NOTIFIED":
                return "bg-orange-500/20 text-orange-400 border border-orange-500/30";
            case "CONFIRMED":
                return "bg-blue-500/20 text-blue-400 border border-blue-500/30";
            case "ACTIVE":
                return "bg-violet-500/20 text-violet-400 border border-violet-500/30";
            case "COMPLETED":
                return "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
            case "EXPIRED":
                return "bg-slate-500/20 text-slate-300 border border-slate-500/30";
            case "REJECTED":
                return "bg-rose-500/20 text-rose-400 border border-rose-500/30";
            case "CANCELLED":
            default:
                return "bg-red-500/20 text-red-400 border border-red-500/30";
        }
    };

    const getStatusLabel = (status: BookingStatus): string => {
        if (status === "PENDING_PAYMENT" || status === "PENDING") {
            return "Pending Payment";
        }
        return status.replaceAll("_", " ");
    };

    const formatCurrency = (amount: number): string => {
        return `Ksh ${amount.toLocaleString()}`;
    };

    const getTransactionStatusMeta = (booking: Booking): { label: string; className: string } => {
        if (booking.paymentStatus === "FAILED") {
            return {
                label: "Failed",
                className: "border border-red-500/30 bg-red-500/15 text-red-400",
            };
        }

        if (booking.paymentStatus === "REFUNDED") {
            return {
                label: "Refunded",
                className: "border border-gray-500/30 bg-gray-500/15 text-gray-300",
            };
        }

        if (booking.paymentStatus === "PAID" || booking.paymentStatus === "SIMULATED_PAID" || booking.bookingStatus === "COMPLETED") {
            return {
                label: "Completed",
                className: "border border-emerald-500/30 bg-emerald-500/15 text-emerald-400",
            };
        }

        if (booking.bookingStatus === "CANCELLED" || booking.bookingStatus === "REJECTED" || booking.bookingStatus === "EXPIRED") {
            return {
                label: "Closed",
                className: "border border-gray-500/30 bg-gray-500/15 text-gray-300",
            };
        }

        return {
            label: "Pending",
            className: "border border-amber-500/30 bg-amber-500/15 text-amber-300",
        };
    };

    const getTransactionId = (booking: Booking): string => {
        if (booking.paymentReference) {
            return booking.paymentReference;
        }
        return `GZ-${booking.bookingId.toString().padStart(6, "0")}`;
    };

    const canSimulatePayment = (status: BookingStatus): boolean => PAYMENT_ALLOWED_STATUSES.includes(status);

    const canCancelBooking = (status: BookingStatus): boolean => CANCELLABLE_STATUSES.includes(status);

    const getFeaturedBookingCaption = (status: BookingStatus): string => {
        switch (status) {
            case "PENDING_PAYMENT":
            case "PENDING":
                return "Awaiting Payment";
            case "ADMIN_NOTIFIED":
                return "Awaiting Admin Review";
            case "ACTIVE":
                return "On Trip";
            case "CONFIRMED":
                return "Ready for Pickup";
            case "EXPIRED":
                return "Payment Window Expired";
            default:
                return status.replaceAll("_", " ");
        }
    };

    const handleSimulatePayment = async (bookingId: number) => {
        try {
            setProcessingBookingId(bookingId);
            setBookingActionMessage(null);
            await bookingService.simulatePayment(bookingId, { paymentMethod: "M_PESA" });
            await fetchBookings();
            const successMessage = "Payment completed and booking confirmed.";
            setBookingActionMessage(successMessage);
            toast.success(successMessage);
            pushUserNotification({
                title: "Booking confirmed",
                message: "Your payment was completed successfully. The booking is now confirmed.",
                level: "success",
                actionPath: "/dashboard/bookings",
                actionLabel: "View bookings",
            });
        } catch (error) {
            console.error("Failed to simulate payment:", error);
            const resolvedMessage = getErrorMessage(error, "Could not process payment. Please try again.");
            const status = getHttpStatus(error);

            if (isUnauthorizedError(error) && authService.isAuthenticated()) {
                const message =
                    "Payment could not be completed because your booking session could not be verified. Refresh your bookings and try again."
                setBookingActionMessage(message);
                toast.warning(message);
                return;
            }

            if (status === 500 && authService.isAuthenticated()) {
                const message =
                    "Payment could not be completed due to a temporary booking processing issue. Please refresh and retry."
                setBookingActionMessage(message);
                toast.error(message);
                return;
            }

            setBookingActionMessage(resolvedMessage);
            toast.error(resolvedMessage);
        } finally {
            setProcessingBookingId(null);
        }
    };

    const handleCancelBooking = async (bookingId: number) => {
        try {
            setProcessingBookingId(bookingId);
            setBookingActionMessage(null);
            await bookingService.cancel(bookingId, "Cancelled by customer");
            await fetchBookings();
            setBookingActionMessage("Booking cancelled successfully.");
        } catch (error) {
            console.error("Failed to cancel booking:", error);
            setBookingActionMessage(getErrorMessage(error, "Could not cancel booking. Please try again."));
        } finally {
            setProcessingBookingId(null);
        }
    };

    const handleProfileFieldChange = (field: keyof CustomerProfileDetails, value: string) => {
        setProfileFormError(null);
        setProfileDetails((previous) => ({
            ...previous,
            [field]: value,
        }));
    };

    const validateProfileDetails = (details: CustomerProfileDetails): string | null => {
        if (details.userName.trim().length < 2) {
            return "Full name must be at least 2 characters.";
        }

        const emailValue = details.email.trim();
        if (!emailValue) {
            return "Email is required.";
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
            return "Please enter a valid email address.";
        }

        const phoneValue = details.phoneNumber.trim();
        if (phoneValue && !/^\+?[0-9]{7,15}$/.test(phoneValue)) {
            return "Phone number should contain 7 to 15 digits and may start with +.";
        }

        return null;
    };

    const handleSaveProfile = () => {
        const sanitizedDetails: CustomerProfileDetails = {
            userName: profileDetails.userName.trim(),
            email: profileDetails.email.trim(),
            phoneNumber: profileDetails.phoneNumber.trim(),
            location: profileDetails.location.trim() || "Kenya",
            bio: profileDetails.bio.trim(),
        };

        const validationError = validateProfileDetails(sanitizedDetails);
        if (validationError) {
            setProfileFormError(validationError);
            return;
        }

        try {
            setIsSavingProfile(true);
            setProfileFormError(null);
            localStorage.setItem(getProfileStorageKey(), JSON.stringify(sanitizedDetails));

            const storedUser = authService.getUser();
            if (storedUser) {
                const updatedUser = {
                    ...storedUser,
                    userName: sanitizedDetails.userName,
                    email: sanitizedDetails.email,
                };
                localStorage.setItem("garizetu_user", JSON.stringify(updatedUser));
                emitAuthChanged();
            }

            setProfileDetails(sanitizedDetails);
            setIsEditingProfile(false);
            toast.success("Profile updated successfully.");
        } catch {
            setProfileFormError("Could not save profile right now. Please try again.");
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleCancelProfileEdit = () => {
        loadProfileDetails();
        setProfileFormError(null);
        setIsEditingProfile(false);
    };

    const renderDashboard = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-3xl border border-gray-800 bg-[#1a1a1a] p-5">
                    <div className="mb-3 flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/20 text-blue-400">
                            <Calendar className="h-5 w-5" />
                        </div>
                        <p className="text-sm text-gray-400">Upcoming Rentals</p>
                    </div>
                    <p className="text-4xl font-semibold text-white">{activeBookingsCount.toString().padStart(2, "0")}</p>
                </div>

                <div className="rounded-3xl border border-gray-800 bg-[#1a1a1a] p-5">
                    <div className="mb-3 flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/20 text-violet-400">
                            <Clock3 className="h-5 w-5" />
                        </div>
                        <p className="text-sm text-gray-400">Past Trips</p>
                    </div>
                    <p className="text-4xl font-semibold text-white">{completedTripsCount}</p>
                </div>

                <div className="rounded-3xl border border-gray-700 bg-[#0f0f12] p-5 text-white">
                    <div className="mb-3 flex items-center justify-between">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-amber-300">
                            <Star className="h-5 w-5" />
                        </div>
                        <button className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-black">Redeem</button>
                    </div>
                    <p className="text-sm text-gray-400">Reward Points</p>
                    <p className="text-4xl font-semibold">{rewardPoints.toLocaleString()}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
                <div className="space-y-4 xl:col-span-8">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <h3 className="text-2xl font-semibold text-white md:text-3xl">Active Booking</h3>
                        <button
                            onClick={() => setCurrentPage("bookings")}
                            className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-white"
                        >
                            View Details <ArrowRight className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="rounded-3xl border border-gray-800 bg-[#1a1a1a] p-3 md:p-4">
                        {isLoadingBookings || isLoadingCars ? (
                            <div className="h-[280px] animate-pulse rounded-2xl bg-gray-800/60" />
                        ) : featuredBooking ? (
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="relative min-h-[260px] overflow-hidden rounded-2xl bg-black">
                                    <img
                                        src={getImageUrl(featuredCar?.mainImageUrl || "/porsche-cayenne-black.jpg")}
                                        alt={featuredCar?.name || "Booked Vehicle"}
                                        className="h-full w-full object-cover"
                                    />
                                    <span className="absolute left-3 top-3 rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white">
                                        {getFeaturedBookingCaption(featuredBooking.bookingStatus)}
                                    </span>
                                </div>

                                <div className="space-y-4 p-1">
                                    <div>
                                        <h4 className="text-2xl font-semibold text-white md:text-3xl">
                                            {featuredBooking.carMake} {featuredBooking.carModel}
                                        </h4>
                                        <p className="text-gray-400">{featuredBooking.carYear} • Premium Package</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="rounded-2xl border border-gray-800 bg-[#111111] p-3">
                                            <p className="text-xs uppercase tracking-wide text-gray-500">Pick-up</p>
                                            <p className="mt-1 font-semibold text-white">{formatBookingDate(featuredBooking.pickupDate)}</p>
                                            <p className="mt-1 text-xs text-gray-500">{featuredBooking.pickupLocation}</p>
                                        </div>
                                        <div className="rounded-2xl border border-gray-800 bg-[#111111] p-3">
                                            <p className="text-xs uppercase tracking-wide text-gray-500">Drop-off</p>
                                            <p className="mt-1 font-semibold text-white">{formatBookingDate(featuredBooking.returnDate)}</p>
                                            <p className="mt-1 text-xs text-gray-500">{featuredBooking.returnLocation}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            onClick={() => navigate("/dashboard/bookings")}
                                            className="rounded-xl bg-white text-black hover:bg-gray-200"
                                        >
                                            Get Directions
                                        </Button>
                                        <Button
                                            onClick={() => setCurrentPage("bookings")}
                                            variant="outline"
                                            className="rounded-xl border-gray-700 bg-transparent text-gray-200 hover:bg-gray-800 hover:text-white"
                                        >
                                            Modify
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="py-14 text-center">
                                <CarIcon className="mx-auto mb-3 h-12 w-12 text-gray-500" />
                                <p className="mb-4 text-gray-400">No active bookings yet.</p>
                                <Button onClick={() => navigate("/vehicles")} className="bg-white text-black hover:bg-gray-200">
                                    Browse Vehicles
                                </Button>
                            </div>
                        )}
                    </div>

                    <div>
                        <h3 className="mb-4 text-2xl font-semibold text-white md:text-3xl">Recommended for You</h3>
                        {isLoadingCars ? (
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-[280px] animate-pulse rounded-3xl bg-gray-800/60" />
                                ))}
                            </div>
                        ) : recommendedCars.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                                {recommendedCars.map((car) => (
                                    <div key={car.id} className="overflow-hidden rounded-3xl border border-gray-800 bg-[#1a1a1a]">
                                        <div className="relative h-40 overflow-hidden">
                                            <img src={getImageUrl(car.mainImageUrl)} alt={car.name} className="h-full w-full object-cover" />
                                            <span className={`absolute left-3 top-3 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getAvailabilityClassName(getCarAvailabilityStatus(car))}`}>
                                                {getAvailabilityLabel(getCarAvailabilityStatus(car))}
                                            </span>
                                        </div>
                                        <div className="p-4">
                                            <h4 className="text-xl font-semibold text-white">{car.make} {car.model}</h4>
                                            <p className="mt-1 text-xs text-gray-400">{car.transmission} • {car.seatingCapacity} seats • {car.bodyType}</p>
                                            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                                                <p className="text-2xl font-semibold leading-none text-white">
                                                    KES {car.dailyPrice.toLocaleString()}
                                                    <span className="ml-1 text-sm font-normal text-gray-400">/day</span>
                                                </p>
                                                <button
                                                    onClick={() => navigate(`/booking?carId=${car.id}`)}
                                                    disabled={!isCarBookable(car)}
                                                    className={`inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium transition-colors sm:shrink-0 ${
                                                        isCarBookable(car)
                                                            ? "bg-white text-black hover:bg-gray-200"
                                                            : "cursor-not-allowed bg-gray-700 text-gray-400"
                                                    }`}
                                                >
                                                    {isCarBookable(car) ? "Book Now" : "Unavailable"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-3xl border border-gray-800 bg-[#1a1a1a] p-8 text-center">
                                <p className="text-gray-400">No recommendations available right now.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="xl:col-span-4">
                    <div className="rounded-3xl border border-gray-800 bg-[#1a1a1a] p-5">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-2xl font-semibold text-white md:text-3xl">Recent Activity</h3>
                        </div>
                        <div className="space-y-5">
                            <div className="flex gap-3">
                                <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                                    <CheckCircle2 className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="font-medium text-white">Booking Confirmed</p>
                                    <p className="text-sm text-gray-400">
                                        {featuredBooking ? `${featuredBooking.carMake} ${featuredBooking.carModel} was confirmed.` : "Your latest booking was confirmed."}
                                    </p>
                                    <p className="mt-1 text-xs text-gray-500">2 hours ago</p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/20 text-blue-400">
                                    <FileText className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="font-medium text-white">Invoice Available</p>
                                    <p className="text-sm text-gray-400">Your latest trip invoice is ready for download.</p>
                                    <p className="mt-1 cursor-pointer text-xs text-blue-400">Download PDF</p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-amber-500/20 text-amber-400">
                                    <Star className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="font-medium text-white">Points Earned</p>
                                    <p className="text-sm text-gray-400">You earned {Math.max(75, completedTripsCount * 50)} points from recent rentals.</p>
                                    <p className="mt-1 text-xs text-gray-500">Today</p>
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

        const getInitials = (name: string): string => {
            const parts = name.trim().split(/\s+/);
            if (parts.length >= 2) {
                return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
            }
            return name.charAt(0).toUpperCase();
        };

        const getMemberSince = () => {
            const now = new Date();
            const month = now.toLocaleString("default", { month: "long" });
            return `Member since ${month} ${now.getFullYear()}`;
        };

        return (
            <div className="space-y-6">
                <Card className="bg-[#1a1a1a] border-gray-800">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                                    <span className="text-3xl font-semibold text-white">
                                        {getInitials(profileDetails.userName || "User")}
                                    </span>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-1">{profileDetails.userName || "Customer"}</h2>
                                    <p className="text-gray-400 text-sm">{getMemberSince()}</p>
                                </div>
                            </div>

                            {!isEditingProfile ? (
                                <Button
                                    onClick={() => {
                                        setProfileFormError(null);
                                        setIsEditingProfile(true);
                                    }}
                                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-6 py-2 rounded-lg flex items-center gap-2"
                                >
                                    <Edit className="w-4 h-4" />
                                    Edit Profile
                                </Button>
                            ) : (
                                <div className="flex flex-wrap items-center gap-2">
                                    <Button
                                        onClick={handleSaveProfile}
                                        disabled={isSavingProfile}
                                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg"
                                    >
                                        {isSavingProfile ? "Saving..." : "Save Changes"}
                                    </Button>
                                    <Button
                                        onClick={handleCancelProfileEdit}
                                        disabled={isSavingProfile}
                                        variant="outline"
                                        className="border-gray-700 bg-transparent text-gray-200 hover:bg-gray-800 hover:text-white"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-[#1a1a1a] border-gray-800">
                    <CardHeader>
                        <CardTitle className="text-white text-xl">Profile Information</CardTitle>
                        <CardDescription className="text-gray-400">
                            {isEditingProfile ? "Update your editable account details." : "Your account details"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {profileFormError && (
                            <div className="mb-5 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                                {profileFormError}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <User className="w-5 h-5 text-emerald-400" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-400 mb-1">Full Name</p>
                                        {isEditingProfile ? (
                                            <input
                                                value={profileDetails.userName}
                                                onChange={(event) => handleProfileFieldChange("userName", event.target.value)}
                                                className="w-full rounded-lg border border-gray-700 bg-[#121212] px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
                                                placeholder="Enter full name"
                                            />
                                        ) : (
                                            <p className="text-white font-medium">{profileDetails.userName || "Not specified"}</p>
                                        )}
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
                                        {isEditingProfile ? (
                                            <input
                                                value={profileDetails.phoneNumber}
                                                onChange={(event) => handleProfileFieldChange("phoneNumber", event.target.value)}
                                                className="w-full rounded-lg border border-gray-700 bg-[#121212] px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
                                                placeholder="+254700000000"
                                            />
                                        ) : (
                                            <p className="text-white font-medium">{profileDetails.phoneNumber || "Not specified"}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <User className="w-5 h-5 text-emerald-400" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-400 mb-1">Bio</p>
                                        {isEditingProfile ? (
                                            <textarea
                                                value={profileDetails.bio}
                                                onChange={(event) => handleProfileFieldChange("bio", event.target.value)}
                                                className="min-h-24 w-full rounded-lg border border-gray-700 bg-[#121212] px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
                                                placeholder="Tell us something about yourself"
                                            />
                                        ) : (
                                            <p className="text-white font-medium">{profileDetails.bio || "No bio yet."}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Mail className="w-5 h-5 text-emerald-400" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-400 mb-1">Email</p>
                                        {isEditingProfile ? (
                                            <input
                                                type="email"
                                                value={profileDetails.email}
                                                onChange={(event) => handleProfileFieldChange("email", event.target.value)}
                                                className="w-full rounded-lg border border-gray-700 bg-[#121212] px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
                                                placeholder="Enter email"
                                            />
                                        ) : (
                                            <p className="text-white font-medium">{profileDetails.email || "Not specified"}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <MapPin className="w-5 h-5 text-emerald-400" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-400 mb-1">Location</p>
                                        {isEditingProfile ? (
                                            <input
                                                value={profileDetails.location}
                                                onChange={(event) => handleProfileFieldChange("location", event.target.value)}
                                                className="w-full rounded-lg border border-gray-700 bg-[#121212] px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
                                                placeholder="City, Country"
                                            />
                                        ) : (
                                            <p className="text-white font-medium">{profileDetails.location || "Not specified"}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <CreditCard className="w-5 h-5 text-emerald-400" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-400 mb-1">Account Type</p>
                                        <p className="text-white font-medium capitalize">{user.role?.toLowerCase() || "Customer"}</p>
                                        <p className="mt-1 text-xs text-gray-500">Role changes are managed by administrators.</p>
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
                    <CardDescription className="text-gray-400">All your bookings and upcoming reservations</CardDescription>
                </CardHeader>
                <CardContent>
                    {bookingActionMessage && (
                        <div className="mb-4 rounded-lg border border-gray-700 bg-[#1f1f1f] px-4 py-3 text-sm text-gray-200">
                            {bookingActionMessage}
                        </div>
                    )}

                    {!isAuthenticated ? (
                        <div className="text-center py-10">
                            <p className="text-gray-400 mb-4">Log in to view your bookings.</p>
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
                                            <p className="text-xs text-gray-500 mt-1">
                                                Payment: {booking.paymentStatus || "UNPAID"}
                                                {booking.paymentReference ? ` (${booking.paymentReference})` : ""}
                                            </p>
                                        </div>

                                        <div className="text-left md:text-right space-y-2">
                                            <p className="text-emerald-400 font-semibold">
                                                KES {booking.totalPrice.toLocaleString()}
                                            </p>
                                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getBookingBadgeClass(booking.bookingStatus)}`}>
                                                {getStatusLabel(booking.bookingStatus)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex flex-wrap items-center gap-2">
                                        {canSimulatePayment(booking.bookingStatus) && (
                                            <button
                                                onClick={() => void handleSimulatePayment(booking.bookingId)}
                                                disabled={processingBookingId === booking.bookingId}
                                                className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                                                    processingBookingId === booking.bookingId
                                                        ? "bg-emerald-400/40 text-white cursor-not-allowed"
                                                        : "bg-emerald-500 text-white hover:bg-emerald-600"
                                                }`}
                                            >
                                                {processingBookingId === booking.bookingId ? "Processing..." : "Complete Payment"}
                                            </button>
                                        )}

                                        {canCancelBooking(booking.bookingStatus) && (
                                            <button
                                                onClick={() => void handleCancelBooking(booking.bookingId)}
                                                disabled={processingBookingId === booking.bookingId}
                                                className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                                                    processingBookingId === booking.bookingId
                                                        ? "bg-red-400/40 text-white cursor-not-allowed"
                                                        : "bg-red-500 text-white hover:bg-red-600"
                                                }`}
                                            >
                                                {processingBookingId === booking.bookingId ? "Processing..." : "Cancel Booking"}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );

    const renderPayments = () => {
        const rewardProgress = Math.min(rewardPoints, rewardsTarget);
        const rewardPercentage = Math.round((rewardProgress / rewardsTarget) * 100);
        const rewardsRemaining = Math.max(rewardsTarget - rewardProgress, 0);
        const recentTransactions = sortedBookings.slice(0, 6);

        return (
            <div className="space-y-7">
                {bookingActionMessage && (
                    <div className="rounded-xl border border-gray-700 bg-[#1f1f1f] px-4 py-3 text-sm text-gray-200">
                        {bookingActionMessage}
                    </div>
                )}

                <section className="relative overflow-hidden rounded-3xl border border-gray-800 bg-gradient-to-br from-[#101010] via-[#141414] to-[#0f0f0f] p-6 md:p-7">
                    <div className="pointer-events-none absolute -top-24 right-0 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-28 -left-8 h-56 w-56 rounded-full bg-emerald-400/5 blur-3xl" />
                    <div className="relative">
                        <h2 className="text-3xl font-bold text-white md:text-4xl">Financial Hub</h2>
                        <p className="mt-2 max-w-2xl text-sm text-gray-400 md:text-base">
                            Track your rental spending, manage saved payment methods, and review recent payment activity.
                        </p>
                    </div>
                </section>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
                    <div className="space-y-7 xl:col-span-8">
                        <section>
                            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400">Billing Overview</p>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="rounded-2xl border border-gray-800 bg-[#1a1a1a] p-5">
                                    <p className="text-sm text-gray-400">Annual Expenditure</p>
                                    <p className="mt-2 text-3xl font-semibold text-white">{formatCurrency(annualExpenditureTotal)}</p>
                                    <p className="mt-2 text-xs uppercase tracking-wide text-gray-500">
                                        Across {paidBookings.length} completed payments
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-gray-800 bg-[#1a1a1a] p-5">
                                    <p className="text-sm text-gray-400">Pending Dues</p>
                                    <p className="mt-2 text-3xl font-semibold text-white">{formatCurrency(pendingDuesTotal)}</p>
                                    <p className="mt-2 text-xs uppercase tracking-wide text-amber-300">
                                        {pendingPaymentBookings.length} booking{pendingPaymentBookings.length === 1 ? "" : "s"} awaiting payment
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section>
                            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400">Payment Methods</p>
                                <button className="inline-flex items-center gap-1 rounded-full border border-gray-700 px-3 py-1.5 text-xs font-semibold text-gray-200 transition-colors hover:border-emerald-500/50 hover:text-emerald-300">
                                    <Plus className="h-3.5 w-3.5" />
                                    Add New Card
                                </button>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                {paymentMethods.map((method, index) => (
                                    <div
                                        key={method.id}
                                        className={`relative overflow-hidden rounded-2xl border border-gray-800 p-5 ${index % 2 === 0 ? "bg-[#181818]" : "bg-[#151515]"}`}
                                    >
                                        <div className="absolute -right-8 -top-10 h-24 w-24 rounded-full bg-emerald-500/15 blur-2xl" />
                                        <div className="relative space-y-5">
                                            <div className="flex items-center justify-between">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-emerald-300">
                                                    <CreditCard className="h-4 w-4" />
                                                </div>
                                                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">{method.provider}</span>
                                            </div>
                                            <p className="text-xl tracking-[0.24em] text-white">•••• •••• •••• {method.last4}</p>
                                            <div className="flex items-end justify-between">
                                                <div>
                                                    <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">Card Holder</p>
                                                    <p className="mt-1 text-sm font-semibold text-gray-200">{method.holder}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">Expires</p>
                                                    <p className="mt-1 text-sm font-semibold text-gray-200">{method.expires}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    <aside className="xl:col-span-4">
                        <div className="h-full rounded-3xl border border-emerald-400/20 bg-gradient-to-b from-emerald-500 to-emerald-600 p-6 text-white">
                            <div className="flex items-center gap-2 text-emerald-50/95">
                                <Gift className="h-5 w-5" />
                                <p className="text-lg font-semibold">Rewards Program</p>
                            </div>
                            <p className="mt-4 text-sm text-emerald-50/90">
                                You are {rewardsRemaining.toLocaleString()} points away from your next premium tier.
                            </p>
                            <p className="mt-3 text-sm text-emerald-50/80">
                                Unlock priority vehicle access and exclusive member offers.
                            </p>

                            <div className="mt-10">
                                <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.16em] text-emerald-50/90">
                                    <span>Current Progress</span>
                                    <span>{rewardProgress.toLocaleString()} / {rewardsTarget.toLocaleString()}</span>
                                </div>
                                <div className="h-2.5 rounded-full bg-emerald-950/30">
                                    <div
                                        className="h-full rounded-full bg-white"
                                        style={{ width: `${Math.min(rewardPercentage, 100)}%` }}
                                    />
                                </div>
                            </div>

                            <button className="mt-8 w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-50">
                                View Benefits
                            </button>
                        </div>
                    </aside>
                </div>

                <section>
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400">Transaction History</p>
                        <div className="flex items-center gap-2">
                            <button className="rounded-lg border border-gray-700 p-2 text-gray-400 transition-colors hover:border-gray-600 hover:text-white" aria-label="Filter transactions">
                                <SlidersHorizontal className="h-4 w-4" />
                            </button>
                            <button className="rounded-lg border border-gray-700 p-2 text-gray-400 transition-colors hover:border-gray-600 hover:text-white" aria-label="Download statement">
                                <Download className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto rounded-3xl border border-gray-800 bg-[#151515]">
                        {isLoadingBookings ? (
                            <div className="space-y-3 p-4 md:p-5">
                                {[1, 2, 3].map((item) => (
                                    <div key={item} className="h-14 animate-pulse rounded-xl bg-gray-800/60" />
                                ))}
                            </div>
                        ) : bookingsError ? (
                            <div className="p-6 text-center">
                                <p className="text-sm text-red-400">{bookingsError}</p>
                                <Button
                                    onClick={() => void fetchBookings()}
                                    variant="outline"
                                    className="mt-4 border-gray-700 text-gray-300 hover:bg-gray-800"
                                >
                                    Try Again
                                </Button>
                            </div>
                        ) : recentTransactions.length === 0 ? (
                            <div className="p-8 text-center">
                                <p className="text-sm text-gray-400">No transaction records available yet.</p>
                            </div>
                        ) : (
                            <table className="min-w-full text-left">
                                <thead>
                                    <tr className="border-b border-gray-800 text-xs uppercase tracking-[0.16em] text-gray-500">
                                        <th className="px-4 py-4 font-semibold md:px-5">Date</th>
                                        <th className="px-4 py-4 font-semibold md:px-5">Vehicle</th>
                                        <th className="px-4 py-4 font-semibold md:px-5">Transaction ID</th>
                                        <th className="px-4 py-4 font-semibold md:px-5">Status</th>
                                        <th className="px-4 py-4 font-semibold md:px-5 text-right">Amount</th>
                                        <th className="px-4 py-4 font-semibold md:px-5 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentTransactions.map((booking) => {
                                        const statusMeta = getTransactionStatusMeta(booking);
                                        const canPay = canSimulatePayment(booking.bookingStatus);

                                        return (
                                            <tr key={booking.bookingId} className="border-b border-gray-800/60 last:border-b-0">
                                                <td className="px-4 py-4 text-sm text-gray-300 md:px-5">
                                                    {formatBookingDate(booking.createdAt)}
                                                </td>
                                                <td className="px-4 py-4 md:px-5">
                                                    <p className="text-sm font-semibold text-gray-100">
                                                        {booking.carMake} {booking.carModel}
                                                    </p>
                                                    <p className="text-xs text-gray-500">{booking.carYear}</p>
                                                </td>
                                                <td className="px-4 py-4 text-xs text-gray-400 md:px-5">
                                                    {getTransactionId(booking)}
                                                </td>
                                                <td className="px-4 py-4 md:px-5">
                                                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${statusMeta.className}`}>
                                                        {statusMeta.label}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 text-right text-sm font-semibold text-white md:px-5">
                                                    {formatCurrency(booking.totalPrice)}
                                                </td>
                                                <td className="px-4 py-4 text-right md:px-5">
                                                    {canPay ? (
                                                        <button
                                                            onClick={() => void handleSimulatePayment(booking.bookingId)}
                                                            disabled={processingBookingId === booking.bookingId}
                                                            className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                                                                processingBookingId === booking.bookingId
                                                                    ? "cursor-not-allowed bg-emerald-300/40 text-white"
                                                                    : "bg-emerald-500 text-white hover:bg-emerald-600"
                                                            }`}
                                                        >
                                                            {processingBookingId === booking.bookingId ? "Processing..." : "Pay Now"}
                                                        </button>
                                                    ) : (
                                                        <span className="text-xs text-gray-500">-</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </section>
            </div>
        );
    };

    const renderPage = () => {
        switch (currentPage) {
            case "profile":
                return renderProfile();
            case "bookings":
                return renderBookings();
            case "payments":
                return renderPayments();
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
