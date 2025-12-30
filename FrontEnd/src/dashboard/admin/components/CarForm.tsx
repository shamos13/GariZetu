import React, {useState} from "react";
import {Button} from "../../../components/ui/button";
import {Input} from "../../../components/ui/input";
import {Label} from "../../../components/ui/label";
import {CarStatus, FuelType, TransmissionType} from "../types/Car.ts";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "../../../components/ui/select.tsx";
import {Upload, X} from "lucide-react";

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
    onSubmit: (car: CarFormData, image: File | null) => void | Promise<void>;
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
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate if   image is selected
        if(!selectedImage){
            alert("please select a car image")
            return;
        }
        onSubmit(formData, selectedImage);

    };

    const handleChange = (field: keyof CarFormData, value: string | number) => {
        setFormData({ ...formData, [field]: value });
    };

    //Handle image selection
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]

        if (file) {

            //Validate file type
            if (!file.type.startsWith('image')){
                alert("Please select an image file")
                return;
            }

            // Validate file size (10mb)
            const maxSize = 10*1024*1024;
            if (file.size > maxSize){
                alert("Image sie must be less than 10mb");
                return;
            }

            setSelectedImage(file);

            // Create a preview URL
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
        }
    };

    // Clear Selected image
    const handleClearImage = () => {
        setSelectedImage(null);
        setImagePreview(null);

        //Reset file input
        const fileInput = document.getElementById('image') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* NEW: Image Upload Section */}
            <div className="space-y-3">
                <Label htmlFor="image" className="text-gray-300">Car Image *</Label>

                {/* Image Preview or Upload Button */}
                {imagePreview ? (
                    <div className="relative">
                        <img
                            src={imagePreview}
                            alt="Car preview"
                            className="w-full h-48 object-cover rounded-lg border border-gray-700"
                        />
                        <button
                            type="button"
                            onClick={handleClearImage}
                            className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 rounded-full transition-colors"
                        >
                            <X className="w-4 h-4 text-white" />
                        </button>
                        <div className="mt-2 text-sm text-gray-400">
                            {selectedImage?.name} ({(selectedImage!.size / 1024 / 1024).toFixed(2)} MB)
                        </div>
                    </div>
                ) : (
                    <label
                        htmlFor="image"
                        className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-700 border-dashed rounded-lg cursor-pointer bg-[#0a0a0a] hover:bg-[#141414] transition-colors"
                    >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-10 h-10 text-gray-500 mb-3" />
                            <p className="mb-2 text-sm text-gray-400">
                                <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-gray-500">PNG, JPG or WEBP (MAX. 10MB)</p>
                        </div>
                        <input
                            id="image"
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            onChange={handleImageChange}
                            className="hidden"
                            required
                        />
                    </label>
                )}
            </div>
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