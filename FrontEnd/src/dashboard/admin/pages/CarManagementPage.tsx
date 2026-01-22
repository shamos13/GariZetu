import { Car, CarStatus } from "../types/Car.ts";
import { Search, Plus, MoreVertical, Pencil, Trash2, Car as CarIcon, Gauge, Settings, Fuel, Users } from "lucide-react";
import { useState } from "react";
import { Button } from "../../../components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu.tsx";
import {getImageUrl} from "../../../lib/ImageUtils.ts";
import { AdminCarDetailsModal } from "../components/AdminCarDetailsModal.tsx";

interface CarManagementPageProps {
    cars: Car[];
    onAdd: () => void;
    onEdit: (car: Car) => void;
    onDelete: (car: Car) => void;
    onStatusChange?: (car: Car, newStatus: Car["carStatus"]) => void;
}

export function CarManagementPage({ cars, onAdd, onEdit, onDelete, onStatusChange }: CarManagementPageProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedCar, setSelectedCar] = useState<Car | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const filteredCars = cars.filter((car) => {
        const matchesSearch = car.make.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus =
            statusFilter === "all" ||
            (statusFilter === "available" && car.carStatus === "AVAILABLE") ||
            (statusFilter === "unavailable" && car.carStatus !== "AVAILABLE");
        return matchesSearch && matchesStatus;
    });

    return (
            <div className="space-y-6">
                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full sm:w-auto">
                        {/* Search */}
                        <div
                            className="flex items-center gap-2 bg-[#1a1a1a] border border-gray-800 rounded-lg px-4 py-2 flex-1 sm:max-w-xs">
                            <Search className="w-4 h-4 text-gray-500"/>
                            <input
                                type="text"
                                placeholder="Search cars..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-transparent border-none outline-none text-sm text-white placeholder:text-gray-500 w-full"
                            />
                        </div>

                        {/* Status Filter */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-[#1a1a1a] border border-gray-800 rounded-lg px-4 py-2 text-sm text-white outline-none"
                        >
                            <option value="all">All Status</option>
                            <option value="available">Available</option>
                            <option value="unavailable">Unavailable</option>
                        </select>
                    </div>

                    {/* Add Car Button */}
                    <Button onClick={onAdd}
                        className="bg-white text-black hover:bg-gray-200 gap-2 w-full sm:w-auto">
                        <Plus className="w-4 h-4"/>
                        Add Car
                    </Button>
                </div>

                {/* Cars Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCars.map((car) => (
                        <div
                            key={car.carId}
                            className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
                            onClick={() => {
                                setSelectedCar(car);
                                setIsDetailsModalOpen(true);
                            }}
                        >
                            {/* Image */}
                            <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                                <img
                                    src={getImageUrl(car.mainImageUrl)}
                                    alt={`${car.make} ${car.vehicleModel}`}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    onError={(e) => {
                                        e.currentTarget.src = "/placeholder-car.jpg";
                                    }}
                                />
                                
                                {/* Status Badge */}
                                <div className="absolute top-3 left-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                        car.carStatus === "AVAILABLE" 
                                            ? "bg-emerald-500 text-white" 
                                            : car.carStatus === "RENTED"
                                            ? "bg-blue-500 text-white"
                                            : "bg-yellow-500 text-white"
                                    }`}>
                                        {car.carStatus === "AVAILABLE" ? "Available" : car.carStatus === "RENTED" ? "Rented" : "Maintenance"}
                                    </span>
                                </div>
                                
                                {/* Menu Button */}
                                <div className="absolute top-3 right-3" onClick={(e) => e.stopPropagation()}>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="p-2 bg-white/90 backdrop-blur-sm hover:bg-white rounded-lg transition-colors">
                                                <MoreVertical className="w-4 h-4 text-gray-700"/>
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="bg-white border-gray-200">
                                            <DropdownMenuItem
                                                className="text-gray-700 hover:text-gray-900 hover:bg-gray-50 cursor-pointer"
                                                onSelect={() => onEdit(car)}
                                            >
                                                <Pencil className="w-4 h-4 mr-2"/>
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                                                onSelect={() => onDelete(car)}
                                            >
                                                <Trash2 className="w-4 h-4 mr-2"/>
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                            
                            {/* Content */}
                            <div className="p-5">
                                {/* Header */}
                                <div className="mb-3">
                                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{car.bodyType}</p>
                                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-gray-700 transition-colors">
                                        {car.make} {car.vehicleModel} {car.year}
                                    </h3>
                                </div>
                                
                                {/* Specs */}
                                <div className="grid grid-cols-4 gap-2 py-4 border-t border-b border-gray-100">
                                    <div className="flex flex-col items-center gap-1">
                                        <Gauge className="w-4 h-4 text-gray-400" />
                                        <span className="text-[10px] text-gray-500 uppercase">{car.mileage.toLocaleString()} km</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-1">
                                        <Settings className="w-4 h-4 text-gray-400" />
                                        <span className="text-[10px] text-gray-500 uppercase">{car.transmissionType.slice(0, 4)}</span>
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
                        </div>
                    ))}
                </div>

                {/* Car Details Modal */}
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

                {filteredCars.length === 0 && (
                    <div className="text-center py-12 bg-[#141414] border border-gray-800 rounded-lg">
                        <CarIcon className="w-12 h-12 text-gray-600 mx-auto mb-4"/>
                        <p className="text-gray-400">No cars found</p>
                    </div>
                )}
            </div>
        );

}