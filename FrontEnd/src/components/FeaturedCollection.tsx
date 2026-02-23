import { useMemo, useState, type MouseEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Fuel, Gauge, Heart, Milestone, Star, Users } from "lucide-react";
import { CarDetailsModal } from "./CarDetailsModal";
import { getImageUrl } from "../lib/ImageUtils.ts";
import type { Car, FeaturedCategory } from "../data/cars.ts";

interface FeaturedCollectionProps {
    cars: Car[];
    isLoading?: boolean;
}

const CATEGORY_ORDER: FeaturedCategory[] = [
    "Popular Car",
    "Luxury Car",
    "Vintage Car",
    "Family Car",
    "Off-Road Car",
];

export function FeaturedCollection({ cars, isLoading = false }: FeaturedCollectionProps) {
    const navigate = useNavigate();
    const [selectedCar, setSelectedCar] = useState<Car | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState<FeaturedCategory>("Popular Car");
    const [favorites, setFavorites] = useState<number[]>([]);

    const carsByCategory = useMemo(() => {
        return CATEGORY_ORDER.map((category) => ({
            category,
            cars: cars.filter((car) => car.featuredCategory === category),
        }));
    }, [cars]);

    const activeCategoryCars = useMemo(
        () => cars.filter((car) => car.featuredCategory === activeCategory),
        [cars, activeCategory]
    );

    const displayedCars = activeCategoryCars.slice(0, 3);

    const openModal = (car: Car) => {
        setSelectedCar(car);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedCar(null);
    };

    const handleBookNow = (car: { id: number }) => {
        handleCloseModal();
        navigate(`/vehicles/${car.id}`);
    };

    const toggleFavorite = (carId: number, event: MouseEvent) => {
        event.stopPropagation();
        setFavorites((current) =>
            current.includes(carId)
                ? current.filter((id) => id !== carId)
                : [...current, carId]
        );
    };

    const toModalCar = (car: Car) => ({
        id: car.id,
        name: car.name,
        dailyPrice: car.dailyPrice,
        mainImageUrl: car.mainImageUrl,
        gallery: car.gallery?.map((image) => image.url) ?? [car.mainImageUrl],
        specs: {
            mileage: car.mileage,
            transmission: car.transmission,
            capacity: `${car.seatingCapacity} Person`,
            fuel: car.fuelType,
        },
        category: car.bodyType,
        description: car.description,
        features: car.features.map((feature) => feature.name),
        rating: car.rating,
        reviewCount: car.reviewCount,
    });

    return (
        <section className="section-space bg-white">
            <div className="layout-container">
                <div className="mb-6 space-y-2.5 text-center">
                    <p className="text-sm font-medium uppercase tracking-wider text-emerald-600">
                        Featured Collection
                    </p>
                    <h2 className="text-[1.65rem] font-bold text-gray-900 sm:text-2xl md:text-[1.75rem]">
                        Our Impressive Collection of Cars
                    </h2>
                    <p className="mx-auto max-w-2xl text-gray-500">
                        Explore real-time featured vehicles directly from our fleet database.
                    </p>
                </div>

                <div className="mb-6 flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:justify-center sm:overflow-visible">
                    {carsByCategory.map(({ category, cars: items }) => (
                        <button
                            key={category}
                            onClick={() => setActiveCategory(category)}
                            className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-300 ${
                                activeCategory === category
                                    ? "scale-105 bg-black text-white shadow-lg shadow-black/20"
                                    : "bg-gray-100 text-gray-600 hover:scale-105 hover:bg-gray-200"
                            }`}
                        >
                            {category}
                            <span className="ml-2 text-xs opacity-80">{items.length}</span>
                        </button>
                    ))}
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {Array.from({ length: 3 }, (_, index) => (
                            <div key={`featured-loading-${index}`} className="h-[380px] animate-pulse rounded-2xl bg-gray-100" />
                        ))}
                    </div>
                ) : displayedCars.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {displayedCars.map((car, index) => (
                            <div
                                key={car.id}
                                className="group rounded-2xl border border-gray-100 bg-white p-3 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-xl bg-gray-50">
                                    <img
                                        src={getImageUrl(car.mainImageUrl)}
                                        alt={car.name}
                                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />

                                    <button
                                        onClick={(event) => toggleFavorite(car.id, event)}
                                        className={`absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300 ${
                                            favorites.includes(car.id)
                                                ? "scale-110 bg-red-500 text-white"
                                                : "bg-white/80 text-gray-600 backdrop-blur-sm hover:scale-110 hover:bg-white"
                                        }`}
                                    >
                                        <Heart className={`h-5 w-5 transition-all ${favorites.includes(car.id) ? "fill-white" : ""}`} />
                                    </button>

                                    {(car.rating ?? 0) >= 4.9 && (
                                        <div className="absolute left-3 top-3 rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white">
                                            ⭐ Top Rated
                                        </div>
                                    )}

                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                        <button
                                            onClick={() => openModal(car)}
                                            className="rounded-full bg-white px-6 py-2.5 font-semibold text-black transition-transform duration-300 group-hover:translate-y-0"
                                        >
                                            View Details
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-3 px-1">
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1">
                                            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                            <span className="text-sm font-semibold text-gray-900">{car.rating.toFixed(1)}</span>
                                        </div>
                                        <span className="text-xs text-gray-400">({car.reviewCount} reviews)</span>
                                    </div>

                                    <h3 className="text-base font-bold text-gray-900 transition-colors group-hover:text-black md:text-lg">
                                        {car.name}
                                    </h3>

                                    <div className="flex items-baseline gap-1">
                                        <span className="text-lg font-bold text-gray-900 md:text-xl">
                                            Ksh {car.dailyPrice.toLocaleString()}
                                        </span>
                                        <span className="text-sm text-gray-400">/day</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-x-2 gap-y-2 border-t border-gray-100 pt-3">
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-100 transition-colors group-hover:bg-black group-hover:text-white">
                                                <Gauge size={14} />
                                            </div>
                                            {car.mileage}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-100 transition-colors group-hover:bg-black group-hover:text-white">
                                                <Milestone size={14} />
                                            </div>
                                            {car.transmission}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-100 transition-colors group-hover:bg-black group-hover:text-white">
                                                <Users size={14} />
                                            </div>
                                            {car.seatingCapacity} Person
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-100 transition-colors group-hover:bg-black group-hover:text-white">
                                                <Fuel size={14} />
                                            </div>
                                            {car.fuelType}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => openModal(car)}
                                        className="mt-3 w-full rounded-xl bg-black py-2.5 text-sm font-bold text-white transition-all duration-300 hover:bg-zinc-800 hover:shadow-lg hover:shadow-black/20 active:scale-95"
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-10 text-center text-gray-500">
                        No vehicles are currently available in {activeCategory}.
                    </div>
                )}

                <div className="mt-8 flex justify-center">
                    <Link
                        to={`/vehicles?featuredCategory=${encodeURIComponent(activeCategory)}`}
                        className="group flex items-center gap-2.5 rounded-xl bg-black px-6 py-2.5 font-semibold text-white transition-all duration-300 hover:gap-3 hover:bg-zinc-800 hover:shadow-xl hover:shadow-black/20"
                    >
                        See all Cars
                        <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>
            </div>

            {selectedCar && (
                <CarDetailsModal
                    car={toModalCar(selectedCar)}
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onBookNow={handleBookNow}
                    onViewDetails={(car) => {
                        handleCloseModal();
                        navigate(`/vehicles/${car.id}`);
                    }}
                />
            )}
        </section>
    );
}
