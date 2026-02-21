import { useState, useMemo, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
    ChevronLeft,
    ChevronRight,
    Star,
    Users,
    Settings,
    Fuel,
    Gauge,
    CheckCircle2,
    Calendar,
    Clock,
    ArrowLeft,
    X
} from "lucide-react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Car, CARS_DATA } from "../data/cars";
import { getImageUrl } from "../lib/ImageUtils";
import { carService } from "../services/carService";
import { CarDetailsModal } from "../components/CarDetailsModal";

export default function VehicleDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // ✅ ALL STATE DECLARED FIRST - BEFORE ANY CONDITIONAL RETURNS
    const [car, setCar] = useState<Car | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [selectedDates, setSelectedDates] = useState<{ start: Date | null; end: Date | null }>({
        start: null,
        end: null
    });
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [quickViewCar, setQuickViewCar] = useState<Car | null>(null);
    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
    const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);

    // Fetch car data on mount
    useEffect(() => {
        const fetchCar = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const carId = Number(id);
                
                // Check if it's a mock/featured car (IDs >= 9000) first
                if (carId >= 9000) {
                    const mockCar = CARS_DATA.find(c => c.id === carId);
                    if (mockCar) {
                        setCar(mockCar);
                        setIsLoading(false);
                        return;
                    }
                }

                // Try backend first
                try {
                    const fetchedCar = await carService.getById(carId);
                    setCar(fetchedCar);
                } catch (backendError) {
                    // If backend fails, try mock data
                    const fallbackCar = CARS_DATA.find(c => c.id === carId);
                    if (fallbackCar) {
                        setCar(fallbackCar);
                    } else {
                        throw backendError;
                    }
                }
            } catch (error) {
                console.error("Failed to fetch car:", error);
                setError("Failed to load vehicle details");
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchCar();
        }
    }, [id]);

    // Prepare images for gallery (useMemo to avoid recalculating)
    const images = useMemo(() => {
        if (!car) return [];
        return car.gallery.length > 0
            ? car.gallery
            : [{ id: 1, url: car.mainImageUrl, alt: car.name }];
    }, [car]);

    useEffect(() => {
        setCurrentImageIndex(0);
    }, [car?.id]);

    // Image navigation handlers
    const handlePrevImage = () => {
        setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const handleNextImage = () => {
        setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    const openGalleryModal = (index: number) => {
        setCurrentImageIndex(index);
        setIsGalleryModalOpen(true);
    };

    const closeGalleryModal = () => {
        setIsGalleryModalOpen(false);
    };

    useEffect(() => {
        if (images.length <= 1 || isGalleryModalOpen) return;

        const timer = window.setInterval(() => {
            setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
        }, 4500);

        return () => window.clearInterval(timer);
    }, [images.length, isGalleryModalOpen]);

    useEffect(() => {
        if (!isGalleryModalOpen) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsGalleryModalOpen(false);
                return;
            }

            if (images.length <= 1) return;

            if (event.key === "ArrowLeft") {
                setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
            }

            if (event.key === "ArrowRight") {
                setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isGalleryModalOpen, images.length]);

    // Calculate rental duration and total
    const rentalDays = useMemo(() => {
        if (selectedDates.start && selectedDates.end) {
            const diff = selectedDates.end.getTime() - selectedDates.start.getTime();
            return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
        }
        return 0;
    }, [selectedDates]);

    const totalPrice = car ? rentalDays * car.dailyPrice : 0;
    const serviceFee = Math.round(totalPrice * 0.1);
    const insuranceFee = rentalDays * 500;

    // Related cars (same body type, excluding current)
    const relatedCars = useMemo(() => {
        if (!car) return [];
        return CARS_DATA.filter(c => c.bodyType === car.bodyType && c.id !== car.id).slice(0, 3);
    }, [car]);

    const toModalCar = (c: Car) => ({
        id: c.id,
        name: c.name,
        dailyPrice: c.dailyPrice,
        mainImageUrl: c.mainImageUrl,
        gallery: c.gallery?.map(g => g.url) ?? [c.mainImageUrl],
        specs: {
            mileage: c.mileage,
            transmission: c.transmission,
            capacity: `${c.seatingCapacity} Person`,
            fuel: c.fuelType,
        },
        description: c.description,
        features: c.features?.map(f => f.name),
        rating: c.rating,
        reviewCount: c.reviewCount,
    });

    // ✅ NOW CONDITIONAL RETURNS ARE SAFE - ALL HOOKS CALLED
    // Loading state
    if (isLoading) {
        return (
            <div className="bg-gray-50">
                <Navbar />
                <div className="flex items-center justify-center px-4 pb-12 pt-16 md:pb-14 md:pt-20">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-gray-600">Loading vehicle details...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Not found state
    if (!car) {
        return (
            <div className="bg-gray-50">
                <Navbar />
                <div className="flex items-center justify-center px-4 pb-12 pt-16 md:pb-14 md:pt-20">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">Vehicle not found</h1>
                        <p className="text-gray-600 mb-6">
                            The vehicle you're looking for doesn't exist or has been removed.
                        </p>
                        <Link
                            to="/vehicles"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl font-medium hover:bg-zinc-800 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to vehicles
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50">
            <Navbar />

            {error && (
                <div className="bg-yellow-50 border-b border-yellow-200">
                    <div className="layout-container py-3">
                        <p className="text-yellow-800 text-sm">{error} - Showing cached data</p>
                    </div>
                </div>
            )}

            <div className="border-b border-gray-100 bg-white pt-16 md:pt-20">
                <div className="layout-container py-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm font-medium">Back to vehicles</span>
                    </button>
                </div>
            </div>

            <header className="group relative h-[42vh] min-h-[280px] overflow-hidden md:h-[48vh] md:min-h-[320px]">
                {images.map((img, index) => (
                    <img
                        key={`hero-${img.id}`}
                        src={getImageUrl(img.url)}
                        alt={img.alt}
                        className={`absolute inset-0 h-full w-full cursor-zoom-in object-cover transition-opacity duration-700 ${
                            index === currentImageIndex ? "opacity-100" : "opacity-0"
                        }`}
                        onClick={() => openGalleryModal(index)}
                        onError={(e) => {
                            e.currentTarget.src = "/placeholder-car.jpg";
                        }}
                    />
                ))}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/10" />

                {images.length > 1 && (
                    <>
                        <button
                            onClick={handlePrevImage}
                            className="absolute left-4 top-1/2 z-10 h-9 w-9 -translate-y-1/2 rounded-full bg-white/25 text-white backdrop-blur-md transition-all hover:bg-white/40 md:opacity-0 md:group-hover:opacity-100"
                        >
                            <ChevronLeft className="mx-auto h-4 w-4" />
                        </button>
                        <button
                            onClick={handleNextImage}
                            className="absolute right-4 top-1/2 z-10 h-9 w-9 -translate-y-1/2 rounded-full bg-white/25 text-white backdrop-blur-md transition-all hover:bg-white/40 md:opacity-0 md:group-hover:opacity-100"
                        >
                            <ChevronRight className="mx-auto h-4 w-4" />
                        </button>
                    </>
                )}

                {images.length > 1 && (
                    <div className="absolute bottom-16 left-0 right-0 z-10 flex justify-center gap-2 md:bottom-20">
                        {images.map((img, index) => (
                            <button
                                key={`hero-dot-${img.id}`}
                                onClick={() => setCurrentImageIndex(index)}
                                className={`h-2 rounded-full transition-all ${
                                    index === currentImageIndex ? "w-6 bg-white/90" : "w-2 bg-white/50"
                                }`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 z-10 pb-5 pt-10">
                    <div className="layout-container flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
                        <div>
                            <div className="mb-2 flex items-center gap-2 text-sm text-white/90">
                                <span className="px-3 py-1 rounded-full bg-black/35 border border-white/30 backdrop-blur text-[11px] font-semibold uppercase tracking-wide text-white">
                                    {car.bodyType}
                                </span>
                                <div className="flex items-center gap-0.5">
                                    {Array.from({ length: 5 }).map((_, idx) => (
                                        <Star key={`hero-star-${idx}`} className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                    ))}
                                </div>
                                <span className="text-xs text-white/85">({car.reviewCount} Reviews)</span>
                            </div>
                            <h1 className="mb-1 text-2xl font-bold text-white md:text-4xl">{car.name}</h1>
                            <p className="text-sm italic text-white/80 md:text-base">Experience power and elegance redefined.</p>
                            <div className="mt-3 text-left md:hidden">
                                <p className="text-xs text-white/70">Starting from</p>
                                <p className="text-xl font-bold text-white">
                                    Ksh {car.dailyPrice.toLocaleString()}
                                    <span className="ml-1 text-sm font-normal text-white/75">/ day</span>
                                </p>
                            </div>
                        </div>

                        <div className="text-right hidden md:block">
                            <p className="text-sm text-white/75 mb-1">Starting from</p>
                            <p className="text-2xl font-bold text-white">
                                Ksh {car.dailyPrice.toLocaleString()}{" "}
                                <span className="text-base font-normal text-white/75">/ day</span>
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="layout-container py-4 md:py-5">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <div className="space-y-4 md:space-y-5 lg:col-span-2">
                        <section className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                            {images.slice(0, Math.min(4, images.length)).map((img, index) => {
                                const isMoreTile = images.length > 4 && index === 3;
                                return (
                                    <button
                                        key={`thumb-${img.id}`}
                                        onClick={() => openGalleryModal(index)}
                                        className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                                            currentImageIndex === index
                                                ? "border-black"
                                                : "border-transparent hover:border-gray-300"
                                        }`}
                                    >
                                        <img
                                            src={getImageUrl(img.url)}
                                            alt={img.alt}
                                            className={`w-full h-full object-cover transition-transform duration-500 ${
                                                isMoreTile ? "opacity-60" : "hover:scale-105"
                                            }`}
                                            onError={(e) => {
                                                e.currentTarget.src = "/placeholder-car.jpg";
                                            }}
                                        />
                                        {isMoreTile && (
                                            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white bg-black/30">
                                                + {images.length - 3} Photos
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </section>

                            <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-5">
                                <h2 className="mb-3 text-base font-bold text-gray-900 md:text-lg">Vehicle Overview</h2>
                                <div className="space-y-3 text-sm leading-7 text-gray-600 md:text-[15px]">
                                    <p>{car.description}</p>
                                    <p>
                                        This {car.bodyType.toLowerCase()} offers {car.transmission.toLowerCase()} transmission,
                                        {` ${car.seatingCapacity}`} seats, and a refined {car.engineCapacity} engine setup,
                                        designed for both everyday comfort and premium travel.
                                    </p>
                                </div>
                            </section>

                            <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-5">
                                <h2 className="mb-3 text-base font-bold text-gray-900 md:text-lg">Technical Specifications</h2>
                                <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
                                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 text-center">
                                        <Users className="w-5 h-5 text-gray-500 mx-auto mb-2" />
                                        <p className="text-[11px] uppercase tracking-wide text-gray-500">Capacity</p>
                                        <p className="font-semibold text-gray-900">{car.seatingCapacity} Persons</p>
                                    </div>
                                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 text-center">
                                        <Settings className="w-5 h-5 text-gray-500 mx-auto mb-2" />
                                        <p className="text-[11px] uppercase tracking-wide text-gray-500">Transmission</p>
                                        <p className="font-semibold text-gray-900">{car.transmission}</p>
                                    </div>
                                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 text-center">
                                        <Fuel className="w-5 h-5 text-gray-500 mx-auto mb-2" />
                                        <p className="text-[11px] uppercase tracking-wide text-gray-500">Fuel Type</p>
                                        <p className="font-semibold text-gray-900">{car.fuelType}</p>
                                    </div>
                                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 text-center">
                                        <Gauge className="w-5 h-5 text-gray-500 mx-auto mb-2" />
                                        <p className="text-[11px] uppercase tracking-wide text-gray-500">Mileage</p>
                                        <p className="font-semibold text-gray-900">{car.mileage}</p>
                                    </div>
                                </div>
                            </section>

                            <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-5">
                                <h2 className="mb-3 text-base font-bold text-gray-900 md:text-lg">Features & Amenities</h2>
                                {car.features && car.features.length > 0 ? (
                                    <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
                                        {car.features.map((feature, index) => (
                                            <div
                                                key={index}
                                                className={`flex items-center gap-3 rounded-lg border p-2.5 ${
                                                    feature.available
                                                        ? "bg-emerald-50 border-emerald-100"
                                                        : "bg-gray-50 border-gray-200"
                                                }`}
                                            >
                                                <CheckCircle2
                                                    className={`w-5 h-5 flex-shrink-0 ${
                                                        feature.available ? "text-emerald-500" : "text-gray-300"
                                                    }`}
                                                />
                                                <span className={feature.available ? "text-gray-900" : "text-gray-400"}>
                                                    {feature.name}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <p>No features listed for this vehicle.</p>
                                    </div>
                                )}
                            </section>

                            <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-5">
                                <div className="mb-3 flex items-center justify-between">
                                    <h2 className="text-base font-bold text-gray-900 md:text-lg">Customer Reviews</h2>
                                    <span className="text-xs text-gray-500 md:text-sm">View all {car.reviewCount} reviews</span>
                                </div>

                                <div className="space-y-3">
                                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-3.5">
                                        <div className="flex items-start justify-between gap-3 mb-3">
                                            <div>
                                                <p className="font-semibold text-gray-900">James Mwangi</p>
                                                <p className="text-xs text-gray-500">Recent renter</p>
                                            </div>
                                            <div className="flex items-center gap-0.5">
                                                {Array.from({ length: 5 }).map((_, idx) => (
                                                    <Star key={`review-1-${idx}`} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            The {car.name} was in excellent condition and exactly as listed. Smooth booking,
                                            clean vehicle, and great support throughout the trip.
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-3.5">
                                        <div className="flex items-start justify-between gap-3 mb-3">
                                            <div>
                                                <p className="font-semibold text-gray-900">Sarah Achieng</p>
                                                <p className="text-xs text-gray-500">Business rental</p>
                                            </div>
                                            <div className="flex items-center gap-0.5">
                                                {Array.from({ length: 4 }).map((_, idx) => (
                                                    <Star key={`review-2-${idx}`} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                                ))}
                                                <Star className="w-3.5 h-3.5 text-gray-300" />
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            Very comfortable interior and responsive handling. Perfect for city and highway
                                            travel. I would definitely book this vehicle again.
                                        </p>
                                    </div>
                                </div>
                            </section>
                        </div>

                        <aside className="lg:col-span-1">
                            <div className="sticky top-20 space-y-3.5">
                                <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                                    <div className="mb-4 flex items-start justify-between gap-3 border-b border-gray-100 pb-3.5">
                                        <div>
                                            <p className="text-sm text-gray-500">Daily Rate</p>
                                            <p className="text-xl font-bold text-gray-900">
                                                Ksh {car.dailyPrice.toLocaleString()}
                                            </p>
                                        </div>
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-semibold">
                                            Available
                                        </span>
                                    </div>

                                    <div className="mb-4 space-y-2.5">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                                Pick-up Location
                                            </label>
                                            <select className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900/10">
                                                <option>{car.location}</option>
                                                <option>Nairobi, Westlands</option>
                                                <option>Nairobi, JKIA Airport</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                                Drop-off Location
                                            </label>
                                            <select className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900/10">
                                                <option>Return to same location</option>
                                                <option>Nairobi, Westlands</option>
                                                <option>Nairobi, JKIA Airport</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="mb-4">
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

                                    <details className="mb-4 rounded-lg border border-gray-100 bg-gray-50 p-3">
                                        <summary className="cursor-pointer text-sm font-medium text-gray-800">
                                            Add Extras
                                        </summary>
                                        <div className="mt-3 space-y-2 text-sm text-gray-600">
                                            <label className="flex items-center justify-between">
                                                <span>Chauffeur Service</span>
                                                <span>+ Ksh 3,000</span>
                                            </label>
                                            <label className="flex items-center justify-between">
                                                <span>Child Seat</span>
                                                <span>+ Ksh 500</span>
                                            </label>
                                            <label className="flex items-center justify-between">
                                                <span>Premium Insurance</span>
                                                <span>+ Ksh 2,500</span>
                                            </label>
                                        </div>
                                    </details>

                                    {selectedDates.start && (
                                        <div className="mb-4 rounded-xl border border-gray-100 bg-gray-50 p-3">
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="text-gray-500">Pick-up</span>
                                                <span className="font-medium text-gray-900">
                                                    {selectedDates.start.toLocaleDateString("en-US", {
                                                        weekday: "short",
                                                        month: "short",
                                                        day: "numeric",
                                                    })}
                                                </span>
                                            </div>
                                            {selectedDates.end && (
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500">Return</span>
                                                    <span className="font-medium text-gray-900">
                                                        {selectedDates.end.toLocaleDateString("en-US", {
                                                            weekday: "short",
                                                            month: "short",
                                                            day: "numeric",
                                                        })}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {rentalDays > 0 && (
                                        <div className="mb-4 space-y-2.5 border-t border-gray-100 pt-3">
                                            <div className="flex justify-between text-sm text-gray-600">
                                                <span>
                                                    Ksh {car.dailyPrice.toLocaleString()} × {rentalDays} days
                                                </span>
                                                <span className="font-medium text-gray-900">
                                                    Ksh {totalPrice.toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm text-gray-600">
                                                <span>Service fee</span>
                                                <span className="font-medium text-gray-900">
                                                    Ksh {serviceFee.toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm text-gray-600">
                                                <span>Insurance</span>
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
                                        className={`w-full rounded-lg py-3 font-semibold transition-all ${
                                            rentalDays > 0
                                                ? "bg-black text-white hover:bg-zinc-800"
                                                : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                        }`}
                                    >
                                        {rentalDays > 0 ? "Proceed to Booking" : "Select dates to book"}
                                    </button>

                                    <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-gray-500">
                                        <Clock className="w-3.5 h-3.5" />
                                        Free cancellation up to 24 hours before pickup
                                    </div>
                                </section>

                                <section className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3.5 shadow-sm">
                                    <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-semibold">
                                        GZ
                                    </div>
                                    <div>
                                        <p className="text-[11px] uppercase tracking-wide text-gray-500">Managed by</p>
                                        <p className="font-semibold text-gray-900">GariZetu Fleet</p>
                                    </div>
                                </section>
                            </div>
                        </aside>
                </div>
            </div>

            {isGalleryModalOpen && (
                <div
                    className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-sm p-3 md:p-6"
                    onClick={closeGalleryModal}
                >
                    <div
                        className="mx-auto flex h-full w-full max-w-6xl flex-col"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="mb-3 flex items-center justify-between">
                            <p className="text-sm text-white/80">
                                {currentImageIndex + 1} / {images.length}
                            </p>
                            <button
                                onClick={closeGalleryModal}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25"
                                aria-label="Close gallery"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="relative flex min-h-0 flex-1 items-center justify-center rounded-xl bg-[#0a0a0a]">
                            <img
                                src={getImageUrl(images[currentImageIndex].url)}
                                alt={images[currentImageIndex].alt}
                                className="h-full w-full object-contain"
                                onError={(e) => {
                                    e.currentTarget.src = "/placeholder-car.jpg";
                                }}
                            />

                            {images.length > 1 && (
                                <>
                                    <button
                                        onClick={handlePrevImage}
                                        className="absolute left-3 top-1/2 z-10 h-10 w-10 -translate-y-1/2 rounded-full bg-white/20 text-white transition-colors hover:bg-white/35"
                                        aria-label="Previous image"
                                    >
                                        <ChevronLeft className="mx-auto h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={handleNextImage}
                                        className="absolute right-3 top-1/2 z-10 h-10 w-10 -translate-y-1/2 rounded-full bg-white/20 text-white transition-colors hover:bg-white/35"
                                        aria-label="Next image"
                                    >
                                        <ChevronRight className="mx-auto h-5 w-5" />
                                    </button>
                                </>
                            )}
                        </div>

                        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                            {images.map((img, index) => (
                                <button
                                    key={`modal-thumb-${img.id}`}
                                    onClick={() => setCurrentImageIndex(index)}
                                    className={`relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-md border-2 transition-colors ${
                                        currentImageIndex === index
                                            ? "border-white"
                                            : "border-transparent hover:border-white/50"
                                    }`}
                                >
                                    <img
                                        src={getImageUrl(img.url)}
                                        alt={img.alt}
                                        className="h-full w-full object-cover"
                                        onError={(e) => {
                                            e.currentTarget.src = "/placeholder-car.jpg";
                                        }}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {relatedCars.length > 0 && (
                <section className="layout-container pb-8 pt-6">
                    <div className="mb-4 flex items-end justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 md:text-2xl">Similar Vehicles</h2>
                            <p className="mt-1 text-sm text-gray-500">
                                Explore other premium options in this category
                            </p>
                        </div>
                        <div className="hidden md:flex items-center gap-2">
                            <span className="w-9 h-9 rounded-full border border-gray-300 inline-flex items-center justify-center text-gray-500">
                                <ChevronLeft className="w-4 h-4" />
                            </span>
                            <span className="w-9 h-9 rounded-full border border-gray-300 inline-flex items-center justify-center text-gray-500">
                                <ChevronRight className="w-4 h-4" />
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        {relatedCars.map((relatedCar) => (
                            <div
                                key={relatedCar.id}
                                className="group bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all"
                            >
                                <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                                    <img
                                        src={getImageUrl(relatedCar.mainImageUrl)}
                                        alt={relatedCar.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        onError={(e) => {
                                            e.currentTarget.src = "/placeholder-car.jpg";
                                        }}
                                    />
                                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/90 text-[11px] font-semibold text-gray-700 border border-gray-200">
                                        {relatedCar.bodyType}
                                    </span>
                                </div>

                                <div className="p-4">
                                    <h3 className="font-bold text-gray-900 mb-1">{relatedCar.name}</h3>
                                    <p className="text-xs text-gray-500 mb-4">
                                        {relatedCar.year} Model • {relatedCar.transmission}
                                    </p>

                                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                        <div>
                                            <p className="text-xs text-gray-500">Daily Rate</p>
                                            <p className="font-semibold text-gray-900">
                                                Ksh {relatedCar.dailyPrice.toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => {
                                                    setQuickViewCar(relatedCar);
                                                    setIsQuickViewOpen(true);
                                                }}
                                                className="px-3 py-2 rounded-full border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                            >
                                                Quick View
                                            </button>
                                            <button
                                                onClick={() => navigate(`/vehicles/${relatedCar.id}`)}
                                                className="px-3 py-2 rounded-full bg-black text-white text-xs font-medium hover:bg-zinc-800 transition-colors"
                                            >
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <Footer />

            {quickViewCar && (
                <CarDetailsModal
                    car={toModalCar(quickViewCar)}
                    isOpen={isQuickViewOpen}
                    onClose={() => setIsQuickViewOpen(false)}
                    onBookNow={(c) => {
                        setIsQuickViewOpen(false);
                        navigate(`/vehicles/${c.id}`);
                    }}
                    onViewDetails={(c) => {
                        setIsQuickViewOpen(false);
                        navigate(`/vehicles/${c.id}`);
                    }}
                />
            )}
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
        <div className="border border-gray-200 rounded-xl p-3">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <button
                    onClick={handlePrevMonth}
                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <span className="text-sm font-medium text-gray-900">{monthName}</span>
                <button
                    onClick={handleNextMonth}
                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
            </div>

            {/* Day Names */}
            <div className="grid grid-cols-7 gap-1 mb-1.5">
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
                    <div key={`empty-${index}`} className="h-7" />
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
                            className={`h-7 text-xs rounded-lg transition-all ${
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
