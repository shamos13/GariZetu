import { useMemo, useState } from "react";
import { X, ChevronLeft, ChevronRight, Users, Settings, Fuel, CheckCircle2, Gauge, Info } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
} from "./ui/dialog";
import { getImageUrl } from "../lib/ImageUtils";

interface CarData {
    id: number;
    name: string;
    price?: number; // Support legacy prop name
    dailyPrice?: number; // New prop name for parity with backend/customer cars
    image?: string;
    mainImageUrl?: string;
    gallery?: string[];
    specs: {
        mileage: string;
        transmission: string;
        capacity: string;
        fuel: string;
    };
    category?: string;
    description?: string;
    features?: string[];
    rating?: number;
    reviewCount?: number;
}

interface CarDetailsModalProps {
    car: CarData | null;
    isOpen: boolean;
    onClose: () => void;
    onBookNow?: (car: CarData) => void;
    onViewDetails?: (car: CarData) => void;
}

const getCarImages = (car: CarData) => {
    if (car.gallery && car.gallery.length > 0) {
        return car.gallery.map((url) => getImageUrl(url));
    }
    if (car.mainImageUrl) {
        return [getImageUrl(car.mainImageUrl)];
    }
    if (car.image) {
        return [getImageUrl(car.image)];
    }
    return ["/placeholder-car.jpg"];
};

const getCarFeatures = (car: CarData): string[] => {
    return car.features || [
        "Premium Cloth Seats",
        "Apple CarPlay & Android Auto",
        "Dual-Zone Climate Control",
        "Blind Spot Monitoring",
        "Rearview Camera",
        "Keyless Entry",
    ];
};

const getCarDescription = (car: CarData): string => {
    return car.description || `Experience the ${car.name} – a perfect blend of style, comfort, and performance for your journey.`;
};

const getCategory = (car: CarData): string => {
    return car.category || "Sedan";
};

export function CarDetailsModal({ car, isOpen, onClose, onBookNow, onViewDetails }: CarDetailsModalProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    if (!car) return null;

    const images = useMemo(() => getCarImages(car), [car]);
    const features = getCarFeatures(car);
    const description = getCarDescription(car);
    const category = getCategory(car);
    const pricePerDay = car.dailyPrice ?? car.price ?? 0;

    const handlePreviousImage = () => {
        setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const handleNextImage = () => {
        setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    const handleBookNow = () => {
        if (onBookNow) {
            onBookNow(car);
        }
    };

    const handleViewDetails = () => {
        if (onViewDetails) {
            onViewDetails(car);
        }
    };

    const seatCount = car.specs.capacity.replace(/[^0-9]/g, "") || "4";

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl w-[92vw] max-h-[90vh] p-0 gap-0 rounded-2xl overflow-hidden border-0 shadow-2xl">
                <DialogHeader className="sr-only">
                    <h2>{car.name}</h2>
                </DialogHeader>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 z-50 rounded-full bg-white/90 hover:bg-white text-gray-700 p-2 transition-all shadow-md hover:shadow-lg"
                    aria-label="Close modal"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="flex flex-col max-h-[90vh] overflow-hidden">
                    {/* Top - Image Section */}
                    <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0">
                        {/* Main Image */}
                        <div className="relative aspect-[16/9] lg:aspect-[21/9]">
                            <img
                                src={images[currentImageIndex]}
                                alt={car.name}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.currentTarget.src = "/placeholder-car.jpg"; }}
                            />

                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

                            {/* Navigation Arrows */}
                            {images.length > 1 && (
                                <>
                                    <button
                                        onClick={handlePreviousImage}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-1.5 transition-all shadow-md"
                                        aria-label="Previous image"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={handleNextImage}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-1.5 transition-all shadow-md"
                                        aria-label="Next image"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </>
                            )}

                            {/* Image Dots */}
                            {images.length > 1 && (
                                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/30 backdrop-blur-sm px-2.5 py-1.5 rounded-full">
                                    {images.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentImageIndex(index)}
                                            className={`w-1.5 h-1.5 rounded-full transition-all ${
                                                index === currentImageIndex
                                                    ? "bg-white w-4"
                                                    : "bg-white/50 hover:bg-white/70"
                                            }`}
                                            aria-label={`Go to image ${index + 1}`}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Category Badge */}
                            <div className="absolute top-3 left-3">
                                <span className="bg-black text-white text-xs font-medium px-3 py-1 rounded-full">
                                    {category}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Bottom - Details Section */}
                    <div className="flex flex-col bg-white overflow-y-auto flex-1 min-h-0">
                        <div className="p-5 lg:p-6 lg:px-8 flex flex-col">
                            {/* Header */}
                            <div className="mb-4">
                                <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-1">
                                    {car.name}
                                </h2>
                                <p className="text-sm text-gray-500">{car.name.split(" ").slice(0, 2).join(" ")} Series</p>
                            </div>

                            {/* Price */}
                            <div className="mb-5 pb-4 border-b border-gray-100">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl lg:text-3xl font-bold text-gray-900">
                                        Ksh {pricePerDay.toLocaleString()}
                                    </span>
                                    <span className="text-sm text-gray-500">/day</span>
                                </div>
                            </div>

                            {/* Quick Specs */}
                            <div className="grid grid-cols-4 gap-2 mb-5">
                                <div className="flex flex-col items-center p-2.5 bg-gray-50 rounded-xl">
                                    <Users className="w-4 h-4 text-gray-600 mb-1" />
                                    <span className="text-xs font-medium text-gray-900">{seatCount}</span>
                                    <span className="text-[10px] text-gray-500">Seats</span>
                                </div>
                                <div className="flex flex-col items-center p-2.5 bg-gray-50 rounded-xl">
                                    <Settings className="w-4 h-4 text-gray-600 mb-1" />
                                    <span className="text-xs font-medium text-gray-900">{car.specs.transmission.slice(0, 4)}</span>
                                    <span className="text-[10px] text-gray-500">Trans</span>
                                </div>
                                <div className="flex flex-col items-center p-2.5 bg-gray-50 rounded-xl">
                                    <Fuel className="w-4 h-4 text-gray-600 mb-1" />
                                    <span className="text-xs font-medium text-gray-900">{car.specs.fuel}</span>
                                    <span className="text-[10px] text-gray-500">Fuel</span>
                                </div>
                                <div className="flex flex-col items-center p-2.5 bg-gray-50 rounded-xl">
                                    <Gauge className="w-4 h-4 text-gray-600 mb-1" />
                                    <span className="text-xs font-medium text-gray-900">{car.specs.mileage}</span>
                                    <span className="text-[10px] text-gray-500">km/L</span>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="mb-5">
                                <h3 className="text-sm font-semibold text-gray-900 mb-2">About this car</h3>
                                <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
                            </div>

                            {/* Features */}
                            <div className="mb-5 flex-1">
                                <h3 className="text-sm font-semibold text-gray-900 mb-2">Features</h3>
                                <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                                    {features.slice(0, 6).map((feature, index) => (
                                        <div key={index} className="flex items-center gap-1.5">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                                            <span className="text-xs text-gray-600 truncate">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Availability */}
                            <div className="flex items-center gap-2 mb-5 p-3 bg-emerald-50 rounded-xl">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-sm font-medium text-emerald-700">Available for booking</span>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 mt-auto">
                                <button
                                    onClick={handleBookNow}
                                    className="flex-1 bg-gray-900 text-white py-3 px-4 rounded-xl font-semibold text-sm hover:bg-gray-800 transition-colors"
                                >
                                    Book Now
                                </button>
                                {onViewDetails && (
                                    <button
                                        onClick={() => onViewDetails(car)}
                                        className="px-4 py-3 bg-black/5 text-gray-900 rounded-xl font-medium text-sm hover:bg-black/10 transition-colors flex items-center gap-2"
                                    >
                                        View Details
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
