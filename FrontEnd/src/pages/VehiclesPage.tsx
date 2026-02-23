import { type ReactNode, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
    ArrowUpDown,
    Car as CarIcon,
    CarFront,
    Check,
    ChevronLeft,
    ChevronRight,
    CircleDot,
    Fuel,
    Gauge,
    Search,
    SlidersHorizontal,
    Sparkles,
    Star,
    Truck,
    Users,
    X,
} from "lucide-react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { carService } from "../services/carService";
import { getImageUrl } from "../lib/ImageUtils.ts";
import { BodyType, Car, CARS_DATA, FuelType, TransmissionType } from "../data/cars";

type SortOption = "recommended" | "price-asc" | "price-desc" | "newest";
type PageNumber = number | "...";

const CARS_PER_PAGE = 6;

const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
    { value: "recommended", label: "Recommended" },
    { value: "price-asc", label: "Price: Low to High" },
    { value: "price-desc", label: "Price: High to Low" },
    { value: "newest", label: "Newest First" },
];

const BODY_TYPE_ORDER: BodyType[] = [
    "Sedan",
    "SUV",
    "Hatchback",
    "Coupe",
    "Convertible",
    "Van",
    "Truck",
];

function parseSortOption(value: string | null): SortOption {
    if (value === "price-asc" || value === "price-desc" || value === "newest") {
        return value;
    }
    return "recommended";
}

function isBodyType(value: string | null): value is BodyType {
    return BODY_TYPE_ORDER.includes(value as BodyType);
}

function buildPageNumbers(currentPage: number, totalPages: number): PageNumber[] {
    if (totalPages <= 5) {
        return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    if (currentPage <= 3) {
        return [1, 2, 3, "...", totalPages];
    }

    if (currentPage >= totalPages - 2) {
        return [1, "...", totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, "...", currentPage, "...", totalPages];
}

export default function VehiclesPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialBodyTypeParam = searchParams.get("bodyType");

    const [searchQuery, setSearchQuery] = useState(searchParams.get("q") ?? "");
    const [showFilters, setShowFilters] = useState(false);
    const [sortBy, setSortBy] = useState<SortOption>(parseSortOption(searchParams.get("sort")));
    const [cars, setCars] = useState<Car[]>(CARS_DATA);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
    const [selectedFuel, setSelectedFuel] = useState<FuelType | "all">("all");
    const [selectedTransmission, setSelectedTransmission] = useState<TransmissionType | "all">("all");
    const [selectedSeats, setSelectedSeats] = useState<number | "all">("all");
    const [selectedBodyType, setSelectedBodyType] = useState<BodyType | "all">(
        isBodyType(initialBodyTypeParam) ? initialBodyTypeParam : "all"
    );
    const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const q = searchParams.get("q") ?? "";
        const bodyTypeParam = searchParams.get("bodyType");
        const sortParam = searchParams.get("sort");

        setSearchQuery(q);
        setSelectedBodyType(isBodyType(bodyTypeParam) ? bodyTypeParam : "all");
        setSortBy(parseSortOption(sortParam));
    }, [searchParams]);

    useEffect(() => {
        const fetchCars = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const fetchedCars = await carService.getAll();
                if (fetchedCars.length > 0) {
                    setCars(fetchedCars);
                } else {
                    setCars(CARS_DATA);
                }
            } catch (fetchError) {
                console.error("Error fetching cars:", fetchError);
                setError("Failed to load live vehicles. Showing sample fleet.");
                setCars(CARS_DATA);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCars();
    }, []);

    const maxAvailablePrice = useMemo(() => {
        if (cars.length === 0) return 10000;
        return Math.max(...cars.map((car) => car.dailyPrice));
    }, [cars]);

    useEffect(() => {
        setPriceRange((currentRange) => {
            const cappedUpper = Math.min(currentRange[1], maxAvailablePrice);
            const safeUpper = cappedUpper > 0 ? cappedUpper : maxAvailablePrice;
            return [0, safeUpper];
        });
    }, [maxAvailablePrice]);

    const brandOptions = useMemo(() => {
        const counts = new Map<string, number>();
        cars.forEach((car) => {
            counts.set(car.make, (counts.get(car.make) ?? 0) + 1);
        });

        return Array.from(counts.entries())
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [cars]);

    const bodyTypeOptions = useMemo(() => {
        const fromCars = new Set(cars.map((car) => car.bodyType));
        return BODY_TYPE_ORDER.filter((type) => fromCars.has(type));
    }, [cars]);

    const seatOptions = useMemo(
        () =>
            Array.from(new Set(cars.map((car) => car.seatingCapacity)))
                .sort((a, b) => a - b)
                .slice(0, 5),
        [cars]
    );

    const filteredCars = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        const result = cars.filter((car) => {
            if (
                query.length > 0 &&
                !car.name.toLowerCase().includes(query) &&
                !car.make.toLowerCase().includes(query) &&
                !car.model.toLowerCase().includes(query)
            ) {
                return false;
            }

            if (car.dailyPrice < priceRange[0] || car.dailyPrice > priceRange[1]) {
                return false;
            }

            if (selectedFuel !== "all" && car.fuelType !== selectedFuel) {
                return false;
            }

            if (selectedTransmission !== "all" && car.transmission !== selectedTransmission) {
                return false;
            }

            if (selectedSeats !== "all" && car.seatingCapacity !== selectedSeats) {
                return false;
            }

            if (selectedBodyType !== "all" && car.bodyType !== selectedBodyType) {
                return false;
            }

            if (selectedBrands.length > 0 && !selectedBrands.includes(car.make)) {
                return false;
            }

            return true;
        });

        const sorted = [...result];

        switch (sortBy) {
            case "price-asc":
                sorted.sort((a, b) => a.dailyPrice - b.dailyPrice);
                break;
            case "price-desc":
                sorted.sort((a, b) => b.dailyPrice - a.dailyPrice);
                break;
            case "newest":
                sorted.sort((a, b) => b.year - a.year);
                break;
            case "recommended":
            default:
                sorted.sort((a, b) => {
                    const aAvailableScore = a.status === "available" ? 1 : 0;
                    const bAvailableScore = b.status === "available" ? 1 : 0;
                    if (aAvailableScore !== bAvailableScore) {
                        return bAvailableScore - aAvailableScore;
                    }
                    return b.rating - a.rating;
                });
                break;
        }

        return sorted;
    }, [
        cars,
        searchQuery,
        priceRange,
        selectedFuel,
        selectedTransmission,
        selectedSeats,
        selectedBodyType,
        selectedBrands,
        sortBy,
    ]);

    const totalPages = Math.max(1, Math.ceil(filteredCars.length / CARS_PER_PAGE));

    useEffect(() => {
        setCurrentPage(1);
    }, [
        searchQuery,
        sortBy,
        priceRange,
        selectedFuel,
        selectedTransmission,
        selectedSeats,
        selectedBodyType,
        selectedBrands,
    ]);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    useEffect(() => {
        if (!showFilters) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [showFilters]);

    const pagedCars = useMemo(() => {
        const start = (currentPage - 1) * CARS_PER_PAGE;
        return filteredCars.slice(start, start + CARS_PER_PAGE);
    }, [filteredCars, currentPage]);

    const pageNumbers = useMemo(
        () => buildPageNumbers(currentPage, totalPages),
        [currentPage, totalPages]
    );

    const activeFiltersCount = [
        searchQuery.trim().length > 0,
        priceRange[1] < maxAvailablePrice,
        selectedFuel !== "all",
        selectedTransmission !== "all",
        selectedSeats !== "all",
        selectedBodyType !== "all",
        selectedBrands.length > 0,
    ].filter(Boolean).length;

    const clearFilters = () => {
        setSearchQuery("");
        setPriceRange([0, maxAvailablePrice]);
        setSelectedFuel("all");
        setSelectedTransmission("all");
        setSelectedSeats("all");
        setSelectedBodyType("all");
        setSelectedBrands([]);
        setSortBy("recommended");
        setCurrentPage(1);
        setShowFilters(false);
        setSearchParams({});
    };

    const toggleBrand = (brandName: string) => {
        setSelectedBrands((currentBrands) =>
            currentBrands.includes(brandName)
                ? currentBrands.filter((value) => value !== brandName)
                : [...currentBrands, brandName]
        );
    };

    return (
        <div className="bg-zinc-100">
            <Navbar />

            <main className="layout-container pb-10 pt-20 md:pt-24">
                <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h1 className="text-3xl text-zinc-900 sm:text-4xl md:text-5xl">Our Fleet</h1>
                        <p className="mt-2 text-sm text-zinc-600">
                            Explore our premium collection of luxury vehicles.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <button
                            type="button"
                            onClick={() => setShowFilters((current) => !current)}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 sm:w-auto lg:hidden"
                        >
                            <SlidersHorizontal className="h-4 w-4" />
                            Filters
                            {activeFiltersCount > 0 && (
                                <span className="rounded-full bg-black px-2 py-0.5 text-xs text-white">
                                    {activeFiltersCount}
                                </span>
                            )}
                        </button>

                        <div className="inline-flex w-full items-center justify-between gap-2 rounded-xl border border-zinc-300 bg-white px-3 py-2 sm:w-auto">
                            <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                                Sort by:
                            </span>
                            <div className="relative">
                                <select
                                    value={sortBy}
                                    onChange={(event) => setSortBy(event.target.value as SortOption)}
                                    className="appearance-none rounded-lg bg-zinc-100 py-1.5 pl-3 pr-8 text-sm text-zinc-700 outline-none"
                                >
                                    {SORT_OPTIONS.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                <ArrowUpDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
                            </div>
                        </div>
                    </div>
                </header>

                {error && (
                    <div className="mb-5 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                        {error}
                    </div>
                )}

                {showFilters && (
                    <button
                        type="button"
                        aria-label="Close filters"
                        className="fixed inset-0 z-30 bg-black/45 backdrop-blur-sm lg:hidden"
                        onClick={() => setShowFilters(false)}
                    />
                )}

                <section className="grid gap-6 lg:grid-cols-[270px_minmax(0,1fr)]">
                    <aside
                        className={`fixed inset-y-0 left-0 z-40 w-[88vw] max-w-xs space-y-4 overflow-y-auto border-r border-zinc-200 bg-zinc-100 p-4 shadow-xl transition-transform duration-300 lg:static lg:z-auto lg:w-auto lg:max-w-none lg:translate-x-0 lg:border-r-0 lg:bg-transparent lg:p-0 lg:shadow-none ${
                            showFilters ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                        }`}
                    >
                        <div className="flex items-center justify-between lg:hidden">
                            <p className="text-base font-semibold text-zinc-900">Filters</p>
                            <button
                                type="button"
                                onClick={() => setShowFilters(false)}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-zinc-300 bg-white text-zinc-700"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <FilterCard
                            title="Price Range (Daily)"
                            action={
                                <button
                                    type="button"
                                    onClick={() => setPriceRange([0, maxAvailablePrice])}
                                    className="text-xs text-zinc-500 transition-colors hover:text-zinc-900"
                                >
                                    Reset
                                </button>
                            }
                        >
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm font-medium text-zinc-700">
                                    <span>Ksh {priceRange[0].toLocaleString()}</span>
                                    <span>Ksh {priceRange[1].toLocaleString()}+</span>
                                </div>
                                <input
                                    type="range"
                                    min={0}
                                    max={maxAvailablePrice}
                                    step={100}
                                    value={priceRange[1]}
                                    onChange={(event) => setPriceRange([0, Number(event.target.value)])}
                                    className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-zinc-300 accent-black"
                                />
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1.5 text-zinc-500">
                                        Min: Ksh 0
                                    </span>
                                    <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1.5 text-zinc-500">
                                        Max: Ksh {priceRange[1].toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </FilterCard>

                        <FilterCard title="Brands">
                            <div className="space-y-2">
                                {brandOptions.map((brand) => {
                                    const checked = selectedBrands.includes(brand.name);
                                    return (
                                        <label
                                            key={brand.name}
                                            className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-zinc-50"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={() => toggleBrand(brand.name)}
                                                className="sr-only"
                                            />
                                            <span
                                                className={`inline-flex h-4 w-4 items-center justify-center rounded border ${
                                                    checked
                                                        ? "border-black bg-black text-white"
                                                        : "border-zinc-300 bg-white text-transparent"
                                                }`}
                                            >
                                                <Check className="h-3 w-3" />
                                            </span>
                                            <span className="text-sm text-zinc-700">{brand.name}</span>
                                            <span className="ml-auto text-xs text-zinc-400">{brand.count}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        </FilterCard>

                        <FilterCard title="Vehicle Type">
                            <div className="grid grid-cols-2 gap-2">
                                {bodyTypeOptions.map((bodyType) => (
                                    <button
                                        type="button"
                                        key={bodyType}
                                        onClick={() =>
                                            setSelectedBodyType((current) =>
                                                current === bodyType ? "all" : bodyType
                                            )
                                        }
                                        className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-2 text-xs transition-colors ${
                                            selectedBodyType === bodyType
                                                ? "border-black bg-black text-white"
                                                : "border-zinc-300 bg-zinc-50 text-zinc-600 hover:bg-zinc-100"
                                        }`}
                                    >
                                        {getBodyTypeIcon(bodyType)}
                                        <span>{bodyType}</span>
                                    </button>
                                ))}
                            </div>
                        </FilterCard>

                        <FilterCard title="Specifications">
                            <div className="space-y-4">
                                <div>
                                    <p className="mb-2 text-[11px] uppercase tracking-wide text-zinc-500">
                                        Transmission
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {(["all", "Automatic", "Manual"] as const).map((type) => (
                                            <button
                                                type="button"
                                                key={type}
                                                onClick={() => setSelectedTransmission(type)}
                                                className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                                                    selectedTransmission === type
                                                        ? "border-black bg-black text-white"
                                                        : "border-zinc-300 bg-zinc-50 text-zinc-600 hover:bg-zinc-100"
                                                }`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <p className="mb-2 text-[11px] uppercase tracking-wide text-zinc-500">Seats</p>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedSeats("all")}
                                            className={`inline-flex h-7 w-7 items-center justify-center rounded-full border text-xs transition-colors ${
                                                selectedSeats === "all"
                                                    ? "border-black bg-black text-white"
                                                    : "border-zinc-300 bg-zinc-50 text-zinc-600 hover:bg-zinc-100"
                                            }`}
                                        >
                                            *
                                        </button>
                                        {seatOptions.map((seatCount) => (
                                            <button
                                                type="button"
                                                key={seatCount}
                                                onClick={() => setSelectedSeats(seatCount)}
                                                className={`inline-flex h-7 w-7 items-center justify-center rounded-full border text-xs transition-colors ${
                                                    selectedSeats === seatCount
                                                        ? "border-black bg-black text-white"
                                                        : "border-zinc-300 bg-zinc-50 text-zinc-600 hover:bg-zinc-100"
                                                }`}
                                            >
                                                {seatCount}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <p className="mb-2 text-[11px] uppercase tracking-wide text-zinc-500">Fuel</p>
                                    <select
                                        value={selectedFuel}
                                        onChange={(event) =>
                                            setSelectedFuel(event.target.value as FuelType | "all")
                                        }
                                        className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-700 outline-none"
                                    >
                                        <option value="all">All types</option>
                                        <option value="Petrol">Petrol</option>
                                        <option value="Diesel">Diesel</option>
                                        <option value="Electric">Electric</option>
                                        <option value="Hybrid">Hybrid</option>
                                    </select>
                                </div>
                            </div>
                        </FilterCard>

                        <div className="pb-2 lg:hidden">
                            <button
                                type="button"
                                onClick={() => setShowFilters(false)}
                                className="inline-flex h-10 w-full items-center justify-center rounded-xl bg-black text-sm font-medium text-white"
                            >
                                View Results
                            </button>
                        </div>
                    </aside>

                    <div className="space-y-4">
                        <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                <div className="flex flex-wrap items-center gap-2">
                                    {selectedBodyType !== "all" && (
                                        <FilterChip
                                            label={selectedBodyType}
                                            onClear={() => setSelectedBodyType("all")}
                                        />
                                    )}
                                    {selectedFuel !== "all" && (
                                        <FilterChip
                                            label={selectedFuel}
                                            onClear={() => setSelectedFuel("all")}
                                        />
                                    )}
                                    {selectedTransmission !== "all" && (
                                        <FilterChip
                                            label={selectedTransmission}
                                            onClear={() => setSelectedTransmission("all")}
                                        />
                                    )}
                                    {selectedSeats !== "all" && (
                                        <FilterChip
                                            label={`${selectedSeats} seats`}
                                            onClear={() => setSelectedSeats("all")}
                                        />
                                    )}
                                    {selectedBrands.map((brand) => (
                                        <FilterChip
                                            key={brand}
                                            label={brand}
                                            onClear={() => toggleBrand(brand)}
                                        />
                                    ))}

                                    {activeFiltersCount === 0 && (
                                        <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-600">
                                            All Vehicles
                                        </span>
                                    )}

                                    {activeFiltersCount > 0 && (
                                        <button
                                            type="button"
                                            onClick={clearFilters}
                                            className="text-xs font-medium text-zinc-500 underline-offset-4 transition-colors hover:text-zinc-900 hover:underline"
                                        >
                                            Clear all filters
                                        </button>
                                    )}
                                </div>

                                <span className="text-sm text-zinc-500">
                                    {filteredCars.length} vehicle
                                    {filteredCars.length === 1 ? "" : "s"} available
                                </span>
                            </div>

                            <div className="relative mt-3">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                                <input
                                    type="text"
                                    placeholder="Search by make, model, or name..."
                                    value={searchQuery}
                                    onChange={(event) => setSearchQuery(event.target.value)}
                                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-3 text-sm text-zinc-800 outline-none placeholder:text-zinc-400 focus:border-zinc-400"
                                />
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                {Array.from({ length: CARS_PER_PAGE }, (_, index) => (
                                    <div
                                        key={`fleet-loading-${index}`}
                                        className="overflow-hidden rounded-2xl border border-zinc-200 bg-white"
                                    >
                                        <div className="aspect-[16/9] animate-pulse bg-zinc-200" />
                                        <div className="space-y-3 p-4">
                                            <div className="h-4 w-2/3 animate-pulse rounded bg-zinc-200" />
                                            <div className="h-3 w-1/2 animate-pulse rounded bg-zinc-100" />
                                            <div className="h-9 animate-pulse rounded-full bg-zinc-100" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : filteredCars.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                    {pagedCars.map((car, index) => (
                                        <FleetVehicleCard
                                            key={car.id}
                                            car={car}
                                            cardIndex={(currentPage - 1) * CARS_PER_PAGE + index}
                                        />
                                    ))}
                                </div>

                                <div className="flex items-center justify-center gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setCurrentPage((value) => Math.max(1, value - 1))}
                                        disabled={currentPage === 1}
                                        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-zinc-300 bg-white text-zinc-600 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>

                                    {pageNumbers.map((page, index) =>
                                        page === "..." ? (
                                            <span key={`ellipsis-${index}`} className="px-1 text-sm text-zinc-400">
                                                ...
                                            </span>
                                        ) : (
                                            <button
                                                type="button"
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={`inline-flex h-8 w-8 items-center justify-center rounded-full border text-sm transition-colors ${
                                                    currentPage === page
                                                        ? "border-black bg-black text-white"
                                                        : "border-zinc-300 bg-white text-zinc-600 hover:bg-zinc-50"
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        )
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => setCurrentPage((value) => Math.min(totalPages, value + 1))}
                                        disabled={currentPage === totalPages}
                                        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-zinc-300 bg-white text-zinc-600 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="rounded-2xl border border-zinc-200 bg-white px-6 py-16 text-center">
                                <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-500">
                                    <Search className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-semibold text-zinc-900">No vehicles found</h3>
                                <p className="mt-2 text-sm text-zinc-500">
                                    Try adjusting your filters to broaden your search.
                                </p>
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="mt-5 inline-flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
                                >
                                    <X className="h-4 w-4" />
                                    Reset Filters
                                </button>
                            </div>
                        )}
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}

interface FilterCardProps {
    title: string;
    children: ReactNode;
    action?: ReactNode;
}

function FilterCard({ title, children, action }: FilterCardProps) {
    return (
        <section className="rounded-2xl border border-zinc-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
                {action}
            </div>
            {children}
        </section>
    );
}

interface FilterChipProps {
    label: string;
    onClear: () => void;
}

function FilterChip({ label, onClear }: FilterChipProps) {
    return (
        <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-700 transition-colors hover:bg-zinc-200"
        >
            {label}
            <X className="h-3 w-3" />
        </button>
    );
}

interface FleetVehicleCardProps {
    car: Car;
    cardIndex: number;
}

function FleetVehicleCard({ car, cardIndex }: FleetVehicleCardProps) {
    const badge = getBadge(car, cardIndex);
    const primaryActionLabel = car.status === "available" && car.dailyPrice >= 20000 ? "Rent Now" : "View Details";

    return (
        <article className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
            <Link to={`/vehicles/${car.id}`} className="block p-2">
                <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-zinc-200">
                    <img
                        src={getImageUrl(car.mainImageUrl)}
                        alt={car.name}
                        className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.03]"
                        onError={(event) => {
                            event.currentTarget.src = "/placeholder-car.jpg";
                        }}
                    />
                    {badge && (
                        <span className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${badge.className}`}>
                            {badge.label}
                        </span>
                    )}
                </div>
            </Link>

            <div className="space-y-3 px-3 pb-3">
                <div className="grid grid-cols-[1fr_auto] gap-3">
                    <div>
                        <h3 className="text-base font-semibold leading-tight text-zinc-900">{car.name}</h3>
                        <p className="mt-1 text-xs text-zinc-500">{car.year} Model</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-semibold text-zinc-900">Ksh {car.dailyPrice.toLocaleString()}</p>
                        <p className="text-[11px] text-zinc-500">/day</p>
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-2 border-y border-zinc-100 py-2.5">
                    <SpecItem icon={<Star className="h-3.5 w-3.5 text-zinc-500" />} value={car.rating.toFixed(1)} />
                    <SpecItem icon={<Gauge className="h-3.5 w-3.5 text-zinc-500" />} value={compactMileage(car.mileage)} />
                    <SpecItem icon={<Users className="h-3.5 w-3.5 text-zinc-500" />} value={`${car.seatingCapacity}`} />
                    <SpecItem icon={<Fuel className="h-3.5 w-3.5 text-zinc-500" />} value={car.fuelType} />
                </div>

                <Link
                    to={`/vehicles/${car.id}`}
                    className={`inline-flex h-9 w-full items-center justify-center rounded-full border text-sm font-medium transition-colors ${
                        primaryActionLabel === "Rent Now"
                            ? "border-black bg-black text-white hover:bg-zinc-800"
                            : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"
                    }`}
                >
                    {primaryActionLabel}
                </Link>
            </div>
        </article>
    );
}

function SpecItem({ icon, value }: { icon: ReactNode; value: string }) {
    return (
        <div className="flex flex-col items-center gap-1 text-[11px] text-zinc-500">
            {icon}
            <span>{value}</span>
        </div>
    );
}

function compactMileage(mileage: string): string {
    const numericText = mileage.replace(/[^0-9]/g, "");
    const numericValue = Number(numericText);

    if (Number.isNaN(numericValue) || numericValue === 0) {
        return mileage;
    }

    if (numericValue >= 10000) {
        return `${Math.round(numericValue / 1000)}k`;
    }

    return `${(numericValue / 1000).toFixed(1)}k`;
}

function getBadge(car: Car, cardIndex: number) {
    if (car.status === "rented") {
        return { label: "Booked", className: "bg-zinc-900 text-white" };
    }

    if (car.dailyPrice >= 25000 || car.rating >= 4.8) {
        return { label: "Premium", className: "bg-zinc-900 text-white" };
    }

    if (car.fuelType === "Electric" || car.fuelType === "Hybrid") {
        return { label: "Eco", className: "bg-emerald-500 text-white" };
    }

    if (cardIndex % 3 === 1) {
        return { label: "Popular", className: "bg-amber-400 text-zinc-900" };
    }

    return null;
}

function getBodyTypeIcon(bodyType: BodyType) {
    if (bodyType === "SUV") {
        return <Truck className="h-4 w-4" />;
    }

    if (bodyType === "Coupe" || bodyType === "Convertible") {
        return <Sparkles className="h-4 w-4" />;
    }

    if (bodyType === "Hatchback") {
        return <CircleDot className="h-4 w-4" />;
    }

    if (bodyType === "Van" || bodyType === "Truck") {
        return <Truck className="h-4 w-4" />;
    }

    if (bodyType === "Sedan") {
        return <CarFront className="h-4 w-4" />;
    }

    return <CarIcon className="h-4 w-4" />;
}
