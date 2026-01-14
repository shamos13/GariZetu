import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Gauge, Milestone, Users, Fuel, ArrowRight, Star, Heart } from "lucide-react";
import { CarDetailsModal } from "./CarDetailsModal";

interface CarData {
    id: number;
    name: string;
    price: number;
    image: string;
    specs: {
        mileage: string;
        transmission: string;
        capacity: string;
        fuel: string;
    };
    rating?: number;
    reviewCount?: number;
}

const CARS: CarData[] = [
    {
        id: 9001, // High ID to avoid conflicts with backend cars
        name: "Audi A8 L 2022",
        price: 4000,
        image: "/audi-a8-gray.jpg",
        rating: 4.9,
        reviewCount: 48,
        specs: { mileage: "4,000", transmission: "Auto", capacity: "4 Person", fuel: "Electric" },
    },
    {
        id: 9002, // High ID to avoid conflicts with backend cars
        name: "Nissan Maxima Platinum 2022",
        price: 3500,
        image: "/nissan-maxima-white.jpg",
        rating: 4.8,
        reviewCount: 36,
        specs: { mileage: "4,000", transmission: "Auto", capacity: "4 Person", fuel: "Electric" },
    },
    {
        id: 9003, // High ID to avoid conflicts with backend cars
        name: "Porsche Cayenne GTS 2022",
        price: 5500,
        image: "/porsche-cayenne-black.jpg",
        rating: 5.0,
        reviewCount: 52,
        specs: { mileage: "4,000", transmission: "Auto", capacity: "4 Person", fuel: "Electric" },
    },
]

const CATEGORIES = ["Popular Car", "Luxury Car", "Vintage Car", "Family Car", "Off-Road Car"]

export function FeaturedCollection() {
    const navigate = useNavigate();
    const [selectedCar, setSelectedCar] = useState<CarData | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState(0);
    const [favorites, setFavorites] = useState<number[]>([]);

    const handleRentNow = (car: CarData) => {
        setSelectedCar(car);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedCar(null);
    };

    const handleBookNow = (car: CarData) => {
        handleCloseModal();
        navigate(`/vehicles/${car.id}`);
    };

    const toggleFavorite = (carId: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setFavorites(prev => 
            prev.includes(carId) 
                ? prev.filter(id => id !== carId)
                : [...prev, carId]
        );
    };

    return (
        <section className="py-20 px-4 md:px-12 bg-white max-w-7xl mx-auto">
            <div className="text-center space-y-4 mb-12">
                <p className="text-sm font-medium text-emerald-600 uppercase tracking-wider">
                    Featured Collection
                </p>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                    Our Impressive Collection of Cars
                </h2>
                <p className="text-gray-500 max-w-2xl mx-auto">
                    From everyday elegance to raw performance — our cars are carefully selected so you can drive like you own the road
                </p>
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap justify-center gap-3 mb-12">
                {CATEGORIES.map((cat, i) => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(i)}
                        className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                            activeCategory === i 
                                ? "bg-black text-white shadow-lg shadow-black/20 scale-105" 
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105"
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Cars Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {CARS.map((car, index) => (
                    <div
                        key={car.id}
                        className="group bg-white rounded-3xl p-4 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        {/* Image Container */}
                        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-6 bg-gray-50">
                            <img
                                src={car.image || "/placeholder.svg"}
                                alt={car.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            
                            {/* Favorite Button */}
                            <button
                                onClick={(e) => toggleFavorite(car.id, e)}
                                className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                                    favorites.includes(car.id)
                                        ? "bg-red-500 text-white scale-110"
                                        : "bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-white hover:scale-110"
                                }`}
                            >
                                <Heart 
                                    className={`w-5 h-5 transition-all ${favorites.includes(car.id) ? "fill-white" : ""}`} 
                                />
                            </button>

                            {/* Popular Badge */}
                            {(car.rating ?? 0) >= 4.9 && (
                                <div className="absolute top-3 left-3 bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                                    ⭐ Top Rated
                                </div>
                            )}

                            {/* View Details Overlay */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                <button
                                    onClick={() => handleRentNow(car)}
                                    className="bg-white text-black px-6 py-2.5 rounded-full font-semibold transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
                                >
                                    View Details
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4 px-2">
                            {/* Rating */}
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                    <span className="text-sm font-semibold text-gray-900">{car.rating}</span>
                                </div>
                                <span className="text-xs text-gray-400">({car.reviewCount} reviews)</span>
                            </div>

                            {/* Name */}
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-black transition-colors">
                                {car.name}
                            </h3>

                            {/* Price */}
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-bold text-gray-900">
                                    Ksh {car.price.toLocaleString()}
                                </span>
                                <span className="text-gray-400 text-sm">/day</span>
                            </div>

                            {/* Specs Grid */}
                            <div className="grid grid-cols-2 gap-y-3 gap-x-2 pt-4 border-t border-gray-100">
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                                        <Gauge size={14} />
                                    </div>
                                    {car.specs.mileage}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                                        <Milestone size={14} />
                                    </div>
                                    {car.specs.transmission}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                                        <Users size={14} />
                                    </div>
                                    {car.specs.capacity}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                                        <Fuel size={14} />
                                    </div>
                                    {car.specs.fuel}
                                </div>
                            </div>

                            {/* CTA Button */}
                            <button
                                onClick={() => handleRentNow(car)}
                                className="w-full py-3.5 rounded-xl text-sm font-bold transition-all duration-300 mt-4 bg-black text-white hover:bg-zinc-800 hover:shadow-lg hover:shadow-black/20 active:scale-95"
                            >
                                View Details
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* See All CTA */}
            <div className="mt-16 flex justify-center">
                <Link 
                    to="/vehicles"
                    className="group bg-black text-white px-8 py-4 rounded-xl font-bold flex items-center gap-3 hover:bg-zinc-800 hover:shadow-xl hover:shadow-black/20 transition-all duration-300 hover:gap-4"
                >
                    See all Cars 
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            {/* Car Details Modal */}
            {selectedCar && (
                <CarDetailsModal
                    car={selectedCar}
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onBookNow={handleBookNow}
                    onViewDetails={(c) => { handleCloseModal(); navigate(`/vehicles/${c.id}`); }}
                />
            )}
        </section>
    )
}
