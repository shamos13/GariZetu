import { useMemo, useState } from "react";
import { X, ChevronLeft, ChevronRight, Users, Settings, Fuel, CheckCircle2, Gauge, Wrench, CheckCircle, XCircle, ChevronDown } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
} from "../../../components/ui/dialog";
import { getImageUrl } from "../../../lib/ImageUtils";
import { Car, CarStatus } from "../types/Car";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";

interface AdminCarDetailsModalProps {
    car: Car | null;
    isOpen: boolean;
    onClose: () => void;
    onEdit?: (car: Car) => void;
    onStatusChange?: (car: Car, newStatus: CarStatus) => void;
}

const getCarImages = (car: Car): string[] => {
    if (car.mainImageUrl) {
        return [getImageUrl(car.mainImageUrl)];
    }
    return ["/placeholder-car.jpg"];
};

const getCarFeatures = (car: Car): string[] => {
    if (car.features && car.features.length > 0) {
        return car.features.map(f => typeof f === 'string' ? f : f.featureName);
    }
    if (car.featureName && car.featureName.length > 0) {
        return car.featureName;
    }
    return ["No features listed"];
};

const getStatusConfig = (status: CarStatus) => {
    const configs = {
        AVAILABLE: {
            bg: "bg-green-500/20",
            text: "text-green-400",
            border: "border-green-500/30",
            label: "Available",
            icon: CheckCircle,
            dot: "bg-green-500"
        },
        RENTED: {
            bg: "bg-blue-500/20",
            text: "text-blue-400",
            border: "border-blue-500/30",
            label: "Rented",
            icon: XCircle,
            dot: "bg-blue-500"
        },
        MAINTENANCE: {
            bg: "bg-yellow-500/20",
            text: "text-yellow-400",
            border: "border-yellow-500/30",
            label: "Maintenance",
            icon: Wrench,
            dot: "bg-yellow-500"
        }
    };
    return configs[status] || configs.AVAILABLE;
};

export function AdminCarDetailsModal({ car, isOpen, onClose, onEdit, onStatusChange }: AdminCarDetailsModalProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // All hooks must be called before any conditional returns
    const images = useMemo(() => car ? getCarImages(car) : [], [car]);
    const features = car ? getCarFeatures(car) : [];
    const statusConfig = car ? getStatusConfig(car.carStatus) : getStatusConfig("AVAILABLE");
    const StatusIcon = statusConfig.icon;

    if (!car) return null;

    const handlePreviousImage = () => {
        setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const handleNextImage = () => {
        setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    const carName = `${car.make} ${car.vehicleModel} ${car.year}`;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-[94vw] sm:w-[92vw] md:w-[80vw] lg:w-[50vw] xl:w-[45vw] max-w-5xl max-h-[90vh] p-0 gap-0 rounded-2xl overflow-hidden border-0 shadow-2xl bg-[#1a1a1a]">
                <DialogHeader className="sr-only">
                    <h2>{carName}</h2>
                </DialogHeader>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 z-50 rounded-full bg-white/10 hover:bg-white/20 text-white p-2 transition-all shadow-md hover:shadow-lg"
                    aria-label="Close modal"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="flex flex-col max-h-[90vh] overflow-hidden">
                    {/* Top - Image Section */}
                    <div className="relative bg-gradient-to-br from-gray-900 to-black flex-shrink-0">
                        {/* Main Image */}
                        <div className="relative aspect-[16/9] lg:aspect-[21/9]">
                            <img
                                src={images[currentImageIndex]}
                                alt={carName}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.currentTarget.src = "/placeholder-car.jpg"; }}
                            />

                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                            {/* Navigation Arrows */}
                            {images.length > 1 && (
                                <>
                                    <button
                                        onClick={handlePreviousImage}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-1.5 transition-all shadow-md backdrop-blur-sm"
                                        aria-label="Previous image"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={handleNextImage}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-1.5 transition-all shadow-md backdrop-blur-sm"
                                        aria-label="Next image"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </>
                            )}

                            {/* Image Dots */}
                            {images.length > 1 && (
                                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/50 backdrop-blur-sm px-2.5 py-1.5 rounded-full">
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

                            {/* Status Badge */}
                            <div className="absolute top-3 left-3">
                                <span className={`${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} border px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5`}>
                                    <StatusIcon className="w-3 h-3" />
                                    {statusConfig.label}
                                </span>
                            </div>

                            {/* Body Type Badge */}
                            <div className="absolute top-3 right-3">
                                <span className="bg-black/70 backdrop-blur-sm text-white text-xs font-medium px-3 py-1 rounded-full">
                                    {car.bodyType}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Bottom - Details Section */}
                    <div className="flex flex-col bg-[#1a1a1a] overflow-y-auto flex-1 min-h-0">
                        <div className="p-5 lg:p-6 lg:px-8 flex flex-col">
                            {/* Header */}
                            <div className="mb-4">
                                <h2 className="text-xl lg:text-2xl font-bold text-white mb-1">
                                    {carName}
                                </h2>
                                <p className="text-sm text-gray-400">Registration: {car.registrationNumber}</p>
                            </div>

                            {/* Price */}
                            <div className="mb-5 pb-4 border-b border-gray-800">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl lg:text-3xl font-bold text-white">
                                        Ksh {car.dailyPrice.toLocaleString()}
                                    </span>
                                    <span className="text-sm text-gray-400">/day</span>
                                </div>
                            </div>

                            {/* Quick Specs */}
                            <div className="grid grid-cols-4 gap-2 mb-5">
                                <div className="flex flex-col items-center p-2.5 bg-[#141414] rounded-xl border border-gray-800">
                                    <Users className="w-4 h-4 text-gray-400 mb-1" />
                                    <span className="text-xs font-medium text-white">{car.seatingCapacity}</span>
                                    <span className="text-[10px] text-gray-500">Seats</span>
                                </div>
                                <div className="flex flex-col items-center p-2.5 bg-[#141414] rounded-xl border border-gray-800">
                                    <Settings className="w-4 h-4 text-gray-400 mb-1" />
                                    <span className="text-xs font-medium text-white">{car.transmissionType.slice(0, 4)}</span>
                                    <span className="text-[10px] text-gray-500">Trans</span>
                                </div>
                                <div className="flex flex-col items-center p-2.5 bg-[#141414] rounded-xl border border-gray-800">
                                    <Fuel className="w-4 h-4 text-gray-400 mb-1" />
                                    <span className="text-xs font-medium text-white">{car.fuelType}</span>
                                    <span className="text-[10px] text-gray-500">Fuel</span>
                                </div>
                                <div className="flex flex-col items-center p-2.5 bg-[#141414] rounded-xl border border-gray-800">
                                    <Gauge className="w-4 h-4 text-gray-400 mb-1" />
                                    <span className="text-xs font-medium text-white">{car.mileage.toLocaleString()}</span>
                                    <span className="text-[10px] text-gray-500">km</span>
                                </div>
                            </div>

                            {/* Additional Details */}
                            <div className="grid grid-cols-2 gap-3 mb-5">
                                <div className="p-3 bg-[#141414] rounded-xl border border-gray-800">
                                    <p className="text-xs text-gray-500 mb-1">Engine Capacity</p>
                                    <p className="text-sm font-medium text-white">{car.engineCapacity}L</p>
                                </div>
                                <div className="p-3 bg-[#141414] rounded-xl border border-gray-800">
                                    <p className="text-xs text-gray-500 mb-1">Color</p>
                                    <p className="text-sm font-medium text-white">{car.colour}</p>
                                </div>
                                <div className="p-3 bg-[#141414] rounded-xl border border-gray-800">
                                    <p className="text-xs text-gray-500 mb-1">Year</p>
                                    <p className="text-sm font-medium text-white">{car.year}</p>
                                </div>
                                <div className="p-3 bg-[#141414] rounded-xl border border-gray-800">
                                    <p className="text-xs text-gray-500 mb-1">Body Type</p>
                                    <p className="text-sm font-medium text-white">{car.bodyType}</p>
                                </div>
                            </div>

                            {/* Description */}
                            {car.description && (
                                <div className="mb-5">
                                    <h3 className="text-sm font-semibold text-white mb-2">Description</h3>
                                    <p className="text-sm text-gray-400 leading-relaxed">{car.description}</p>
                                </div>
                            )}

                            {/* Features */}
                            <div className="mb-5 flex-1">
                                <h3 className="text-sm font-semibold text-white mb-2">Features</h3>
                                <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                                    {features.slice(0, 8).map((feature, index) => (
                                        <div key={index} className="flex items-center gap-1.5">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                                            <span className="text-xs text-gray-400 truncate">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 mt-auto">
                                {onEdit && (
                                    <button
                                        onClick={() => {
                                            onEdit(car);
                                            onClose();
                                        }}
                                        className="flex-1 bg-white text-black py-3 px-4 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-colors"
                                    >
                                        Edit Car
                                    </button>
                                )}
                                {onStatusChange && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button
                                                type="button"
                                                className="px-4 py-3 bg-emerald-500/20 text-emerald-300 rounded-xl font-medium text-sm hover:bg-emerald-500/30 transition-colors flex items-center gap-2"
                                            >
                                                Status: {car.carStatus}
                                                <ChevronDown className="w-4 h-4" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="bg-[#1a1a1a] border-gray-800" align="end">
                                            {(["AVAILABLE", "RENTED", "MAINTENANCE"] as CarStatus[]).map((status) => (
                                                <DropdownMenuItem
                                                    key={status}
                                                    className="text-gray-200 hover:text-white hover:bg-gray-800 cursor-pointer"
                                                    onSelect={() => onStatusChange(car, status)}
                                                >
                                                    {status}
                                                    {car.carStatus === status && <span className="ml-2 text-emerald-400">(current)</span>}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
