import { useState, useMemo, useEffect } from "react";
import { useParams, Link, useNavigate, useSearchParams } from "react-router-dom";
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
import { Car } from "../data/cars";
import { getImageUrl } from "../lib/ImageUtils";
import { carService } from "../services/carService";
import { CarDetailsModal } from "../components/CarDetailsModal";
import {
    getAvailabilityBadgeLabel,
    formatTimeRemaining,
    getAvailabilityClassName,
    getAvailabilityMessage,
    getCarAvailabilityStatus,
    isCarBookable,
} from "../lib/carAvailability.ts";
import {
    BOOKING_LOCATIONS,
    parseBookingLocationIdParam,
    resolveBookingLocationIdByQuery,
} from "../constants/bookingLocations.ts";

const parseDateFromQuery = (value: string | null): Date | null => {
    if (!value) {
        return null;
    }

    const dateOnlyMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (dateOnlyMatch) {
        const year = Number(dateOnlyMatch[1]);
        const month = Number(dateOnlyMatch[2]);
        const day = Number(dateOnlyMatch[3]);
        const parsedDate = new Date(year, month - 1, day);
        parsedDate.setHours(0, 0, 0, 0);
        return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
    }

    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) {
        return null;
    }

    parsedDate.setHours(0, 0, 0, 0);
    return parsedDate;
};

const BOOKING_CONTEXT_QUERY_KEYS = [
    "pickupDate",
    "dropoffDate",
    "pickup",
    "dropoff",
    "pickupLocation",
    "dropoffLocation",
    "pickupLocationId",
    "dropoffLocationId",
    "sameLocation",
] as const;

export default function VehicleDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const defaultLocationId = BOOKING_LOCATIONS[0]?.id ?? 1;
    const queryPickupDate = parseDateFromQuery(searchParams.get("pickupDate"));
    const queryDropoffDate = parseDateFromQuery(searchParams.get("dropoffDate"));
    const queryPickupLocationId =
        parseBookingLocationIdParam(searchParams.get("pickupLocationId"))
        ?? resolveBookingLocationIdByQuery(searchParams.get("pickup") ?? searchParams.get("pickupLocation"));
    const querySameLocationParam = searchParams.get("sameLocation");
    const initialSameLocation = querySameLocationParam
        ? !["false", "0"].includes(querySameLocationParam.toLowerCase())
        : true;
    const queryDropoffLocationId =
        parseBookingLocationIdParam(searchParams.get("dropoffLocationId"))
        ?? resolveBookingLocationIdByQuery(searchParams.get("dropoff") ?? searchParams.get("dropoffLocation"));
    const initialPickupLocationId = queryPickupLocationId ?? defaultLocationId;
    const initialDropoffLocationId = initialSameLocation
        ? initialPickupLocationId
        : (queryDropoffLocationId ?? initialPickupLocationId);
    const hasQueryLocationContext = queryPickupLocationId !== null || queryDropoffLocationId !== null;

    // ✅ ALL STATE DECLARED FIRST - BEFORE ANY CONDITIONAL RETURNS
    const [car, setCar] = useState<Car | null>(null);
    const [fleetCars, setFleetCars] = useState<Car[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [selectedDates, setSelectedDates] = useState<{ start: Date | null; end: Date | null }>({
        start: queryPickupDate,
        end: queryDropoffDate
    });
    const [currentMonth, setCurrentMonth] = useState(queryPickupDate ?? new Date());
    const [quickViewCar, setQuickViewCar] = useState<Car | null>(null);
    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
    const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
    const [pickupLocationId, setPickupLocationId] = useState(initialPickupLocationId);
    const [dropoffLocationId, setDropoffLocationId] = useState(initialDropoffLocationId);
    const [sameLocation, setSameLocation] = useState(initialSameLocation);
    const currentCarId = car?.id ?? null;
    const currentCarLocation = car?.location ?? "";

    // Fetch car data on mount
    useEffect(() => {
        const fetchCar = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const carId = Number(id);
                if (Number.isNaN(carId)) {
                    setCar(null);
                    setError("Invalid vehicle ID.");
                    return;
                }

                const fetchedCar = await carService.getById(carId);
                setCar(fetchedCar);

                try {
                    const fetchedCars = await carService.getAll();
                    setFleetCars(fetchedCars);
                } catch (fleetError) {
                    console.error("Failed to fetch related fleet cars:", fleetError);
                    setFleetCars([]);
                }
            } catch (error) {
                console.error("Failed to fetch car:", error);
                setCar(null);
                setFleetCars([]);
                setError("Failed to load vehicle details.");
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

    useEffect(() => {
        if (!currentCarId) {
            return;
        }

        if (hasQueryLocationContext) {
            return;
        }

        const matchedLocationId = resolveBookingLocationIdByQuery(currentCarLocation) ?? defaultLocationId;
        setPickupLocationId(matchedLocationId);
        setDropoffLocationId(matchedLocationId);
    }, [currentCarId, currentCarLocation, defaultLocationId, hasQueryLocationContext]);

    useEffect(() => {
        if (sameLocation) {
            setDropoffLocationId(pickupLocationId);
        }
    }, [sameLocation, pickupLocationId]);

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
            return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
        }
        return 0;
    }, [selectedDates]);

    const totalPrice = car ? rentalDays * car.dailyPrice : 0;
    const serviceFee = Math.round(totalPrice * 0.1);
    const insuranceFee = rentalDays * 500;
    const availabilityStatus = car ? getCarAvailabilityStatus(car) : "available";
    const availabilityMessage = car ? getAvailabilityMessage(car) : "";
    const carCanBeBooked = car ? isCarBookable(car) : false;

    const [availabilityTick, setAvailabilityTick] = useState(0);
    const softLockCountdownLabel = useMemo(() => {
        void availabilityTick;
        if (!car?.softLockExpiresAt) {
            return null;
        }
        return formatTimeRemaining(car.softLockExpiresAt);
    }, [car?.softLockExpiresAt, availabilityTick]);

    useEffect(() => {
        if (!car?.softLockExpiresAt || availabilityStatus !== "soft_locked") {
            return;
        }

        const timer = window.setInterval(() => {
            setAvailabilityTick((value) => value + 1);
        }, 1000);

        return () => window.clearInterval(timer);
    }, [car?.softLockExpiresAt, availabilityStatus]);

    useEffect(() => {
        if (carCanBeBooked) {
            return;
        }
        setSelectedDates({ start: null, end: null });
    }, [carCanBeBooked]);

    // Related cars (same body type, excluding current)
    const relatedCars = useMemo(() => {
        if (!car) return [];
        return fleetCars
            .filter((candidate) => candidate.bodyType === car.bodyType && candidate.id !== car.id)
            .slice(0, 3);
    }, [car, fleetCars]);

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

    const activeGalleryImage = images[currentImageIndex] ?? {
        id: -1,
        url: car?.mainImageUrl ?? "/placeholder-car.jpg",
        alt: car?.name ?? "Vehicle image",
    };
    const galleryCurrentLabel = String(
        Math.min(Math.max(currentImageIndex + 1, 1), Math.max(images.length, 1))
    ).padStart(2, "0");
    const galleryTotalLabel = String(Math.max(images.length, 1)).padStart(2, "0");
    const galleryHeading = (car?.name ?? "Vehicle Gallery").toUpperCase();
    const galleryCaptionTitle =
        activeGalleryImage.alt?.trim() && activeGalleryImage.alt !== "Vehicle image"
            ? activeGalleryImage.alt
            : car
                ? `${car.make} ${car.model} ${car.year}`
                : "Vehicle";
    const rawGalleryCaptionText = car?.description?.trim() ?? "";
    const galleryCaptionText =
        rawGalleryCaptionText.length > 135
            ? `${rawGalleryCaptionText.slice(0, 132)}...`
            : rawGalleryCaptionText;
    const maxPreviewThumbs = 7;
    const previewThumbs = images.slice(0, maxPreviewThumbs);
    const overflowThumbCount = Math.max(images.length - maxPreviewThumbs, 0);
    const buildVehicleDetailsPath = (vehicleId: number): string => {
        const params = new URLSearchParams();

        BOOKING_CONTEXT_QUERY_KEYS.forEach((key) => {
            const value = searchParams.get(key);
            if (!value) {
                return;
            }
            params.set(key, value);
        });

        const queryString = params.toString();
        return queryString ? `/vehicles/${vehicleId}?${queryString}` : `/vehicles/${vehicleId}`;
    };

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
                        <p className="text-yellow-800 text-sm">{error}</p>
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

            <header className="group relative h-[44vh] min-h-[300px] overflow-hidden md:h-[48vh] md:min-h-[320px]">
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
                            className="absolute left-3 top-[42%] z-20 h-9 w-9 -translate-y-1/2 rounded-full bg-white/25 text-white backdrop-blur-md transition-all hover:bg-white/40 sm:left-4 sm:top-1/2 md:opacity-0 md:group-hover:opacity-100"
                        >
                            <ChevronLeft className="mx-auto h-4 w-4" />
                        </button>
                        <button
                            onClick={handleNextImage}
                            className="absolute right-3 top-[42%] z-20 h-9 w-9 -translate-y-1/2 rounded-full bg-white/25 text-white backdrop-blur-md transition-all hover:bg-white/40 sm:right-4 sm:top-1/2 md:opacity-0 md:group-hover:opacity-100"
                        >
                            <ChevronRight className="mx-auto h-4 w-4" />
                        </button>
                    </>
                )}

                {images.length > 1 && (
                    <div className="absolute bottom-24 left-0 right-0 z-10 flex justify-center gap-2 md:bottom-20">
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

                <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 pb-5 pt-12">
                    <div className="layout-container flex flex-col items-start justify-between gap-3 md:flex-row md:items-end">
                        <div>
                            <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-white/90">
                                <span className="px-3 py-1 rounded-full bg-black/35 border border-white/30 backdrop-blur text-[11px] font-semibold uppercase tracking-wide text-white">
                                    {car.bodyType}
                                </span>
                                <span className={`px-3 py-1 rounded-full border border-white/20 text-[11px] font-semibold uppercase tracking-wide ${getAvailabilityClassName(availabilityStatus)}`}>
                                    {getAvailabilityBadgeLabel(car, softLockCountdownLabel)}
                                </span>
                                <div className="flex items-center gap-0.5">
                                    {Array.from({ length: 5 }).map((_, idx) => (
                                        <Star key={`hero-star-${idx}`} className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                    ))}
                                </div>
                                <span className="text-xs text-white/85">({car.reviewCount} reviews)</span>
                            </div>
                            <h1 className="mb-1 text-2xl font-bold leading-tight text-white md:text-4xl">{car.name}</h1>
                            <p className="text-sm italic text-white/80 md:text-base">Experience power and elegance redefined.</p>
                            <div className="mt-2 text-left md:hidden">
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
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${getAvailabilityClassName(availabilityStatus)}`}>
                                            {getAvailabilityBadgeLabel(car, softLockCountdownLabel)}
                                        </span>
                                    </div>

                                    {!carCanBeBooked && (
                                        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
                                            <p className="text-sm font-medium text-amber-900">{availabilityMessage}</p>
                                            {availabilityStatus === "soft_locked" && softLockCountdownLabel && (
                                                <p className="mt-1 text-xs font-semibold text-amber-800">
                                                    Next availability in {softLockCountdownLabel}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    <div className="mb-4 space-y-2.5">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                                Pick-up Location
                                            </label>
                                            <select
                                                value={pickupLocationId}
                                                onChange={(event) => {
                                                    const nextLocationId = Number(event.target.value);
                                                    setPickupLocationId(nextLocationId);
                                                    if (sameLocation) {
                                                        setDropoffLocationId(nextLocationId);
                                                    }
                                                }}
                                                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                                            >
                                                {BOOKING_LOCATIONS.map((location) => (
                                                    <option key={location.id} value={location.id}>
                                                        {location.name} - {location.address}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="mb-2 flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={sameLocation}
                                                    onChange={(event) => {
                                                        setSameLocation(event.target.checked);
                                                        if (event.target.checked) {
                                                            setDropoffLocationId(pickupLocationId);
                                                        }
                                                    }}
                                                    className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                                                />
                                                <span className="text-sm text-gray-700">Return to same location</span>
                                            </label>
                                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                                Drop-off Location
                                            </label>
                                            <select
                                                value={dropoffLocationId}
                                                onChange={(event) => setDropoffLocationId(Number(event.target.value))}
                                                disabled={sameLocation}
                                                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900/10 disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                {BOOKING_LOCATIONS.map((location) => (
                                                    <option key={location.id} value={location.id}>
                                                        {location.name} - {location.address}
                                                    </option>
                                                ))}
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
                                            disabled={!carCanBeBooked}
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
                                            if (!carCanBeBooked) {
                                                return;
                                            }
                                            const params = new URLSearchParams();
                                            params.set("carId", car.id.toString());
                                            if (selectedDates.start) {
                                                params.set("pickupDate", selectedDates.start.toISOString());
                                            }
                                            if (selectedDates.end) {
                                                params.set("dropoffDate", selectedDates.end.toISOString());
                                            }
                                            params.set("pickupLocationId", pickupLocationId.toString());
                                            params.set("sameLocation", String(sameLocation));
                                            if (!sameLocation) {
                                                params.set("dropoffLocationId", dropoffLocationId.toString());
                                            }
                                            navigate(`/booking?${params.toString()}`);
                                        }}
                                        disabled={rentalDays === 0 || !carCanBeBooked}
                                        className={`w-full rounded-lg py-3 font-semibold transition-all ${
                                            rentalDays > 0 && carCanBeBooked
                                                ? "bg-black text-white hover:bg-zinc-800"
                                                : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                        }`}
                                    >
                                        {!carCanBeBooked
                                            ? "Currently unavailable"
                                            : rentalDays > 0
                                                ? "Proceed to Booking"
                                                : "Select dates to book"}
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
                    className="fixed inset-0 z-[80] bg-[#02050c]/90 backdrop-blur-xl"
                    onClick={closeGalleryModal}
                >
                    <div
                        className="relative mx-auto flex h-full w-full max-w-[1240px] items-center justify-center px-3 py-5 sm:px-5 md:px-8"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="relative w-full overflow-hidden rounded-[30px] border border-[#302a18] bg-gradient-to-br from-[#060b16] via-[#050915] to-[#080d19] p-3 shadow-[0_34px_110px_rgba(0,0,0,0.7)] sm:p-5">
                            <div className="pointer-events-none absolute inset-2 rounded-[24px] border border-[#41361b]/60" />

                            <div className="relative z-10 flex items-center justify-between gap-3 px-1 py-1 sm:px-2">
                                <p className="min-w-[76px] text-sm font-semibold tracking-[0.18em]">
                                    <span className="text-[#d8b34f]">{galleryCurrentLabel}</span>
                                    <span className="text-white/35"> / {galleryTotalLabel}</span>
                                </p>

                                <h3 className="flex-1 truncate text-center text-[11px] uppercase tracking-[0.36em] text-white/85 sm:text-sm md:text-base">
                                    {galleryHeading}
                                </h3>

                                <button
                                    onClick={closeGalleryModal}
                                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/85 transition-colors hover:bg-white/15"
                                    aria-label="Close gallery"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="relative z-10 mt-3 sm:mt-4">
                                {images.length > 1 && (
                                    <button
                                        onClick={handlePrevImage}
                                        className="absolute left-1 top-1/2 z-20 h-11 w-11 -translate-y-1/2 rounded-full border border-white/20 bg-black/45 text-white backdrop-blur transition-colors hover:bg-black/65 sm:left-2"
                                        aria-label="Previous image"
                                    >
                                        <ChevronLeft className="mx-auto h-5 w-5" />
                                    </button>
                                )}

                                {images.length > 1 && (
                                    <button
                                        onClick={handleNextImage}
                                        className="absolute right-1 top-1/2 z-20 h-11 w-11 -translate-y-1/2 rounded-full border border-white/20 bg-black/45 text-white backdrop-blur transition-colors hover:bg-black/65 sm:right-2"
                                        aria-label="Next image"
                                    >
                                        <ChevronRight className="mx-auto h-5 w-5" />
                                    </button>
                                )}

                                <div className="relative mx-auto aspect-[16/10] w-full max-w-[980px] overflow-hidden rounded-[20px] border border-[#6f5a22]/55 bg-[#070c14]">
                                    <img
                                        src={getImageUrl(activeGalleryImage.url)}
                                        alt=""
                                        aria-hidden="true"
                                        className="absolute inset-0 h-full w-full scale-110 object-cover opacity-45 blur-2xl"
                                        onError={(e) => {
                                            e.currentTarget.src = "/placeholder-car.jpg";
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/40" />
                                    <img
                                        src={getImageUrl(activeGalleryImage.url)}
                                        alt={activeGalleryImage.alt}
                                        className="relative z-10 h-full w-full object-contain p-2 sm:p-3 md:p-4"
                                        onError={(e) => {
                                            e.currentTarget.src = "/placeholder-car.jpg";
                                        }}
                                    />

                                    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/75 via-black/40 to-transparent px-4 pb-4 pt-12 text-center sm:px-8 sm:pb-6">
                                        <p className="text-lg font-semibold text-white sm:text-2xl">
                                            {galleryCaptionTitle}
                                        </p>
                                        {galleryCaptionText && (
                                            <p className="mt-1 text-xs text-white/70 sm:text-base">
                                                {galleryCaptionText}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="relative z-10 mx-auto mt-4 w-full max-w-[1030px] rounded-[18px] border border-white/10 bg-[#060b14]/90 px-3 py-2 sm:px-4 sm:py-3">
                                <div className="flex items-center justify-center gap-2 overflow-x-auto pb-1">
                                    {previewThumbs.map((img, index) => (
                                        <button
                                            key={`modal-thumb-${img.id}`}
                                            onClick={() => setCurrentImageIndex(index)}
                                            className={`relative h-12 w-16 flex-shrink-0 overflow-hidden rounded-xl border transition-all sm:h-14 sm:w-20 ${
                                                currentImageIndex === index
                                                    ? "border-[#d8b34f] ring-1 ring-[#d8b34f]/60"
                                                    : "border-white/15 opacity-80 hover:border-white/35 hover:opacity-100"
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

                                    {overflowThumbCount > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => setCurrentImageIndex(maxPreviewThumbs)}
                                            className={`h-12 min-w-[64px] flex-shrink-0 rounded-xl border text-sm font-semibold tracking-wide transition-all sm:h-14 sm:min-w-[80px] ${
                                                currentImageIndex >= maxPreviewThumbs
                                                    ? "border-[#d8b34f] bg-[#d8b34f]/20 text-[#e4c56f]"
                                                    : "border-white/15 bg-white/5 text-white/75 hover:border-white/35"
                                            }`}
                                        >
                                            +{overflowThumbCount}
                                        </button>
                                    )}
                                </div>
                            </div>
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
                                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md"
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
                                    <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-semibold border border-white/30 ${getAvailabilityClassName(getCarAvailabilityStatus(relatedCar))}`}>
                                        {getAvailabilityBadgeLabel(relatedCar)}
                                    </span>
                                </div>

                                <div className="flex flex-1 flex-col p-4">
                                    <h3 className="font-bold text-gray-900 mb-1">{relatedCar.name}</h3>
                                    <p className="text-xs text-gray-500 mb-4">
                                        {relatedCar.year} Model • {relatedCar.transmission}
                                    </p>

                                    <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-3">
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
                                                onClick={() => navigate(buildVehicleDetailsPath(relatedCar.id))}
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
                        navigate(buildVehicleDetailsPath(c.id));
                    }}
                    onViewDetails={(c) => {
                        setIsQuickViewOpen(false);
                        navigate(buildVehicleDetailsPath(c.id));
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
    disabled?: boolean;
}

function MiniCalendar({
    currentMonth,
    setCurrentMonth,
    selectedDates,
    setSelectedDates,
    disabled = false,
}: MiniCalendarProps) {
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
        if (disabled) {
            return;
        }

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
                            disabled={past || disabled}
                            className={`h-7 text-xs rounded-lg transition-all ${
                                past || disabled
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
