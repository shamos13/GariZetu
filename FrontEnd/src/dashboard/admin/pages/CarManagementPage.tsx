import { Car, CarStatus } from "../types/Car.ts";
import {
    Search,
    Plus,
    MoreVertical,
    Pencil,
    Trash2,
    Car as CarIcon,
    Gauge,
    Fuel,
    Users,
    Wrench,
    CircleCheckBig,
    KeyRound,
    Download,
    FilterX,
    ChevronDown,
    CalendarDays,
} from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";
import { Button } from "../../../components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu.tsx";
import { getImageUrl } from "../../../lib/ImageUtils.ts";
import { AdminCarDetailsModal } from "../components/AdminCarDetailsModal.tsx";
import { toast } from "sonner";

interface CarManagementPageProps {
    cars: Car[];
    onAdd: () => void;
    onEdit: (car: Car) => void;
    onDelete: (car: Car) => void;
    onStatusChange?: (car: Car, newStatus: Car["carStatus"]) => void;
}

export function CarManagementPage({ cars, onAdd, onEdit, onDelete, onStatusChange }: CarManagementPageProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | CarStatus>("all");
    const [bodyTypeFilter, setBodyTypeFilter] = useState<"all" | Car["bodyType"]>("all");
    const [transmissionFilter, setTransmissionFilter] = useState<"all" | Car["transmissionType"]>("all");
    const [selectedCar, setSelectedCar] = useState<Car | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const openDetails = (car: Car) => {
        setSelectedCar(car);
        setIsDetailsModalOpen(true);
    };

    const clearFilters = () => {
        const hadFilters =
            searchQuery.trim().length > 0 ||
            statusFilter !== "all" ||
            bodyTypeFilter !== "all" ||
            transmissionFilter !== "all";

        setSearchQuery("");
        setStatusFilter("all");
        setBodyTypeFilter("all");
        setTransmissionFilter("all");

        if (hadFilters) {
            toast.success("Fleet filters cleared.");
        }
    };

    const bodyTypeOptions = useMemo(
        () => Array.from(new Set(cars.map((car) => car.bodyType))).sort(),
        [cars]
    );

    const transmissionOptions = useMemo(
        () => Array.from(new Set(cars.map((car) => car.transmissionType))).sort(),
        [cars]
    );

    const filteredCars = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        return cars.filter((car) => {
            const matchesSearch =
                query.length === 0 ||
                car.make.toLowerCase().includes(query) ||
                car.vehicleModel.toLowerCase().includes(query) ||
                car.registrationNumber.toLowerCase().includes(query);
            const matchesStatus = statusFilter === "all" || car.carStatus === statusFilter;
            const matchesBodyType = bodyTypeFilter === "all" || car.bodyType === bodyTypeFilter;
            const matchesTransmission =
                transmissionFilter === "all" || car.transmissionType === transmissionFilter;

            return matchesSearch && matchesStatus && matchesBodyType && matchesTransmission;
        });
    }, [cars, searchQuery, statusFilter, bodyTypeFilter, transmissionFilter]);

    const statusCounts = useMemo(
        () => ({
            total: cars.length,
            available: cars.filter((car) => car.carStatus === "AVAILABLE").length,
            rented: cars.filter((car) => car.carStatus === "RENTED").length,
            maintenance: cars.filter((car) => car.carStatus === "MAINTENANCE").length,
        }),
        [cars]
    );

    const hasActiveFilters =
        searchQuery.trim().length > 0 ||
        statusFilter !== "all" ||
        bodyTypeFilter !== "all" ||
        transmissionFilter !== "all";

    const escapeCsvCell = (value: string | number) => {
        const normalized = String(value ?? "");
        if (!/[",\n]/.test(normalized)) return normalized;
        return `"${normalized.replace(/"/g, "\"\"")}"`;
    };

    const handleExport = () => {
        if (filteredCars.length === 0) {
            toast.info("No vehicles match your current filters.");
            return;
        }

        const headers = [
            "ID",
            "Make",
            "Model",
            "Year",
            "Registration",
            "Status",
            "Body Type",
            "Transmission",
            "Fuel",
            "Mileage",
            "Daily Price",
        ];

        const rows = filteredCars.map((car) => [
            car.carId,
            car.make,
            car.vehicleModel,
            car.year,
            car.registrationNumber,
            car.carStatus,
            car.bodyType,
            car.transmissionType,
            car.fuelType,
            car.mileage,
            car.dailyPrice,
        ]);

        const csv = [headers, ...rows]
            .map((row) => row.map((value) => escapeCsvCell(value)).join(","))
            .join("\n");

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `fleet-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success(`Exported ${filteredCars.length} vehicle${filteredCars.length === 1 ? "" : "s"} to CSV.`);
    };

    const getStatusConfig = (status: CarStatus) => {
        if (status === "AVAILABLE") {
            return {
                label: "Available",
                badge: "border-emerald-500/30 bg-emerald-500/20 text-emerald-300",
                summaryIcon: "bg-emerald-500/20 text-emerald-300",
            };
        }
        if (status === "RENTED") {
            return {
                label: "Rented",
                badge: "border-blue-500/30 bg-blue-500/20 text-blue-300",
                summaryIcon: "bg-blue-500/20 text-blue-300",
            };
        }
        return {
            label: "Maintenance",
            badge: "border-amber-500/30 bg-amber-500/20 text-amber-300",
            summaryIcon: "bg-amber-500/20 text-amber-300",
        };
    };

    const formatUpdatedDate = (updatedAt: string) => {
        const date = new Date(updatedAt);
        if (Number.isNaN(date.getTime())) return "Updated recently";
        return date.toLocaleDateString("en-KE", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    return (
        <div className="space-y-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-gray-500">Fleet Control</p>
                    <h2 className="mt-1 text-3xl text-white">Vehicle Management</h2>
                    <p className="mt-1 text-sm text-gray-400">
                        Manage inventory, track availability, and update fleet status from one place.
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <Button
                        onClick={handleExport}
                        disabled={filteredCars.length === 0}
                        className="bg-[#1a1a1a] border border-gray-700 text-gray-200 hover:bg-[#232323] disabled:opacity-50"
                    >
                        <Download className="w-4 h-4" />
                        Export
                    </Button>
                    <Button onClick={onAdd} className="bg-white text-black hover:bg-gray-200 gap-2">
                        <Plus className="w-4 h-4" />
                        Add Vehicle
                    </Button>
                </div>
            </div>

            <section className="rounded-2xl border border-gray-800 bg-[#141414] p-4 lg:p-5">
                <p className="text-[11px] uppercase tracking-wider text-gray-500">Search Fleet</p>
                <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                    <div className="md:col-span-2">
                        <div className="flex h-10 items-center gap-2 rounded-lg border border-gray-700 bg-[#101010] px-3">
                            <Search className="h-4 w-4 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search by make, model, or plate..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
                            />
                        </div>
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as "all" | CarStatus)}
                        className="h-10 rounded-lg border border-gray-700 bg-[#101010] px-3 text-sm text-gray-200 outline-none"
                    >
                        <option value="all">All Statuses</option>
                        <option value="AVAILABLE">Available</option>
                        <option value="RENTED">Rented</option>
                        <option value="MAINTENANCE">Maintenance</option>
                    </select>

                    <select
                        value={bodyTypeFilter}
                        onChange={(e) => setBodyTypeFilter(e.target.value as "all" | Car["bodyType"])}
                        className="h-10 rounded-lg border border-gray-700 bg-[#101010] px-3 text-sm text-gray-200 outline-none"
                    >
                        <option value="all">All Body Types</option>
                        {bodyTypeOptions.map((bodyType) => (
                            <option key={bodyType} value={bodyType}>
                                {bodyType}
                            </option>
                        ))}
                    </select>

                    <div className="flex gap-2">
                        <select
                            value={transmissionFilter}
                            onChange={(e) =>
                                setTransmissionFilter(e.target.value as "all" | Car["transmissionType"])
                            }
                            className="h-10 flex-1 rounded-lg border border-gray-700 bg-[#101010] px-3 text-sm text-gray-200 outline-none"
                        >
                            <option value="all">Any Transmission</option>
                            {transmissionOptions.map((transmission) => (
                                <option key={transmission} value={transmission}>
                                    {transmission}
                                </option>
                            ))}
                        </select>
                        <Button
                            variant="outline"
                            onClick={clearFilters}
                            className="h-10 border-gray-700 bg-[#101010] text-gray-300 hover:bg-[#1a1a1a] hover:text-white"
                        >
                            <FilterX className="w-4 h-4" />
                            Clear
                        </Button>
                    </div>
                </div>
            </section>

            <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                <StatusSummaryCard
                    icon={<CarIcon className="h-4 w-4" />}
                    iconClasses="bg-blue-500/20 text-blue-300"
                    label="Total Fleet"
                    value={`${statusCounts.total} Vehicles`}
                />
                <StatusSummaryCard
                    icon={<CircleCheckBig className="h-4 w-4" />}
                    iconClasses={getStatusConfig("AVAILABLE").summaryIcon}
                    label="Available Now"
                    value={`${statusCounts.available} Vehicles`}
                />
                <StatusSummaryCard
                    icon={<KeyRound className="h-4 w-4" />}
                    iconClasses={getStatusConfig("RENTED").summaryIcon}
                    label="Currently Rented"
                    value={`${statusCounts.rented} Vehicles`}
                />
                <StatusSummaryCard
                    icon={<Wrench className="h-4 w-4" />}
                    iconClasses={getStatusConfig("MAINTENANCE").summaryIcon}
                    label="Maintenance"
                    value={`${statusCounts.maintenance} Vehicles`}
                />
            </section>

            {filteredCars.length > 0 ? (
                <>
                    <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {filteredCars.map((car) => {
                            const status = getStatusConfig(car.carStatus);

                            return (
                                <article
                                    key={car.carId}
                                    className="group overflow-hidden rounded-2xl border border-gray-800 bg-[#141414] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/20"
                                >
                                    <button
                                        type="button"
                                        className="w-full text-left"
                                        onClick={() => openDetails(car)}
                                    >
                                        <div className="relative aspect-[16/10] overflow-hidden bg-[#0d0d0d]">
                                            <img
                                                src={getImageUrl(car.mainImageUrl)}
                                                alt={`${car.make} ${car.vehicleModel}`}
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                                                onError={(e) => {
                                                    e.currentTarget.src = "/placeholder-car.jpg";
                                                }}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                                            <div className="absolute left-3 top-3">
                                                <span className="rounded-md border border-white/15 bg-black/45 px-2 py-1 text-[10px] font-medium tracking-wide text-gray-200 backdrop-blur-sm">
                                                    {car.registrationNumber}
                                                </span>
                                            </div>

                                            <div
                                                className="absolute right-3 top-3"
                                                onClick={(event) => event.stopPropagation()}
                                            >
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <button
                                                            type="button"
                                                            className="rounded-lg border border-white/20 bg-black/45 p-2 text-gray-200 backdrop-blur-sm transition-colors hover:bg-black/70"
                                                        >
                                                            <MoreVertical className="h-4 w-4" />
                                                        </button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent className="border-gray-800 bg-[#1a1a1a] text-gray-200">
                                                        <DropdownMenuItem
                                                            className="cursor-pointer hover:bg-gray-800"
                                                            onSelect={() => onEdit(car)}
                                                        >
                                                            <Pencil className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="cursor-pointer text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                                            onSelect={() => onDelete(car)}
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>

                                            <div className="absolute bottom-3 left-3">
                                                <span className="rounded-md border border-black/60 bg-black/70 px-2 py-1 text-xs font-medium text-gray-100">
                                                    Ksh {car.dailyPrice.toLocaleString()}/day
                                                </span>
                                            </div>

                                            <div className="absolute bottom-3 right-3">
                                                <span
                                                    className={`rounded-md border px-2 py-1 text-[11px] font-medium ${status.badge}`}
                                                >
                                                    {status.label}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-4 p-4">
                                            <div>
                                                <h3 className="text-lg font-semibold text-white">
                                                    {car.make} {car.vehicleModel} {car.year}
                                                </h3>
                                                <p className="text-sm text-gray-400">
                                                    {car.bodyType} · {car.transmissionType.toLowerCase()}
                                                </p>
                                            </div>

                                            <div className="space-y-2 text-sm text-gray-400">
                                                <div className="flex items-center gap-2">
                                                    <Gauge className="h-4 w-4 text-gray-500" />
                                                    <span>{car.mileage.toLocaleString()} km</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Fuel className="h-4 w-4 text-gray-500" />
                                                    <span>{car.fuelType} · {car.engineCapacity}L engine</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Users className="h-4 w-4 text-gray-500" />
                                                    <span>{car.seatingCapacity} seats · {car.colour}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <CalendarDays className="h-4 w-4 text-gray-500" />
                                                    <span>{formatUpdatedDate(car.updatedAt)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </button>

                                    <div className="grid grid-cols-[1fr_auto] gap-2 border-t border-gray-800 p-4 pt-3">
                                        <Button
                                            size="sm"
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                onEdit(car);
                                            }}
                                            className="bg-white text-black hover:bg-gray-200"
                                        >
                                            Edit Details
                                        </Button>

                                        {onStatusChange && (
                                            <div onClick={(event) => event.stopPropagation()}>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <button
                                                            type="button"
                                                            className="inline-flex h-9 items-center gap-1 rounded-lg border border-gray-700 bg-[#101010] px-3 text-xs font-medium text-gray-200 transition-colors hover:bg-[#1a1a1a]"
                                                        >
                                                            {status.label}
                                                            <ChevronDown className="h-3.5 w-3.5" />
                                                        </button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent
                                                        align="end"
                                                        className="border-gray-800 bg-[#1a1a1a] text-gray-200"
                                                    >
                                                        {(["AVAILABLE", "RENTED", "MAINTENANCE"] as CarStatus[]).map(
                                                            (nextStatus) => (
                                                                <DropdownMenuItem
                                                                    key={nextStatus}
                                                                    className="cursor-pointer hover:bg-gray-800"
                                                                    onSelect={() => onStatusChange(car, nextStatus)}
                                                                >
                                                                    {getStatusConfig(nextStatus).label}
                                                                    {car.carStatus === nextStatus && (
                                                                        <span className="ml-2 text-emerald-400">(current)</span>
                                                                    )}
                                                                </DropdownMenuItem>
                                                            )
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        )}
                                    </div>
                                </article>
                            );
                        })}

                        <button
                            type="button"
                            onClick={onAdd}
                            className="group flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-700 bg-[#121212] p-6 text-center transition-colors hover:border-gray-500 hover:bg-[#161616]"
                        >
                            <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#1e1e1e] text-gray-300 transition-colors group-hover:bg-[#262626] group-hover:text-white">
                                <Plus className="h-6 w-6" />
                            </span>
                            <p className="text-lg font-semibold text-white">Add New Vehicle</p>
                            <p className="mt-2 max-w-[220px] text-sm text-gray-400">
                                Expand your fleet by adding another vehicle to the system.
                            </p>
                        </button>
                    </section>

                    <section className="flex flex-col gap-3 rounded-xl border border-gray-800 bg-[#141414] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-gray-400">
                            Showing {filteredCars.length === 0 ? 0 : 1}-{filteredCars.length} of {cars.length} vehicles
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                            {hasActiveFilters && (
                                <span className="rounded-full border border-gray-700 bg-[#101010] px-3 py-1 text-gray-400">
                                    {filteredCars.length} match filters
                                </span>
                            )}
                            <span className="rounded-full border border-gray-700 bg-[#101010] px-3 py-1 text-gray-500">
                                Live inventory view
                            </span>
                        </div>
                    </section>
                </>
            ) : (
                <div className="rounded-2xl border border-gray-800 bg-[#141414] px-6 py-12 text-center">
                    <CarIcon className="mx-auto h-12 w-12 text-gray-600" />
                    <h3 className="mt-4 text-xl font-semibold text-white">No vehicles match your filters</h3>
                    <p className="mt-2 text-gray-400">
                        Try adjusting your search criteria or add a new vehicle to the fleet.
                    </p>
                    <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                        {hasActiveFilters && (
                            <Button
                                variant="outline"
                                onClick={clearFilters}
                                className="border-gray-700 bg-[#101010] text-gray-300 hover:bg-[#1a1a1a] hover:text-white"
                            >
                                <FilterX className="w-4 h-4" />
                                Clear Filters
                            </Button>
                        )}
                        <Button onClick={onAdd} className="bg-white text-black hover:bg-gray-200">
                            <Plus className="w-4 h-4" />
                            Add Vehicle
                        </Button>
                    </div>
                </div>
            )}

            <AdminCarDetailsModal
                car={selectedCar}
                isOpen={isDetailsModalOpen}
                onClose={() => {
                    setIsDetailsModalOpen(false);
                    setSelectedCar(null);
                }}
                onEdit={(car) => {
                    setIsDetailsModalOpen(false);
                    onEdit(car);
                }}
                onStatusChange={onStatusChange}
            />
        </div>
    );
}

interface StatusSummaryCardProps {
    icon: ReactNode;
    iconClasses: string;
    label: string;
    value: string;
}

function StatusSummaryCard({ icon, iconClasses, label, value }: StatusSummaryCardProps) {
    return (
        <article className="rounded-xl border border-gray-800 bg-[#141414] p-4">
            <div className="flex items-center gap-3">
                <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${iconClasses}`}>
                    {icon}
                </span>
                <div>
                    <p className="text-xs text-gray-500">{label}</p>
                    <p className="text-lg font-semibold text-white">{value}</p>
                </div>
            </div>
        </article>
    );
}
