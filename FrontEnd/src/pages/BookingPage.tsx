import {useEffect, useMemo, useState} from "react";
import {Link, useNavigate, useSearchParams} from "react-router-dom";
import {
    AlertCircle,
    Calendar,
    Car,
    Check,
    ChevronLeft,
    ChevronRight,
    Clock,
    CreditCard,
    Lock,
    Mail,
    MapPin,
    Phone,
    Shield,
    User,
    LogIn
} from "lucide-react";
import {Navbar} from "../components/Navbar";
import {Footer} from "../components/Footer";
import {Car as CarType, CARS_DATA} from "../data/cars";
import {carService} from "../services/carService";
import {getImageUrl} from "../lib/ImageUtils";
import {authService} from "../services/AuthService";
import {AuthModal} from "../components/AuthModal";

// Pickup locations
const PICKUP_LOCATIONS = [
    { id: 1, name: "Nairobi CBD", address: "Kenyatta Avenue, Nairobi" },
    { id: 2, name: "JKIA Airport", address: "Jomo Kenyatta International Airport" },
    { id: 3, name: "Westlands", address: "Westlands, Nairobi" },
    { id: 4, name: "Karen", address: "Karen, Nairobi" },
    { id: 5, name: "Wilson Airport", address: "Wilson Airport, Langata" },
];

export default function BookingPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    
    // Get authentication state
    const isAuthenticated = authService.isAuthenticated();
    const user = authService.getUser();

    const carId = searchParams.get("carId");

    // ✅ STATE FOR CAR DATA - MUST BE AT TOP
    const [car, setCar] = useState<CarType | null>(null);
    const [isLoadingCar, setIsLoadingCar] = useState(true);
    const [carError, setCarError] = useState<string | null>(null);

    // Parse dates from URL if provided
    const urlPickupDate = searchParams.get("pickupDate");
    const urlDropoffDate = searchParams.get("dropoffDate");
    const hasPreselectedDates = Boolean(urlPickupDate && urlDropoffDate);

    // Booking states - initialize with URL dates if available
    const [step, setStep] = useState(hasPreselectedDates ? 1 : 1);
    const [pickupDate, setPickupDate] = useState<Date | null>(
        urlPickupDate ? new Date(urlPickupDate) : null
    );
    const [dropoffDate, setDropoffDate] = useState<Date | null>(
        urlDropoffDate ? new Date(urlDropoffDate) : null
    );
    const [pickupLocation, setPickupLocation] = useState<number | null>(null);
    const [dropoffLocation, setDropoffLocation] = useState<number | null>(null);
    const [sameLocation, setSameLocation] = useState(true);
    const [pickupTime, setPickupTime] = useState("10:00");
    const [dropoffTime, setDropoffTime] = useState("10:00");
    const [currentMonth, setCurrentMonth] = useState(
        urlPickupDate ? new Date(urlPickupDate) : new Date()
    );

    // Guest info (for non-authenticated users) - prefill with user data if logged in
    const [guestInfo, setGuestInfo] = useState({
        fullName: user?.userName || "",
        email: user?.email || "",
        phone: "",
        idNumber: ""
    });

    // Update guest info when user logs in
    useEffect(() => {
        if (isAuthenticated && user) {
            setGuestInfo(prev => ({
                ...prev,
                fullName: user.userName || prev.fullName,
                email: user.email || prev.email
            }));
        }
    }, [isAuthenticated, user]);

    // Extras
    const [extras, setExtras] = useState({
        insurance: true,
        gps: false,
        childSeat: false,
        additionalDriver: false
    });

    // ✅ FETCH CAR DATA ON MOUNT
    useEffect(() => {
        const fetchCar = async () => {
            if (!carId) {
                setIsLoadingCar(false);
                return;
            }

            try {
                setIsLoadingCar(true);
                setCarError(null);

                // Fetch from backend
                const fetchedCar = await carService.getById(Number(carId));
                setCar(fetchedCar);
            } catch (error) {
                console.error("Failed to fetch car:", error);
                setCarError("Failed to load vehicle details");

                // Fallback to CARS_DATA
                const fallbackCar = CARS_DATA.find(c => c.id === Number(carId));
                if (fallbackCar) {
                    setCar(fallbackCar);
                }
            } finally {
                setIsLoadingCar(false);
            }
        };

        fetchCar();
    }, [carId]);

    // Calculate rental days and pricing
    const rentalDays = useMemo(() => {
        if (pickupDate && dropoffDate) {
            const diff = dropoffDate.getTime() - pickupDate.getTime();
            return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
        }
        return 0;
    }, [pickupDate, dropoffDate]);

    const pricing = useMemo(() => {
        if (!car || rentalDays === 0) {
            return { subtotal: 0, insurance: 0, gps: 0, childSeat: 0, additionalDriver: 0, serviceFee: 0, total: 0 };
        }

        const subtotal = car.dailyPrice * rentalDays;
        const insurance = extras.insurance ? rentalDays * 500 : 0;
        const gps = extras.gps ? rentalDays * 200 : 0;
        const childSeat = extras.childSeat ? rentalDays * 300 : 0;
        const additionalDriver = extras.additionalDriver ? rentalDays * 400 : 0;
        const serviceFee = Math.round(subtotal * 0.05);
        const total = subtotal + insurance + gps + childSeat + additionalDriver + serviceFee;

        return { subtotal, insurance, gps, childSeat, additionalDriver, serviceFee, total };
    }, [car, rentalDays, extras]);

    // Date selection handler
    const handleDateSelect = (date: Date) => {
        if (!pickupDate || (pickupDate && dropoffDate)) {
            setPickupDate(date);
            setDropoffDate(null);
        } else {
            if (date < pickupDate) {
                setPickupDate(date);
            } else {
                setDropoffDate(date);
            }
        }
    };

    // Validation
    const canProceedStep1 = pickupDate && dropoffDate && pickupLocation;
    const canProceedStep2 = isAuthenticated || (guestInfo.fullName && guestInfo.email && guestInfo.phone && guestInfo.idNumber);
    const canProceedStep3 = true;

    // ✅ LOADING STATE
    if (isLoadingCar) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="pt-24 pb-12 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-gray-600">Loading vehicle details...</p>
                    </div>
                </div>
            </div>
        );
    }

    // ✅ NO CAR FOUND
    if (!car) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="pt-24 pb-12 flex items-center justify-center">
                    <div className="text-center bg-white rounded-2xl p-8 shadow-sm max-w-md mx-4">
                        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            {carError || "No Vehicle Selected"}
                        </h1>
                        <p className="text-gray-600 mb-6">
                            Please select a vehicle from our collection to proceed with booking.
                        </p>
                        <Link
                            to="/vehicles"
                            className="inline-block px-6 py-3 bg-black text-white rounded-xl font-semibold hover:bg-zinc-800 transition-colors"
                        >
                            Browse Vehicles
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            {/* Header */}
            <div className="bg-black pt-20 pb-8">
                <div className="max-w-6xl mx-auto px-5 md:px-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Complete Your Booking</h1>
                    <p className="text-gray-400">You're booking: {car.name}</p>
                </div>
            </div>

            {/* Error message if any */}
            {carError && (
                <div className="bg-yellow-50 border-b border-yellow-200">
                    <div className="max-w-6xl mx-auto px-5 md:px-8 py-3">
                        <p className="text-yellow-800 text-sm">{carError} - Showing cached data</p>
                    </div>
                </div>
            )}

            {/* Progress Steps */}
            <div className="bg-white border-b border-gray-100 sticky top-16 z-40">
                <div className="max-w-6xl mx-auto px-5 md:px-8 py-4">
                    <div className="flex items-center justify-between max-w-xl">
                        {[
                            { num: 1, label: "Dates & Location" },
                            { num: 2, label: "Your Details" },
                            { num: 3, label: "Payment" }
                        ].map((s, i) => (
                            <div key={s.num} className="flex items-center">
                                <div className={`flex items-center gap-2 ${step >= s.num ? "text-black" : "text-gray-400"}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                                        step > s.num
                                            ? "bg-emerald-500 text-white"
                                            : step === s.num
                                                ? "bg-black text-white"
                                                : "bg-gray-200 text-gray-500"
                                    }`}>
                                        {step > s.num ? <Check className="w-4 h-4" /> : s.num}
                                    </div>
                                    <span className="hidden sm:block text-sm font-medium">{s.label}</span>
                                </div>
                                {i < 2 && (
                                    <div className={`w-12 sm:w-20 h-0.5 mx-2 ${step > s.num ? "bg-emerald-500" : "bg-gray-200"}`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-5 md:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Step 1: Dates & Location */}
                        {step === 1 && (
                            <>
                                {/* Pre-selected Dates Confirmation */}
                                {hasPreselectedDates && pickupDate && dropoffDate && (
                                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 mb-6">
                                        <div className="flex items-start gap-3">
                                            <Check className="w-5 h-5 text-emerald-600 mt-0.5" />
                                            <div className="flex-1">
                                                <p className="font-medium text-emerald-900">Dates Pre-selected</p>
                                                <p className="text-sm text-emerald-700 mt-1">
                                                    {pickupDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                                    {' → '}
                                                    {dropoffDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                                    {' '}({rentalDays} day{rentalDays > 1 ? 's' : ''})
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Date Selection */}
                                <div className="bg-white rounded-2xl p-6 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                            <Calendar className="w-5 h-5" />
                                            {hasPreselectedDates ? "Confirm or Change Dates" : "Select Rental Dates"}
                                        </h2>
                                        {hasPreselectedDates && pickupDate && dropoffDate && (
                                            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium">
                                                ✓ Pre-filled
                                            </span>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Calendar */}
                                        <div>
                                            <BookingCalendar
                                                currentMonth={currentMonth}
                                                setCurrentMonth={setCurrentMonth}
                                                pickupDate={pickupDate}
                                                dropoffDate={dropoffDate}
                                                onDateSelect={handleDateSelect}
                                            />
                                        </div>

                                        {/* Time Selection */}
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Pick-up Date & Time
                                                </label>
                                                <div className={`flex items-center gap-2 p-3 rounded-xl ${pickupDate ? "bg-emerald-50 border border-emerald-200" : "bg-gray-50"}`}>
                                                    <Calendar className={`w-4 h-4 ${pickupDate ? "text-emerald-600" : "text-gray-500"}`} />
                                                    <span className={`text-sm ${pickupDate ? "text-emerald-900 font-medium" : "text-gray-500"}`}>
                                                        {pickupDate
                                                            ? pickupDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                                                            : "Select date"
                                                        }
                                                    </span>
                                                </div>
                                                <select
                                                    value={pickupTime}
                                                    onChange={(e) => setPickupTime(e.target.value)}
                                                    className="mt-2 w-full px-3 py-2.5 bg-gray-50 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
                                                >
                                                    {Array.from({ length: 24 }, (_, i) => {
                                                        const hour = i.toString().padStart(2, '0');
                                                        return (
                                                            <option key={i} value={`${hour}:00`}>{hour}:00</option>
                                                        );
                                                    })}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Drop-off Date & Time
                                                </label>
                                                <div className={`flex items-center gap-2 p-3 rounded-xl ${dropoffDate ? "bg-emerald-50 border border-emerald-200" : "bg-gray-50"}`}>
                                                    <Calendar className={`w-4 h-4 ${dropoffDate ? "text-emerald-600" : "text-gray-500"}`} />
                                                    <span className={`text-sm ${dropoffDate ? "text-emerald-900 font-medium" : "text-gray-500"}`}>
                                                        {dropoffDate
                                                            ? dropoffDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                                                            : "Select date"
                                                        }
                                                    </span>
                                                </div>
                                                <select
                                                    value={dropoffTime}
                                                    onChange={(e) => setDropoffTime(e.target.value)}
                                                    className="mt-2 w-full px-3 py-2.5 bg-gray-50 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
                                                >
                                                    {Array.from({ length: 24 }, (_, i) => {
                                                        const hour = i.toString().padStart(2, '0');
                                                        return (
                                                            <option key={i} value={`${hour}:00`}>{hour}:00</option>
                                                        );
                                                    })}
                                                </select>
                                            </div>

                                            {rentalDays > 0 && (
                                                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                                                    <p className="text-sm text-emerald-700 font-medium flex items-center gap-2">
                                                        <Check className="w-4 h-4" />
                                                        {rentalDays} day{rentalDays > 1 ? 's' : ''} rental
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Location Selection */}
                                <div className="bg-white rounded-2xl p-6 shadow-sm">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <MapPin className="w-5 h-5" />
                                        Pick-up & Drop-off Location
                                    </h2>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Pick-up Location
                                            </label>
                                            <select
                                                value={pickupLocation || ""}
                                                onChange={(e) => {
                                                    setPickupLocation(Number(e.target.value));
                                                    if (sameLocation) setDropoffLocation(Number(e.target.value));
                                                }}
                                                className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
                                            >
                                                <option value="">Select pick-up location</option>
                                                {PICKUP_LOCATIONS.map(loc => (
                                                    <option key={loc.id} value={loc.id}>
                                                        {loc.name} - {loc.address}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={sameLocation}
                                                onChange={(e) => {
                                                    setSameLocation(e.target.checked);
                                                    if (e.target.checked) setDropoffLocation(pickupLocation);
                                                }}
                                                className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black"
                                            />
                                            <span className="text-sm text-gray-700">Return to same location</span>
                                        </label>

                                        {!sameLocation && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Drop-off Location
                                                </label>
                                                <select
                                                    value={dropoffLocation || ""}
                                                    onChange={(e) => setDropoffLocation(Number(e.target.value))}
                                                    className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
                                                >
                                                    <option value="">Select drop-off location</option>
                                                    {PICKUP_LOCATIONS.map(loc => (
                                                        <option key={loc.id} value={loc.id}>
                                                            {loc.name} - {loc.address}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Authentication Prompt at Step 1 */}
                                {!isAuthenticated && canProceedStep1 && (
                                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-5">
                                        <div className="flex items-center justify-between flex-wrap gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                                                    <LogIn className="w-5 h-5 text-emerald-600" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-emerald-900">Ready to continue?</p>
                                                    <p className="text-sm text-emerald-700">Log in to save time on the next step</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setIsAuthModalOpen(true)}
                                                className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors text-sm flex items-center gap-2"
                                            >
                                                <LogIn className="w-4 h-4" />
                                                Log In
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Extras */}
                                <div className="bg-white rounded-2xl p-6 shadow-sm">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <Shield className="w-5 h-5" />
                                        Add-ons & Extras
                                    </h2>

                                    <div className="space-y-3">
                                        {[
                                            { key: "insurance", label: "Full Insurance Coverage", price: 500, desc: "Comprehensive protection against damage" },
                                            { key: "gps", label: "GPS Navigation", price: 200, desc: "Never get lost with built-in navigation" },
                                            { key: "childSeat", label: "Child Seat", price: 300, desc: "Safe seating for children" },
                                            { key: "additionalDriver", label: "Additional Driver", price: 400, desc: "Add another authorized driver" },
                                        ].map(extra => (
                                            <label
                                                key={extra.key}
                                                className={`flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all ${
                                                    extras[extra.key as keyof typeof extras]
                                                        ? "bg-black text-white"
                                                        : "bg-gray-50 hover:bg-gray-100"
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={extras[extra.key as keyof typeof extras]}
                                                    onChange={(e) => setExtras({ ...extras, [extra.key]: e.target.checked })}
                                                    className="mt-1 w-5 h-5 rounded border-gray-300"
                                                />
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-medium">{extra.label}</span>
                                                        <span className={`text-sm font-semibold ${extras[extra.key as keyof typeof extras] ? "text-white" : "text-gray-900"}`}>
                                                            Ksh {extra.price}/day
                                                        </span>
                                                    </div>
                                                    <p className={`text-sm mt-1 ${extras[extra.key as keyof typeof extras] ? "text-gray-300" : "text-gray-500"}`}>
                                                        {extra.desc}
                                                    </p>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Step 2: Your Details */}
                        {step === 2 && (
                            <div className="bg-white rounded-2xl p-6 shadow-sm">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <User className="w-5 h-5" />
                                    {isAuthenticated ? "Confirm Your Details" : "Enter Your Details"}
                                </h2>

                                {!isAuthenticated && (
                                    <div className="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl">
                                        <div className="flex items-start gap-3">
                                            <AlertCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                                            <div className="flex-1">
                                                <p className="text-sm font-semibold text-emerald-900 mb-1">Not logged in?</p>
                                                <p className="text-sm text-emerald-700 mb-3">
                                                    Log in to save your details and track your bookings, or continue as guest below.
                                                </p>
                                                <button
                                                    onClick={() => setIsAuthModalOpen(true)}
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors text-sm"
                                                >
                                                    <LogIn className="w-4 h-4" />
                                                    Log In Now
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {isAuthenticated && (
                                    <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <Check className="w-5 h-5 text-emerald-600" />
                                            <div>
                                                <p className="text-sm font-medium text-emerald-900">Logged in as {user?.userName}</p>
                                                <p className="text-xs text-emerald-700 mt-0.5">Your details have been pre-filled</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Full Name (as per ID)
                                        </label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="text"
                                                value={guestInfo.fullName}
                                                onChange={(e) => setGuestInfo({ ...guestInfo, fullName: e.target.value })}
                                                placeholder="John Doe"
                                                disabled={isAuthenticated}
                                                className={`w-full pl-12 pr-4 py-3 bg-gray-50 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black ${
                                                    isAuthenticated ? "opacity-75 cursor-not-allowed" : ""
                                                }`}
                                            />
                                        </div>
                                        {isAuthenticated && (
                                            <p className="text-xs text-gray-500 mt-1">This field is pre-filled from your account</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email Address
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="email"
                                                value={guestInfo.email}
                                                onChange={(e) => setGuestInfo({ ...guestInfo, email: e.target.value })}
                                                placeholder="john@example.com"
                                                disabled={isAuthenticated}
                                                className={`w-full pl-12 pr-4 py-3 bg-gray-50 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black ${
                                                    isAuthenticated ? "opacity-75 cursor-not-allowed" : ""
                                                }`}
                                            />
                                        </div>
                                        {isAuthenticated && (
                                            <p className="text-xs text-gray-500 mt-1">This field is pre-filled from your account</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Phone Number
                                        </label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="tel"
                                                value={guestInfo.phone}
                                                onChange={(e) => setGuestInfo({ ...guestInfo, phone: e.target.value })}
                                                placeholder="+254 712 345 678"
                                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            ID/Passport Number
                                        </label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="text"
                                                value={guestInfo.idNumber}
                                                onChange={(e) => setGuestInfo({ ...guestInfo, idNumber: e.target.value })}
                                                placeholder="12345678"
                                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                                    <p className="text-xs text-gray-500">
                                        By proceeding, you agree to our <a href="#" className="underline">Terms of Service</a> and <a href="#" className="underline">Privacy Policy</a>.
                                        A valid driving license is required at pick-up.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Payment */}
                        {step === 3 && (
                            <div className="bg-white rounded-2xl p-6 shadow-sm">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <CreditCard className="w-5 h-5" />
                                    Payment Method
                                </h2>

                                <div className="space-y-4">
                                    {/* Payment Options */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <button className="p-4 border-2 border-black bg-gray-50 rounded-xl text-left">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-8 bg-green-600 rounded flex items-center justify-center text-white text-xs font-bold">
                                                    M-PESA
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">M-Pesa</p>
                                                    <p className="text-xs text-gray-500">Pay via Safaricom</p>
                                                </div>
                                            </div>
                                        </button>

                                        <button className="p-4 border-2 border-gray-200 hover:border-gray-300 rounded-xl text-left transition-colors">
                                            <div className="flex items-center gap-3">
                                                <CreditCard className="w-8 h-8 text-gray-600" />
                                                <div>
                                                    <p className="font-medium text-gray-900">Card Payment</p>
                                                    <p className="text-xs text-gray-500">Visa, Mastercard</p>
                                                </div>
                                            </div>
                                        </button>
                                    </div>

                                    {/* M-Pesa Instructions */}
                                    <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                                        <h3 className="font-medium text-green-900 mb-2">M-Pesa Payment</h3>
                                        <ol className="text-sm text-green-800 space-y-1">
                                            <li>1. Click "Complete Booking" below</li>
                                            <li>2. You will receive an STK push on your phone</li>
                                            <li>3. Enter your M-Pesa PIN to complete payment</li>
                                            <li>4. Wait for confirmation SMS</li>
                                        </ol>
                                    </div>

                                    {/* Summary */}
                                    <div className="p-4 bg-gray-50 rounded-xl">
                                        <h3 className="font-medium text-gray-900 mb-3">Booking Summary</h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Vehicle</span>
                                                <span className="font-medium text-gray-900">{car.name}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Duration</span>
                                                <span className="font-medium text-gray-900">{rentalDays} day{rentalDays > 1 ? 's' : ''}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Pick-up</span>
                                                <span className="font-medium text-gray-900">
                                                    {pickupDate?.toLocaleDateString()} at {pickupTime}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Customer</span>
                                                <span className="font-medium text-gray-900">
                                                    {isAuthenticated ? user?.userName : guestInfo.fullName || "Guest"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex items-center justify-between">
                            {step > 1 ? (
                                <button
                                    onClick={() => setStep(step - 1)}
                                    className="px-6 py-3 text-gray-700 font-medium hover:text-gray-900 transition-colors"
                                >
                                    ← Back
                                </button>
                            ) : (
                                <div />
                            )}

                            {step < 3 ? (
                                <button
                                    onClick={() => setStep(step + 1)}
                                    disabled={step === 1 ? !canProceedStep1 : !canProceedStep2}
                                    className={`px-8 py-3 rounded-xl font-semibold transition-all ${
                                        (step === 1 ? canProceedStep1 : canProceedStep2)
                                            ? "bg-black text-white hover:bg-zinc-800"
                                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                    }`}
                                >
                                    Continue →
                                </button>
                            ) : (
                                <button
                                    className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
                                >
                                    Complete Booking - Ksh {pricing.total.toLocaleString()}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Sidebar - Booking Summary */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-36 space-y-6">
                            {/* Car Card */}
                            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
                                <div className="aspect-[16/10] bg-gray-100">
                                    <img
                                        src={getImageUrl(car.mainImageUrl)}
                                        alt={car.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.currentTarget.src = "/placeholder-car.jpg";
                                        }}
                                    />
                                </div>
                                <div className="p-4">
                                    <p className="text-xs text-gray-500 uppercase tracking-wider">{car.bodyType}</p>
                                    <h3 className="font-bold text-gray-900">{car.name}</h3>
                                    <p className="text-sm text-gray-500 mt-1">{car.location}</p>
                                </div>
                            </div>

                            {/* Price Breakdown */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm">
                                <h3 className="font-semibold text-gray-900 mb-4">Price Breakdown</h3>

                                {rentalDays > 0 ? (
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Ksh {car.dailyPrice.toLocaleString()} × {rentalDays} days</span>
                                            <span className="font-medium text-gray-900">Ksh {pricing.subtotal.toLocaleString()}</span>
                                        </div>

                                        {pricing.insurance > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Insurance</span>
                                                <span className="font-medium text-gray-900">Ksh {pricing.insurance.toLocaleString()}</span>
                                            </div>
                                        )}

                                        {pricing.gps > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">GPS Navigation</span>
                                                <span className="font-medium text-gray-900">Ksh {pricing.gps.toLocaleString()}</span>
                                            </div>
                                        )}

                                        {pricing.childSeat > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Child Seat</span>
                                                <span className="font-medium text-gray-900">Ksh {pricing.childSeat.toLocaleString()}</span>
                                            </div>
                                        )}

                                        {pricing.additionalDriver > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Additional Driver</span>
                                                <span className="font-medium text-gray-900">Ksh {pricing.additionalDriver.toLocaleString()}</span>
                                            </div>
                                        )}

                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Service fee</span>
                                            <span className="font-medium text-gray-900">Ksh {pricing.serviceFee.toLocaleString()}</span>
                                        </div>

                                        <div className="flex justify-between pt-3 border-t border-gray-100">
                                            <span className="font-semibold text-gray-900">Total</span>
                                            <span className="font-bold text-gray-900 text-lg">Ksh {pricing.total.toLocaleString()}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500">Select dates to see pricing</p>
                                )}
                            </div>

                            {/* Trust Badges */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-sm">
                                        <Shield className="w-5 h-5 text-emerald-500" />
                                        <span className="text-gray-700">Fully insured vehicles</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <Clock className="w-5 h-5 text-emerald-500" />
                                        <span className="text-gray-700">Free cancellation up to 24h</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <Car className="w-5 h-5 text-emerald-500" />
                                        <span className="text-gray-700">24/7 roadside assistance</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />

            {/* Auth Modal */}
            <AuthModal 
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                initialMode="login"
                onLoginSuccess={() => {
                    setIsAuthModalOpen(false);
                    // Refresh the page to update auth state
                    window.location.reload();
                }}
            />
        </div>
    );
}

// Booking Calendar Component
interface BookingCalendarProps {
    currentMonth: Date;
    setCurrentMonth: (date: Date) => void;
    pickupDate: Date | null;
    dropoffDate: Date | null;
    onDateSelect: (date: Date) => void;
}

function BookingCalendar({ currentMonth, setCurrentMonth, pickupDate, dropoffDate, onDateSelect }: BookingCalendarProps) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
    const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const handlePrevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    const isSelected = (day: number) => {
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        if (pickupDate && date.getTime() === pickupDate.getTime()) return "start";
        if (dropoffDate && date.getTime() === dropoffDate.getTime()) return "end";
        return null;
    };

    const isInRange = (day: number) => {
        if (!pickupDate || !dropoffDate) return false;
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        return date > pickupDate && date < dropoffDate;
    };

    const isPast = (day: number) => {
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        return date < today;
    };

    return (
        <div className="border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
                <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <span className="font-medium text-gray-900">{monthName}</span>
                <button onClick={handleNextMonth} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                    <div key={day} className="text-center text-xs text-gray-500 py-1">{day}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDayOfMonth }).map((_, index) => (
                    <div key={`empty-${index}`} className="h-9" />
                ))}

                {Array.from({ length: daysInMonth }).map((_, index) => {
                    const day = index + 1;
                    const past = isPast(day);
                    const selected = isSelected(day);
                    const inRange = isInRange(day);

                    return (
                        <button
                            key={day}
                            onClick={() => !past && onDateSelect(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day))}
                            disabled={past}
                            className={`h-9 text-sm rounded-lg transition-all ${
                                past
                                    ? "text-gray-300 cursor-not-allowed"
                                    : selected === "start"
                                        ? "bg-black text-white font-medium rounded-r-none"
                                        : selected === "end"
                                            ? "bg-black text-white font-medium rounded-l-none"
                                            : inRange
                                                ? "bg-gray-100 text-gray-900"
                                                : "hover:bg-gray-100 text-gray-700"
                            }`}
                        >
                            {day}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}