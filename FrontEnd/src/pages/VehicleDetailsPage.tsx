import { useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
    ChevronLeft, 
    ChevronRight, 
    Star, 
    MapPin, 
    Users, 
    Settings, 
    Fuel, 
    Gauge,
    CheckCircle2,
    Calendar,
    Shield,
    Clock,
    Car,
    ArrowLeft
} from "lucide-react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { getCarById, CARS_DATA } from "../data/cars";

export default function VehicleDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const car = getCarById(Number(id));
    
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [selectedDates, setSelectedDates] = useState<{ start: Date | null; end: Date | null }>({
        start: null,
        end: null
    });
    const [currentMonth, setCurrentMonth] = useState(new Date());

    if (!car) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Vehicle not found</h1>
                    <Link 
                        to="/vehicles" 
                        className="text-gray-600 hover:text-gray-900 underline"
                    >
                        Back to vehicles
                    </Link>
                </div>
            </div>
        );
    }

    const images = car.gallery.length > 0 ? car.gallery : [{ id: 1, url: car.mainImage, alt: car.name }];

    const handlePrevImage = () => {
        setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const handleNextImage = () => {
        setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    // Calculate rental duration and total
    const rentalDays = useMemo(() => {
        if (selectedDates.start && selectedDates.end) {
            const diff = selectedDates.end.getTime() - selectedDates.start.getTime();
            return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
        }
        return 0;
    }, [selectedDates]);

    const totalPrice = rentalDays * car.dailyPrice;
    const serviceFee = Math.round(totalPrice * 0.1);
    const insuranceFee = rentalDays * 500;

    // Related cars (same body type, excluding current)
    const relatedCars = CARS_DATA.filter(c => c.bodyType === car.bodyType && c.id !== car.id).slice(0, 3);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sticky Navbar */}
            <Navbar />
            
            {/* Spacer for fixed navbar */}
            <div className="h-16 bg-black" />

            {/* Breadcrumb */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-5 md:px-8 py-4">
                    <button 
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm font-medium">Back to vehicles</span>
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-5 md:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Image Gallery */}
                        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
                            {/* Main Image */}
                            <div className="relative aspect-[16/10] bg-gray-100">
                                <img
                                    src={images[currentImageIndex].url || "/placeholder.svg"}
                                    alt={images[currentImageIndex].alt}
                                    className="w-full h-full object-cover"
                                />
                                
                                {/* Navigation */}
                                {images.length > 1 && (
                                    <>
                                        <button
                                            onClick={handlePrevImage}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all"
                                        >
                                            <ChevronLeft className="w-5 h-5 text-gray-700" />
                                        </button>
                                        <button
                                            onClick={handleNextImage}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all"
                                        >
                                            <ChevronRight className="w-5 h-5 text-gray-700" />
                                        </button>
                                    </>
                                )}
                                
                                {/* Image Counter */}
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full">
                                    <span className="text-white text-sm font-medium">
                                        {currentImageIndex + 1} / {images.length}
                                    </span>
                                </div>
                            </div>
                            
                            {/* Thumbnails */}
                            {images.length > 1 && (
                                <div className="p-4 flex gap-3 overflow-x-auto">
                                    {images.map((img, index) => (
                                        <button
                                            key={img.id}
                                            onClick={() => setCurrentImageIndex(index)}
                                            className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                                                index === currentImageIndex
                                                    ? "border-black"
                                                    : "border-transparent hover:border-gray-300"
                                            }`}
                                        >
                                            <img
                                                src={img.url}
                                                alt={img.alt}
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Car Info */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm">
                            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                                <div>
                                    <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">{car.bodyType} • {car.year}</p>
                                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{car.name}</h1>
                                </div>
                                <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl">
                                    <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                                    <span className="font-bold text-gray-900">{car.rating}</span>
                                    <span className="text-gray-500">({car.reviewCount} reviews)</span>
                                </div>
                            </div>
                            
                            {/* Location */}
                            <div className="flex items-center gap-2 text-gray-600 mb-6">
                                <MapPin className="w-4 h-4" />
                                <span>{car.location}</span>
                            </div>
                            
                            {/* Specs Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-xl mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                                        <Users className="w-5 h-5 text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Seats</p>
                                        <p className="font-semibold text-gray-900">{car.seatingCapacity}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                                        <Settings className="w-5 h-5 text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Transmission</p>
                                        <p className="font-semibold text-gray-900">{car.transmission}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                                        <Fuel className="w-5 h-5 text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Fuel Type</p>
                                        <p className="font-semibold text-gray-900">{car.fuelType}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                                        <Gauge className="w-5 h-5 text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Mileage</p>
                                        <p className="font-semibold text-gray-900">{car.mileage}</p>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Description */}
                            <div className="mb-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-3">About this car</h2>
                                <p className="text-gray-600 leading-relaxed">{car.description}</p>
                            </div>
                            
                            {/* Additional Info */}
                            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Engine</p>
                                    <p className="font-medium text-gray-900">{car.engineCapacity}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Color</p>
                                    <p className="font-medium text-gray-900">{car.color}</p>
                                </div>
                            </div>
                        </div>

                        {/* Features */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Features & Amenities</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {car.features.map((feature, index) => (
                                    <div 
                                        key={index} 
                                        className={`flex items-center gap-3 p-3 rounded-lg ${
                                            feature.available ? "bg-emerald-50" : "bg-gray-50"
                                        }`}
                                    >
                                        <CheckCircle2 className={`w-5 h-5 flex-shrink-0 ${
                                            feature.available ? "text-emerald-500" : "text-gray-300"
                                        }`} />
                                        <span className={feature.available ? "text-gray-900" : "text-gray-400"}>
                                            {feature.name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Policies */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Rental Policies</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                                    <Shield className="w-5 h-5 text-gray-600 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-gray-900">Insurance Included</p>
                                        <p className="text-sm text-gray-500">Full coverage protection</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                                    <Clock className="w-5 h-5 text-gray-600 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-gray-900">Free Cancellation</p>
                                        <p className="text-sm text-gray-500">Up to 24 hours before</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                                    <Car className="w-5 h-5 text-gray-600 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-gray-900">Unlimited Mileage</p>
                                        <p className="text-sm text-gray-500">Drive without limits</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar - Booking Panel */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-20 space-y-6">
                            {/* Price Card */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm">
                                <div className="flex items-baseline gap-2 mb-6">
                                    <span className="text-3xl font-bold text-gray-900">
                                        Ksh {car.dailyPrice.toLocaleString()}
                                    </span>
                                    <span className="text-gray-500">/day</span>
                                </div>

                                {/* Availability Calendar */}
                                <div className="mb-6">
                                    <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        Select Dates
                                    </h3>
                                    <MiniCalendar 
                                        currentMonth={currentMonth}
                                        setCurrentMonth={setCurrentMonth}
                                        selectedDates={selectedDates}
                                        setSelectedDates={setSelectedDates}
                                    />
                                </div>

                                {/* Selected Dates Display */}
                                {selectedDates.start && (
                                    <div className="p-4 bg-gray-50 rounded-xl mb-6">
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-gray-500">Pick-up</span>
                                            <span className="font-medium text-gray-900">
                                                {selectedDates.start.toLocaleDateString('en-US', { 
                                                    weekday: 'short', 
                                                    month: 'short', 
                                                    day: 'numeric' 
                                                })}
                                            </span>
                                        </div>
                                        {selectedDates.end && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Return</span>
                                                <span className="font-medium text-gray-900">
                                                    {selectedDates.end.toLocaleDateString('en-US', { 
                                                        weekday: 'short', 
                                                        month: 'short', 
                                                        day: 'numeric' 
                                                    })}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Price Breakdown */}
                                {rentalDays > 0 && (
                                    <div className="space-y-3 mb-6 pt-4 border-t border-gray-100">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">
                                                Ksh {car.dailyPrice.toLocaleString()} × {rentalDays} days
                                            </span>
                                            <span className="font-medium text-gray-900">
                                                Ksh {totalPrice.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Service fee</span>
                                            <span className="font-medium text-gray-900">
                                                Ksh {serviceFee.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Insurance</span>
                                            <span className="font-medium text-gray-900">
                                                Ksh {insuranceFee.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between pt-3 border-t border-gray-100">
                                            <span className="font-semibold text-gray-900">Total</span>
                                            <span className="font-bold text-gray-900 text-lg">
                                                Ksh {(totalPrice + serviceFee + insuranceFee).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Book Button */}
                                <button
                                    onClick={() => {
                                        const params = new URLSearchParams();
                                        params.set("carId", car.id.toString());
                                        if (selectedDates.start) {
                                            params.set("pickupDate", selectedDates.start.toISOString());
                                        }
                                        if (selectedDates.end) {
                                            params.set("dropoffDate", selectedDates.end.toISOString());
                                        }
                                        navigate(`/booking?${params.toString()}`);
                                    }}
                                    disabled={rentalDays === 0}
                                    className={`w-full py-4 rounded-xl font-semibold transition-all ${
                                        rentalDays > 0
                                            ? "bg-black text-white hover:bg-zinc-800"
                                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    }`}
                                >
                                    {rentalDays > 0 ? "Book Now" : "Select dates to book"}
                                </button>

                                {/* Availability Status */}
                                <div className="mt-4 flex items-center justify-center gap-2">
                                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                    <span className="text-sm text-gray-600">Available for booking</span>
                                </div>
                            </div>

                            {/* Contact Card */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm">
                                <h3 className="font-semibold text-gray-900 mb-4">Need Help?</h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    Our team is available 24/7 to assist you with your booking.
                                </p>
                                <button className="w-full py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all">
                                    Contact Support
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Cars */}
                {relatedCars.length > 0 && (
                    <div className="mt-16">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Similar Vehicles</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {relatedCars.map((relatedCar) => (
                                <Link
                                    key={relatedCar.id}
                                    to={`/vehicles/${relatedCar.id}`}
                                    className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all"
                                >
                                    <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
                                        <img
                                            src={relatedCar.mainImage || "/placeholder.svg"}
                                            alt={relatedCar.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-bold text-gray-900 mb-1">{relatedCar.name}</h3>
                                        <div className="flex items-center justify-between">
                                            <span className="text-lg font-bold text-gray-900">
                                                Ksh {relatedCar.dailyPrice.toLocaleString()}
                                                <span className="text-sm text-gray-500 font-normal">/day</span>
                                            </span>
                                            <div className="flex items-center gap-1">
                                                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                                <span className="text-sm font-medium">{relatedCar.rating}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
}

// Mini Calendar Component
interface MiniCalendarProps {
    currentMonth: Date;
    setCurrentMonth: (date: Date) => void;
    selectedDates: { start: Date | null; end: Date | null };
    setSelectedDates: (dates: { start: Date | null; end: Date | null }) => void;
}

function MiniCalendar({ currentMonth, setCurrentMonth, selectedDates, setSelectedDates }: MiniCalendarProps) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const daysInMonth = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1,
        0
    ).getDate();

    const firstDayOfMonth = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        1
    ).getDay();

    const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const handlePrevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    const handleDateClick = (day: number) => {
        const clickedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        
        if (clickedDate < today) return;

        if (!selectedDates.start || (selectedDates.start && selectedDates.end)) {
            setSelectedDates({ start: clickedDate, end: null });
        } else {
            if (clickedDate < selectedDates.start) {
                setSelectedDates({ start: clickedDate, end: selectedDates.start });
            } else {
                setSelectedDates({ ...selectedDates, end: clickedDate });
            }
        }
    };

    const isSelected = (day: number) => {
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        if (selectedDates.start && date.getTime() === selectedDates.start.getTime()) return true;
        if (selectedDates.end && date.getTime() === selectedDates.end.getTime()) return true;
        return false;
    };

    const isInRange = (day: number) => {
        if (!selectedDates.start || !selectedDates.end) return false;
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        return date > selectedDates.start && date < selectedDates.end;
    };

    const isPast = (day: number) => {
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        return date < today;
    };

    return (
        <div className="border border-gray-200 rounded-xl p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={handlePrevMonth}
                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <span className="font-medium text-gray-900">{monthName}</span>
                <button
                    onClick={handleNextMonth}
                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
            </div>

            {/* Day Names */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                    <div key={day} className="text-center text-xs text-gray-500 py-1">
                        {day}
                    </div>
                ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1">
                {/* Empty cells for days before the first day */}
                {Array.from({ length: firstDayOfMonth }).map((_, index) => (
                    <div key={`empty-${index}`} className="h-8" />
                ))}
                
                {/* Days of the month */}
                {Array.from({ length: daysInMonth }).map((_, index) => {
                    const day = index + 1;
                    const past = isPast(day);
                    const selected = isSelected(day);
                    const inRange = isInRange(day);

                    return (
                        <button
                            key={day}
                            onClick={() => handleDateClick(day)}
                            disabled={past}
                            className={`h-8 text-sm rounded-lg transition-all ${
                                past
                                    ? "text-gray-300 cursor-not-allowed"
                                    : selected
                                    ? "bg-black text-white font-medium"
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

