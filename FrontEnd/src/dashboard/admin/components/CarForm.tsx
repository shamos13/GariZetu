import React, {useState} from "react";
import {Button} from "../../../components/ui/button";
import {Input} from "../../../components/ui/input";
import {Label} from "../../../components/ui/label";
import {CarStatus, FuelType, TransmissionType} from "../types/Car.ts";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "../../../components/ui/select.tsx";

export type CarFormData = {
    make: string;
    registrationNumber: string;
    vehicleModel: string;
    year: number;
    engineCapacity: number;
    colour: string;
    mileage: number;
    dailyPrice: number;
    seatingCapacity: number;
    carStatus: CarStatus;
    transmissionType: TransmissionType;
    fuelType: FuelType;
}

interface CarFormProps {
    car?: CarFormData;
    onSubmit: (car: CarFormData) => void;
    onCancel: () => void;
}

export function CarForm({ car, onSubmit, onCancel }: CarFormProps) {
    const [formData, setFormData] = useState<CarFormData>({
        make: car?.make || "",
        registrationNumber: car?.registrationNumber || "",
        vehicleModel: car?.vehicleModel || "",
        year: car?.year || new Date().getFullYear(),
        engineCapacity: car?.engineCapacity || 1500,
        colour: car?.colour || "",
        mileage: car?.mileage || 100000,
        dailyPrice: car?.dailyPrice || 1000,
        seatingCapacity: car?.seatingCapacity || 5,
        carStatus: car?.carStatus || "AVAILABLE",
        transmissionType: car?.transmissionType || "AUTOMATIC",
        fuelType: car?.fuelType || "PETROL",

    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const handleChange = (field: keyof CarFormData, value: string | number) => {
        setFormData({ ...formData, [field]: value });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                {/* Make */}
                <div>
                    <Label htmlFor="make" className="text-gray-300">Car Make/Brand</Label>
                    <Input
                        id="make"
                        value={formData.make}
                        onChange={(e) => handleChange("make", e.target.value)}
                        placeholder="e.g., Audi"
                        className="bg-[#0a0a0a] border-gray-700 text-white placeholder:text-gray-500"
                        required
                    />
                </div>

                {/* Vehicle Model */}
                <div>
                    <Label htmlFor="vehicleModel" className="text-gray-300">Vehicle Model</Label>
                    <Input
                        id="vehicleModel"
                        value={formData.vehicleModel}
                        onChange={(e) => handleChange("vehicleModel", e.target.value)}
                        placeholder="e.g., A8 L"
                        className="bg-[#0a0a0a] border-gray-700 text-white"
                        required
                    />
                </div>

                {/* Registration Number */}
                <div>
                    <Label htmlFor="registrationNumber" className="text-gray-300">Registration Number</Label>
                    <Input
                        id="registrationNumber"
                        value={formData.registrationNumber}
                        onChange={(e) => handleChange("registrationNumber", e.target.value)}
                        placeholder="e.g., KBC123A"
                        className="bg-[#0a0a0a] border-gray-700 text-white"
                        required
                    />
                </div>

                {/* Year */}
                <div>
                    <Label htmlFor="year" className="text-gray-300">Year</Label>
                    <Input
                        id="year"
                        type="number"
                        value={formData.year}
                        onChange={(e) => handleChange("year", parseInt(e.target.value) || 0)}
                        min="2009"
                        max="2025"
                        className="bg-[#0a0a0a] border-gray-700 text-white"
                        required
                    />
                </div>

                {/* Engine Capacity */}
                <div>
                    <Label htmlFor="engineCapacity" className="text-gray-300">Engine Capacity (cc)</Label>
                    <Input
                        id="engineCapacity"
                        type="number"
                        value={formData.engineCapacity}
                        onChange={(e) => handleChange("engineCapacity", parseInt(e.target.value) || 0)}
                        min={500}
                        className="bg-[#0a0a0a] border-gray-700 text-white"
                        required
                    />
                </div>

                {/* Colour */}
                <div>
                    <Label htmlFor="colour" className="text-gray-300">Colour</Label>
                    <Input
                        id="colour"
                        value={formData.colour}
                        onChange={(e) => handleChange("colour", e.target.value)}
                        placeholder="e.g., Black"
                        className="bg-[#0a0a0a] border-gray-700 text-white"
                        required
                    />
                </div>

                {/* Mileage */}
                <div>
                    <Label htmlFor="mileage" className="text-gray-300">Mileage</Label>
                    <Input
                        id="mileage"
                        type="number"
                        value={formData.mileage}
                        onChange={(e) => handleChange("mileage", parseInt(e.target.value) || 0)}
                        min="0"
                        className="bg-[#0a0a0a] border-gray-700 text-white"
                        required
                    />
                </div>

                {/* Daily Price */}
                <div>
                    <Label htmlFor="dailyPrice" className="text-gray-300">Price (Ksh/day)</Label>
                    <Input
                        id="dailyPrice"
                        type="number"
                        value={formData.dailyPrice}
                        onChange={(e) => handleChange("dailyPrice", parseFloat(e.target.value) || 0)}
                        min="0"
                        step="100"
                        className="bg-[#0a0a0a] border-gray-700 text-white"
                        required
                    />
                </div>

                {/* Seating Capacity */}
                <div>
                    <Label htmlFor="seatingCapacity" className="text-gray-300">Seating Capacity</Label>
                    <Input
                        id="seatingCapacity"
                        type="number"
                        value={formData.seatingCapacity}
                        onChange={(e) => handleChange("seatingCapacity", parseInt(e.target.value) || 0)}
                        min={2}
                        max={9}
                        className="bg-[#0a0a0a] border-gray-700 text-white"
                        required
                    />
                </div>

                {/* Transmission Type */}
                <div>
                    <Label htmlFor="transmissionType" className="text-gray-300">Transmission</Label>
                    <Select
                        value={formData.transmissionType}
                        onValueChange={(value) => handleChange("transmissionType", value as TransmissionType)}
                    >
                        <SelectTrigger id="transmissionType" className="bg-[#0a0a0a] border-gray-700 text-white">
                            <SelectValue placeholder="Select transmission" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a1a1a] border-gray-700 text-white">
                            <SelectItem value="AUTOMATIC">Automatic</SelectItem>
                            <SelectItem value="MANUAL">Manual</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Fuel Type */}
                <div>
                    <Label htmlFor="fuelType" className="text-gray-300">Fuel Type</Label>
                    <Select
                        value={formData.fuelType}
                        onValueChange={(value) => handleChange("fuelType", value as FuelType)}
                    >
                        <SelectTrigger id="fuelType" className="bg-[#0a0a0a] border-gray-700 text-white">
                            <SelectValue placeholder="Select fuel type" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a1a1a] border-gray-700 text-white">
                            <SelectItem value="PETROL">Petrol</SelectItem>
                            <SelectItem value="DIESEL">Diesel</SelectItem>
                            <SelectItem value="ELECTRIC">Electric</SelectItem>
                            <SelectItem value="HYBRID">Hybrid</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Car Status */}
                <div>
                    <Label htmlFor="carStatus" className="text-gray-300">Car Status</Label>
                    <Select
                        value={formData.carStatus}
                        onValueChange={(value) => handleChange("carStatus", value as CarStatus)}
                    >
                        <SelectTrigger id="carStatus" className="bg-[#0a0a0a] border-gray-700 text-white">
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a1a1a] border-gray-700 text-white">
                            <SelectItem value="AVAILABLE">Available</SelectItem>
                            <SelectItem value="BOOKED">Booked</SelectItem>
                            <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="flex gap-3 justify-end pt-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel} // Use the onCancel prop
                    className="bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                >
                    Cancel
                </Button>
                <Button type="submit" className="bg-white text-black hover:bg-gray-200">
                    {car ? "Update Car" : "Add Car"}
                </Button>
            </div>
        </form>
    );
}