import { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { 
    Search, 
    SlidersHorizontal, 
    X, 
    ChevronDown,
    Gauge,
    Users,
    Fuel,
    Settings,
    Star,
    MapPin,
    ArrowUpDown
} from "lucide-react";
import { Navbar } from "../components/Navbar";
import { CARS_DATA, Car, FuelType, TransmissionType, BodyType } from "../data/cars";

type SortOption = "price-asc" | "price-desc" | "rating" | "newest";

export default function VehiclesPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    
    const [searchQuery, setSearchQuery] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [sortBy, setSortBy] = useState<SortOption>("rating");
    
    // Filter states
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
    const [selectedFuel, setSelectedFuel] = useState<FuelType | "all">("all");
    const [selectedTransmission, setSelectedTransmission] = useState<TransmissionType | "all">("all");
    const [selectedSeats, setSelectedSeats] = useState<number | "all">("all");
    const [selectedBodyType, setSelectedBodyType] = useState<BodyType | "all">("all");

    // Read URL params on mount and when they change
    useEffect(() => {
        const bodyTypeParam = searchParams.get("bodyType");
        const sortParam = searchParams.get("sort");
        const fuelParam = searchParams.get("fuel");
        const transmissionParam = searchParams.get("transmission");
        const seatsParam = searchParams.get("seats");
        const searchParam = searchParams.get("search");

        if (bodyTypeParam && ["Sedan", "SUV", "Hatchback", "Coupe", "Convertible", "Van", "Truck"].includes(bodyTypeParam)) {
            setSelectedBodyType(bodyTypeParam as BodyType);
            setShowFilters(true);
        }
        
        if (sortParam && ["price-asc", "price-desc", "rating", "newest"].includes(sortParam)) {
            setSortBy(sortParam as SortOption);
        }
        
        if (fuelParam && ["Petrol", "Diesel", "Electric", "Hybrid"].includes(fuelParam)) {
            setSelectedFuel(fuelParam as FuelType);
            setShowFilters(true);
        }
        
        if (transmissionParam && ["Manual", "Automatic"].includes(transmissionParam)) {
            setSelectedTransmission(transmissionParam as TransmissionType);
            setShowFilters(true);
        }
        
        if (seatsParam) {
            const seats = parseInt(seatsParam);
            if ([4, 5, 7].includes(seats)) {
                setSelectedSeats(seats);
                setShowFilters(true);
            }
        }
        
        if (searchParam) {
            setSearchQuery(searchParam);
        }
    }, [searchParams]);

    // Filter and sort cars
    const filteredCars = useMemo(() => {
        let result = CARS_DATA.filter(car => {
            // Search filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                if (!car.name.toLowerCase().includes(query) && 
                    !car.make.toLowerCase().includes(query) &&
                    !car.model.toLowerCase().includes(query)) {
                    return false;
                }
            }
            
            // Price filter
            if (car.dailyPrice < priceRange[0] || car.dailyPrice > priceRange[1]) {
                return false;
            }
            
            // Fuel filter
            if (selectedFuel !== "all" && car.fuelType !== selectedFuel) {
                return false;
            }
            
            // Transmission filter
            if (selectedTransmission !== "all" && car.transmission !== selectedTransmission) {
                return false;
            }
            
            // Seats filter
            if (selectedSeats !== "all" && car.seatingCapacity !== selectedSeats) {
                return false;
            }
            
            // Body type filter
            if (selectedBodyType !== "all" && car.bodyType !== selectedBodyType) {
                return false;
            }
            
            return true;
        });
        
        // Sort
        switch (sortBy) {
            case "price-asc":
                result.sort((a, b) => a.dailyPrice - b.dailyPrice);
                break;
            case "price-desc":
                result.sort((a, b) => b.dailyPrice - a.dailyPrice);
                break;
            case "rating":
                result.sort((a, b) => b.rating - a.rating);
                break;
            case "newest":
                result.sort((a, b) => b.year - a.year);
                break;
        }
        
        return result;
    }, [searchQuery, priceRange, selectedFuel, selectedTransmission, selectedSeats, selectedBodyType, sortBy]);

    const clearFilters = () => {
        setPriceRange([0, 10000]);
        setSelectedFuel("all");
        setSelectedTransmission("all");
        setSelectedSeats("all");
        setSelectedBodyType("all");
        setSearchQuery("");
        // Clear URL params
        setSearchParams({});
    };

    const activeFiltersCount = [
        selectedFuel !== "all",
        selectedTransmission !== "all",
        selectedSeats !== "all",
        selectedBodyType !== "all",
        priceRange[0] > 0 || priceRange[1] < 10000,
    ].filter(Boolean).length;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sticky Navbar */}
            <Navbar />
            
            {/* Hero Header */}
            <div className="relative bg-black pt-28 pb-32">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-900 to-black" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-zinc-800/30 via-transparent to-transparent" />
                </div>
                
                <div className="relative max-w-7xl mx-auto px-5 md:px-8 pt-8">
                    <div className="max-w-2xl">
                        <p className="text-gray-400 text-sm font-medium tracking-wider uppercase mb-3">
                            Premium Collection
                        </p>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                            Find Your Perfect Ride
                        </h1>
                        <p className="text-gray-400 text-lg">
                            Explore our handpicked selection of premium vehicles for every occasion
                        </p>
                    </div>
                </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="relative -mt-8 max-w-7xl mx-auto px-5 md:px-8">
                <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search Input */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by make, model, or name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-0 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black"
                            />
                        </div>
                        
                        {/* Sort Dropdown */}
                        <div className="relative">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as SortOption)}
                                className="appearance-none pl-4 pr-10 py-3.5 bg-gray-50 border-0 rounded-xl text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-black cursor-pointer"
                            >
                                <option value="rating">Top Rated</option>
                                <option value="price-asc">Price: Low to High</option>
                                <option value="price-desc">Price: High to Low</option>
                                <option value="newest">Newest First</option>
                            </select>
                            <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                        
                        {/* Filter Toggle */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-6 py-3.5 rounded-xl font-medium transition-all ${
                                showFilters || activeFiltersCount > 0
                                    ? "bg-black text-white"
                                    : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                            }`}
                        >
                            <SlidersHorizontal className="w-4 h-4" />
                            Filters
                            {activeFiltersCount > 0 && (
                                <span className="ml-1 w-5 h-5 bg-white text-gray-900 rounded-full text-xs flex items-center justify-center font-bold">
                                    {activeFiltersCount}
                                </span>
                            )}
                        </button>
                    </div>
                    
                    {/* Expanded Filters */}
                    {showFilters && (
                        <div className="mt-6 pt-6 border-t border-gray-100">
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                {/* Price Range */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                                        Max Price (Ksh/day)
                                    </label>
                                    <select
                                        value={priceRange[1]}
                                        onChange={(e) => setPriceRange([0, Number(e.target.value)])}
                                        className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                                    >
                                        <option value={10000}>Any Price</option>
                                        <option value={3000}>Under 3,000</option>
                                        <option value={4000}>Under 4,000</option>
                                        <option value={5000}>Under 5,000</option>
                                        <option value={6000}>Under 6,000</option>
                                        <option value={7000}>Under 7,000</option>
                                    </select>
                                </div>
                                
                                {/* Fuel Type */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                                        Fuel Type
                                    </label>
                                    <select
                                        value={selectedFuel}
                                        onChange={(e) => setSelectedFuel(e.target.value as FuelType | "all")}
                                        className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                                    >
                                        <option value="all">All Types</option>
                                        <option value="Petrol">Petrol</option>
                                        <option value="Diesel">Diesel</option>
                                        <option value="Electric">Electric</option>
                                        <option value="Hybrid">Hybrid</option>
                                    </select>
                                </div>
                                
                                {/* Transmission */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                                        Transmission
                                    </label>
                                    <select
                                        value={selectedTransmission}
                                        onChange={(e) => setSelectedTransmission(e.target.value as TransmissionType | "all")}
                                        className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                                    >
                                        <option value="all">Any</option>
                                        <option value="Automatic">Automatic</option>
                                        <option value="Manual">Manual</option>
                                    </select>
                                </div>
                                
                                {/* Seats */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                                        Seats
                                    </label>
                                    <select
                                        value={selectedSeats}
                                        onChange={(e) => setSelectedSeats(e.target.value === "all" ? "all" : Number(e.target.value))}
                                        className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                                    >
                                        <option value="all">Any</option>
                                        <option value={4}>4 Seats</option>
                                        <option value={5}>5 Seats</option>
                                        <option value={7}>7 Seats</option>
                                    </select>
                                </div>
                                
                                {/* Body Type */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                                        Body Type
                                    </label>
                                    <select
                                        value={selectedBodyType}
                                        onChange={(e) => setSelectedBodyType(e.target.value as BodyType | "all")}
                                        className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                                    >
                                        <option value="all">All Types</option>
                                        <option value="Sedan">Sedan</option>
                                        <option value="SUV">SUV</option>
                                        <option value="Hatchback">Hatchback</option>
                                        <option value="Coupe">Coupe</option>
                                    </select>
                                </div>
                            </div>
                            
                            {activeFiltersCount > 0 && (
                                <button
                                    onClick={clearFilters}
                                    className="mt-4 text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                    Clear all filters
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Results Section */}
            <div className="max-w-7xl mx-auto px-5 md:px-8 py-12">
                {/* Results Count */}
                <div className="flex items-center justify-between mb-8">
                    <p className="text-gray-600">
                        <span className="font-semibold text-gray-900">{filteredCars.length}</span> vehicles available
                    </p>
                </div>
                
                {/* Cars Grid */}
                {filteredCars.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCars.map((car) => (
                            <VehicleCard key={car.id} car={car} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No vehicles found</h3>
                        <p className="text-gray-500 mb-6">Try adjusting your filters or search query</p>
                        <button
                            onClick={clearFilters}
                            className="px-6 py-3 bg-black text-white rounded-xl font-medium hover:bg-zinc-800 transition-colors"
                        >
                            Clear Filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

// Vehicle Card Component
function VehicleCard({ car }: { car: Car }) {
    return (
        <Link 
            to={`/vehicles/${car.id}`}
            className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
        >
            {/* Image */}
            <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                <img
                    src={car.mainImage || "/placeholder.svg"}
                    alt={car.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Status Badge */}
                <div className="absolute top-3 left-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        car.status === "available" 
                            ? "bg-emerald-500 text-white" 
                            : "bg-black text-white"
                    }`}>
                        {car.status === "available" ? "Available" : "Rented"}
                    </span>
                </div>
                
                {/* Rating */}
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span className="text-xs font-semibold text-gray-900">{car.rating}</span>
                </div>
            </div>
            
            {/* Content */}
            <div className="p-5">
                {/* Header */}
                <div className="mb-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{car.bodyType}</p>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-gray-700 transition-colors">
                        {car.name}
                    </h3>
                </div>
                
                {/* Location */}
                <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
                    <MapPin className="w-3.5 h-3.5" />
                    {car.location}
                </div>
                
                {/* Specs */}
                <div className="grid grid-cols-4 gap-2 py-4 border-t border-b border-gray-100">
                    <div className="flex flex-col items-center gap-1">
                        <Gauge className="w-4 h-4 text-gray-400" />
                        <span className="text-[10px] text-gray-500 uppercase">{car.mileage}</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <Settings className="w-4 h-4 text-gray-400" />
                        <span className="text-[10px] text-gray-500 uppercase">{car.transmission.slice(0, 4)}</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-[10px] text-gray-500 uppercase">{car.seatingCapacity} Seats</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <Fuel className="w-4 h-4 text-gray-400" />
                        <span className="text-[10px] text-gray-500 uppercase">{car.fuelType}</span>
                    </div>
                </div>
                
                {/* Price & CTA */}
                <div className="flex items-center justify-between mt-4">
                    <div>
                        <span className="text-2xl font-bold text-gray-900">Ksh {car.dailyPrice.toLocaleString()}</span>
                        <span className="text-sm text-gray-500">/day</span>
                    </div>
                    <span className="px-4 py-2 bg-black text-white text-sm font-medium rounded-lg group-hover:bg-zinc-800 transition-colors">
                        View Details
                    </span>
                </div>
            </div>
        </Link>
    );
}

