import { Car, CarStatus } from "../types/Car.ts";
import { Search, Plus, MoreVertical, Pencil, Trash2, Car as CarIcon, CheckCircle2, XCircle, Wrench } from "lucide-react";
import { useState } from "react";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge.tsx";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu.tsx";
import {getImageUrl} from "../../../lib/ImageUtils.ts";

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
    const filteredCars = cars.filter((car) => {
        const matchesSearch = car.make.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus =
            statusFilter === "all" ||
            (statusFilter === "available" && car.carStatus === "AVAILABLE") ||
            (statusFilter === "unavailable" && car.carStatus !== "AVAILABLE");
        return matchesSearch && matchesStatus;
    });

    const getCarStatusBadge = (car: Car) => {
        const statusConfig = {
            AVAILABLE: {
                bg: "bg-green-500/20",
                text: "text-green-400",
                border: "border-green-500/30",
                label: "Available",
                icon: CheckCircle2
            },
            RENTED: {
                bg: "bg-blue-500/20",
                text: "text-blue-400",
                border: "border-blue-500/30",
                label: "Rented",
                icon: XCircle
            },
            MAINTENANCE: {
                bg: "bg-yellow-500/20",
                text: "text-yellow-400",
                border: "border-yellow-500/30",
                label: "Maintenance",
                icon: Wrench
            }
        };

        const config = statusConfig[car.carStatus] || statusConfig.AVAILABLE;
        const Icon = config.icon;

        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Badge className={`absolute top-3 right-3 ${config.bg} ${config.text} ${config.border} cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-1`}>
                        <Icon className="w-3 h-3" />
                        {config.label}
                    </Badge>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-[#1a1a1a] border-gray-800" align="end">
                    {car.carStatus !== "AVAILABLE" && (
                        <DropdownMenuItem
                            className="text-green-400 hover:text-green-300 hover:bg-gray-800 cursor-pointer"
                            onSelect={() => onStatusChange?.(car, "AVAILABLE")}
                        >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Mark as Available
                        </DropdownMenuItem>
                    )}
                    {car.carStatus !== "RENTED" && (
                        <DropdownMenuItem
                            className="text-blue-400 hover:text-blue-300 hover:bg-gray-800 cursor-pointer"
                            onSelect={() => onStatusChange?.(car, "RENTED")}
                        >
                            <XCircle className="w-4 h-4 mr-2" />
                            Mark as Rented
                        </DropdownMenuItem>
                    )}
                    {car.carStatus !== "MAINTENANCE" && (
                        <DropdownMenuItem
                            className="text-yellow-400 hover:text-yellow-300 hover:bg-gray-800 cursor-pointer"
                            onSelect={() => onStatusChange?.(car, "MAINTENANCE")}
                        >
                            <Wrench className="w-4 h-4 mr-2" />
                            Mark as Maintenance
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        );
    }


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
                            className="bg-[#141414] border border-gray-800 rounded-lg overflow-hidden hover:border-gray-700 transition-colors group"
                        >
                            {/* Car Image */}
                            <div className="relative h-48">
                                <img
                                    src={getImageUrl(car.mainImageUrl)}
                                    alt={car.make}
                                    className="w-full h-full object-cover"
                                />
                                {getCarStatusBadge(car)}

                                {/* Menu Button */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button
                                            className="absolute top-3 left-3 p-2 bg-black/50 hover:bg-black/70 rounded-lg transition-colors">
                                            <MoreVertical className="w-4 h-4 text-white"/>
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="bg-[#1a1a1a] border-gray-800">
                                        <DropdownMenuItem
                                            className="text-gray-300 hover:text-white hover:bg-gray-800 cursor-pointer"
                                            onSelect={() => onEdit(car)}
                                        >
                                            <Pencil className="w-4 h-4 mr-2"/>
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="text-red-400 hover:text-red-300 hover:bg-gray-800 cursor-pointer"
                                            onSelect={() => onDelete(car)}
                                        >
                                            <Trash2 className="w-4 h-4 mr-2"/>
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            {/* Car Details */}
                            <div className="p-4">
                                <p className="text-xs text-gray-500 mb-1">{car.vehicleModel}</p>
                                <h3 className="text-white mb-2">{car.make}</h3>
                                <p className="text-white text-lg mb-4">
                                    Ksh {car.dailyPrice.toLocaleString()}
                                    <span className="text-gray-400 text-sm">/day</span>
                                </p>

                                {/* Specs */}
                                <div className="flex items-center gap-4 text-xs text-gray-400">
                                    <div className="flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                  d="M13 10V3L4 14h7v7l9-11h-7z"/>
                                        </svg>
                                        <span>{Math.floor(Math.random() * 10000 + 1000)} km</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/>
                                        </svg>
                                        <span>{car.transmissionType}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                                        </svg>
                                        <span>{car.seatingCapacity} Person</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredCars.length === 0 && (
                    <div className="text-center py-12 bg-[#141414] border border-gray-800 rounded-lg">
                        <CarIcon className="w-12 h-12 text-gray-600 mx-auto mb-4"/>
                        <p className="text-gray-400">No cars found</p>
                    </div>
                )}
            </div>
        );

}