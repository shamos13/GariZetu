import React, {useEffect, useState} from "react";
import {Button} from "../../../components/ui/button";
import {Input} from "../../../components/ui/input";
import {Label} from "../../../components/ui/label";
import {CarStatus, FuelType, TransmissionType, BodyType} from "../types/Car.ts";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "../../../components/ui/select.tsx";
import {Plus, Upload, X} from "lucide-react";
import axios from "axios";
import { getImageUrl } from "../../../lib/ImageUtils.ts";

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
    bodyType: BodyType;
    description: string;
    featureName: string[];
    // Optional existing image URL (used when editing)
    mainImageUrl?: string;
}

interface Feature {
    featureId: number;
    featureName: string;
    featureDescription: string;
    featureCategory: string;
}

interface CarFormProps {
    car?: CarFormData;
    onSubmit: (car: CarFormData, image: File | null) => void | Promise<void>;
    onCancel: () => void;
}

export function CarForm({ car, onSubmit, onCancel }: CarFormProps) {
    // Store original values for dirty tracking (only when editing)
    const originalValues = car ? {
        make: car.make,
        registrationNumber: car.registrationNumber,
        vehicleModel: car.vehicleModel,
        year: car.year,
        engineCapacity: car.engineCapacity,
        colour: car.colour,
        mileage: car.mileage,
        dailyPrice: car.dailyPrice,
        seatingCapacity: car.seatingCapacity,
        carStatus: car.carStatus,
        transmissionType: car.transmissionType,
        fuelType: car.fuelType,
        bodyType: car.bodyType,
        description: car.description || "",
        featureName: car.featureName || [],
        hasImage: !!car.mainImageUrl,
    } : null;

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
        bodyType: car?.bodyType || "SEDAN",
        description: car?.description || "",
        featureName: car?.featureName || [],
        mainImageUrl: car?.mainImageUrl,
    });

    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(
        car?.mainImageUrl ? getImageUrl(car.mainImageUrl) : null
    );

    // Features state
    const [availableFeatures, setAvailableFeatures] = useState<Feature[]>([]);
    const [selectedFeatures, setSelectedFeatures] = useState<string[]>(car?.featureName || []);
    const [customFeature, setCustomFeature] = useState("");
    const [isLoadingFeatures, setIsLoadingFeatures] = useState(false);

    // Helper function to check if a field is dirty (changed from original)
    const isFieldDirty = (fieldName: keyof CarFormData): boolean => {
        if (!originalValues || !car) return false; // Not editing, so no dirty fields
        
        const currentValue = formData[fieldName];
        const originalValue = originalValues[fieldName as keyof typeof originalValues];
        
        // Special handling for arrays (features)
        if (fieldName === 'featureName') {
            const currentFeatures = selectedFeatures.sort().join(',');
            const originalFeatures = (originalValues.featureName || []).sort().join(',');
            return currentFeatures !== originalFeatures;
        }
        
        // Special handling for image
        if (fieldName === 'mainImageUrl') {
            return selectedImage !== null; // Image changed if a new file is selected
        }
        
        return currentValue !== originalValue;
    };

    // Get count of dirty fields
    const getDirtyFieldsCount = (): number => {
        if (!originalValues || !car) return 0;
        
        const fields: (keyof CarFormData)[] = [
            'make', 'registrationNumber', 'vehicleModel', 'year', 'engineCapacity',
            'colour', 'mileage', 'dailyPrice', 'seatingCapacity', 'carStatus',
            'transmissionType', 'fuelType', 'bodyType', 'description', 'featureName', 'mainImageUrl'
        ];
        
        return fields.filter(field => isFieldDirty(field)).length;
    };

    // Load available features on mount
    useEffect(() => {
        const loadFeatures = async () => {
            try {
                setIsLoadingFeatures(true);
                const response = await axios.get<Feature[]>("http://localhost:8080/api/v1/features");
                setAvailableFeatures(response.data);
            } catch (error) {
                console.error("Failed to load features:", error);
            } finally {
                setIsLoadingFeatures(false);
            }
        };
        loadFeatures();
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const isEdit = !!car;

        // For create, require an image; for edit, image is optional
        if (!isEdit && !selectedImage) {
            alert("Please select a car image");
            return;
        }

        // Optional: Only validate max length if description is provided
        if (formData.description && formData.description.length > 1000) {
            alert("Description must not exceed 1000 characters");
            return;
        }

        // Add selected features to formData (can be empty array)
        const dataToSubmit = {
            ...formData,
            featureName: selectedFeatures
        };

        onSubmit(dataToSubmit, selectedImage);
    };

    const handleChange = (field: keyof CarFormData, value: string | number | string[]) => {
        setFormData({ ...formData, [field]: value });
    };

    // Helper to get field border color based on dirty state
    const getFieldBorderClass = (fieldName: keyof CarFormData): string => {
        const isDirty = isFieldDirty(fieldName);
        if (!isDirty) return "border-gray-700";
        return "border-blue-500 border-2"; // Highlight changed fields with blue border
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file) {
            if (!file.type.startsWith('image')) {
                alert("Please select an image file");
                return;
            }

            const maxSize = 10 * 1024 * 1024;
            if (file.size > maxSize) {
                alert("Image size must be less than 10mb");
                return;
            }

            setSelectedImage(file);
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
        }
    };

    const handleClearImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        const fileInput = document.getElementById('image') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    };

    // Feature handlers
    const toggleFeature = (featureName: string) => {
        if (selectedFeatures.includes(featureName)) {
            setSelectedFeatures(selectedFeatures.filter(f => f !== featureName));
        } else {
            setSelectedFeatures([...selectedFeatures, featureName]);
        }
    };

    const addCustomFeature = () => {
        const trimmed = customFeature.trim();
        if (!trimmed) {
            alert("Please enter a feature name");
            return;
        }
        if (selectedFeatures.includes(trimmed)) {
            alert("This feature is already added");
            return;
        }
        setSelectedFeatures([...selectedFeatures, trimmed]);
        setCustomFeature("");
    };

    const removeFeature = (featureName: string) => {
        setSelectedFeatures(selectedFeatures.filter(f => f !== featureName));
    };

    const descriptionLength = formData.description.length;
    const descriptionStatus =
        descriptionLength === 0 ? "empty" :
            descriptionLength > 1000 ? "too-long" : "valid";

    const dirtyCount = getDirtyFieldsCount();
    const isEditMode = !!car;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Dirty Fields Indicator */}
            {isEditMode && dirtyCount > 0 && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-blue-400">
                        {dirtyCount} field{dirtyCount !== 1 ? 's' : ''} modified
                    </span>
                </div>
            )}

            {/* Image Upload */}
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <Label htmlFor="image" className="text-gray-300">Car Image *</Label>
                    {isFieldDirty('mainImageUrl') && (
                        <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">Modified</span>
                    )}
                </div>
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
                        {selectedImage && (
                            <div className="mt-2 text-sm text-gray-400">
                                {selectedImage.name} ({(selectedImage.size / 1024 / 1024).toFixed(2)} MB)
                            </div>
                        )}
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
                            required={!car}
                        />
                    </label>
                )}
            </div>

            {/* Basic Details Grid */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Label htmlFor="make" className="text-gray-300">Car Make/Brand</Label>
                        {isFieldDirty('make') && (
                            <span className="text-xs bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">Modified</span>
                        )}
                    </div>
                    <Input
                        id="make"
                        value={formData.make}
                        onChange={(e) => handleChange("make", e.target.value)}
                        placeholder="e.g., Audi"
                        className={`bg-[#0a0a0a] ${getFieldBorderClass('make')} text-white placeholder:text-gray-500`}
                        required
                    />
                </div>

                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Label htmlFor="vehicleModel" className="text-gray-300">Vehicle Model</Label>
                        {isFieldDirty('vehicleModel') && (
                            <span className="text-xs bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">Modified</span>
                        )}
                    </div>
                    <Input
                        id="vehicleModel"
                        value={formData.vehicleModel}
                        onChange={(e) => handleChange("vehicleModel", e.target.value)}
                        placeholder="e.g., A8 L"
                        className={`bg-[#0a0a0a] ${getFieldBorderClass('vehicleModel')} text-white`}
                        required
                    />
                </div>

                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Label htmlFor="registrationNumber" className="text-gray-300">Registration Number</Label>
                        {isFieldDirty('registrationNumber') && (
                            <span className="text-xs bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">Modified</span>
                        )}
                    </div>
                    <Input
                        id="registrationNumber"
                        value={formData.registrationNumber}
                        onChange={(e) => handleChange("registrationNumber", e.target.value)}
                        placeholder="e.g., KBC123A"
                        className={`bg-[#0a0a0a] ${getFieldBorderClass('registrationNumber')} text-white`}
                        required
                    />
                </div>

                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Label htmlFor="year" className="text-gray-300">Year</Label>
                        {isFieldDirty('year') && (
                            <span className="text-xs bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">Modified</span>
                        )}
                    </div>
                    <Input
                        id="year"
                        type="number"
                        value={formData.year}
                        onChange={(e) => handleChange("year", parseInt(e.target.value) || 0)}
                        min="2009"
                        max="2025"
                        className={`bg-[#0a0a0a] ${getFieldBorderClass('year')} text-white`}
                        required
                    />
                </div>

                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Label htmlFor="engineCapacity" className="text-gray-300">Engine Capacity (cc)</Label>
                        {isFieldDirty('engineCapacity') && (
                            <span className="text-xs bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">Modified</span>
                        )}
                    </div>
                    <Input
                        id="engineCapacity"
                        type="number"
                        value={formData.engineCapacity}
                        onChange={(e) => handleChange("engineCapacity", parseInt(e.target.value) || 0)}
                        min={500}
                        className={`bg-[#0a0a0a] ${getFieldBorderClass('engineCapacity')} text-white`}
                        required
                    />
                </div>

                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Label htmlFor="colour" className="text-gray-300">Colour</Label>
                        {isFieldDirty('colour') && (
                            <span className="text-xs bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">Modified</span>
                        )}
                    </div>
                    <Input
                        id="colour"
                        value={formData.colour}
                        onChange={(e) => handleChange("colour", e.target.value)}
                        placeholder="e.g., Black"
                        className={`bg-[#0a0a0a] ${getFieldBorderClass('colour')} text-white`}
                        required
                    />
                </div>

                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Label htmlFor="mileage" className="text-gray-300">Mileage</Label>
                        {isFieldDirty('mileage') && (
                            <span className="text-xs bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">Modified</span>
                        )}
                    </div>
                    <Input
                        id="mileage"
                        type="number"
                        value={formData.mileage}
                        onChange={(e) => handleChange("mileage", parseInt(e.target.value) || 0)}
                        min="0"
                        className={`bg-[#0a0a0a] ${getFieldBorderClass('mileage')} text-white`}
                        required
                    />
                </div>

                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Label htmlFor="dailyPrice" className="text-gray-300">Price (Ksh/day)</Label>
                        {isFieldDirty('dailyPrice') && (
                            <span className="text-xs bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">Modified</span>
                        )}
                    </div>
                    <Input
                        id="dailyPrice"
                        type="number"
                        value={formData.dailyPrice}
                        onChange={(e) => handleChange("dailyPrice", parseFloat(e.target.value) || 0)}
                        min="0"
                        step="100"
                        className={`bg-[#0a0a0a] ${getFieldBorderClass('dailyPrice')} text-white`}
                        required
                    />
                </div>

                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Label htmlFor="seatingCapacity" className="text-gray-300">Seating Capacity</Label>
                        {isFieldDirty('seatingCapacity') && (
                            <span className="text-xs bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">Modified</span>
                        )}
                    </div>
                    <Input
                        id="seatingCapacity"
                        type="number"
                        value={formData.seatingCapacity}
                        onChange={(e) => handleChange("seatingCapacity", parseInt(e.target.value) || 0)}
                        min={2}
                        max={9}
                        className={`bg-[#0a0a0a] ${getFieldBorderClass('seatingCapacity')} text-white`}
                        required
                    />
                </div>

                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Label htmlFor="transmissionType" className="text-gray-300">Transmission</Label>
                        {isFieldDirty('transmissionType') && (
                            <span className="text-xs bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">Modified</span>
                        )}
                    </div>
                    <Select
                        value={formData.transmissionType}
                        onValueChange={(value) => handleChange("transmissionType", value as TransmissionType)}
                    >
                        <SelectTrigger id="transmissionType" className={`bg-[#0a0a0a] ${getFieldBorderClass('transmissionType')} text-white`}>
                            <SelectValue placeholder="Select transmission" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a1a1a] border-gray-700 text-white">
                            <SelectItem value="AUTOMATIC">Automatic</SelectItem>
                            <SelectItem value="MANUAL">Manual</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Label htmlFor="fuelType" className="text-gray-300">Fuel Type</Label>
                        {isFieldDirty('fuelType') && (
                            <span className="text-xs bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">Modified</span>
                        )}
                    </div>
                    <Select
                        value={formData.fuelType}
                        onValueChange={(value) => handleChange("fuelType", value as FuelType)}
                    >
                        <SelectTrigger id="fuelType" className={`bg-[#0a0a0a] ${getFieldBorderClass('fuelType')} text-white`}>
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

                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Label htmlFor="bodyType" className="text-gray-300">Body Type</Label>
                        {isFieldDirty('bodyType') && (
                            <span className="text-xs bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">Modified</span>
                        )}
                    </div>
                    <Select
                        value={formData.bodyType}
                        onValueChange={(value) => handleChange("bodyType", value as BodyType)}
                    >
                        <SelectTrigger id="bodyType" className={`bg-[#0a0a0a] ${getFieldBorderClass('bodyType')} text-white`}>
                            <SelectValue placeholder="Select body type" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a1a1a] border-gray-700 text-white">
                            <SelectItem value="SEDAN">Sedan</SelectItem>
                            <SelectItem value="SUV">SUV</SelectItem>
                            <SelectItem value="COUPE">Coupe</SelectItem>
                            <SelectItem value="HATCHBACK">Hatchback</SelectItem>
                            <SelectItem value="VAN">Van</SelectItem>
                            <SelectItem value="MINIVAN">Minivan</SelectItem>
                            <SelectItem value="TRUCK">Truck</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Label htmlFor="carStatus" className="text-gray-300">Car Status</Label>
                        {isFieldDirty('carStatus') && (
                            <span className="text-xs bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">Modified</span>
                        )}
                    </div>
                    <Select
                        value={formData.carStatus}
                        onValueChange={(value) => handleChange("carStatus", value as CarStatus)}
                    >
                        <SelectTrigger id="carStatus" className={`bg-[#0a0a0a] ${getFieldBorderClass('carStatus')} text-white`}>
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a1a1a] border-gray-700 text-white">
                            <SelectItem value="AVAILABLE">Available</SelectItem>
                            <SelectItem value="RENTED">Rented</SelectItem>
                            <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Description - Full Width (OPTIONAL) */}
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <Label htmlFor="description" className="text-gray-300">Description (Optional)</Label>
                    {isFieldDirty('description') && (
                        <span className="text-xs bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">Modified</span>
                    )}
                </div>
                <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    placeholder="Describe the vehicle in detail... (max 1000 characters)"
                    rows={4}
                    className={`w-full px-3 py-2 bg-[#0a0a0a] border ${getFieldBorderClass('description')} rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white resize-none`}
                />
                <div className="flex justify-between mt-1 text-sm">
                    <span className={`
                        ${descriptionStatus === "too-long" ? "text-red-400" : "text-gray-400"}
                    `}>
                        {descriptionStatus === "too-long" && "⚠️ Too long (max 1000 characters)"}
                        {descriptionStatus === "valid" && descriptionLength > 0 && "✓ Good"}
                        {descriptionStatus === "empty" && "Optional field"}
                    </span>
                    <span className="text-gray-400">{descriptionLength} / 1000</span>
                </div>
            </div>

            {/* Features Section (OPTIONAL) */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Label className="text-gray-300">Features (Optional)</Label>
                    {isFieldDirty('featureName') && (
                        <span className="text-xs bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">Modified</span>
                    )}
                </div>

                {/* Loading state */}
                {isLoadingFeatures && (
                    <p className="text-sm text-gray-400">Loading available features...</p>
                )}

                {/* Available features checkboxes */}
                {!isLoadingFeatures && availableFeatures.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {availableFeatures.map((feature) => (
                            <label
                                key={feature.featureId}
                                className={`
                                    flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors
                                    ${selectedFeatures.includes(feature.featureName)
                                    ? "bg-white text-black"
                                    : "bg-[#0a0a0a] border border-gray-700 text-gray-300 hover:border-gray-600"
                                }
                                `}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedFeatures.includes(feature.featureName)}
                                    onChange={() => toggleFeature(feature.featureName)}
                                    className="w-4 h-4 rounded"
                                />
                                <span className="text-sm">{feature.featureName}</span>
                            </label>
                        ))}
                    </div>
                )}

                {/* Add custom feature */}
                <div className="space-y-3">
                    <Label className="text-gray-300 text-sm">Add Custom Feature</Label>
                    <div className="flex gap-2">
                        <Input
                            value={customFeature}
                            onChange={(e) => setCustomFeature(e.target.value)}
                            placeholder="e.g., Heated Steering Wheel"
                            className="bg-[#0a0a0a] border-gray-700 text-white"
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomFeature())}
                        />
                        <Button
                            type="button"
                            onClick={addCustomFeature}
                            className="bg-white text-black hover:bg-gray-200"
                        >
                            <Plus className="w-4 h-4 mr-1" />
                            Add
                        </Button>
                    </div>
                </div>

                {/* Selected features display */}
                {selectedFeatures.length > 0 && (
                    <div>
                        <Label className="text-gray-300 text-sm mb-2 block">
                            Selected Features ({selectedFeatures.length})
                        </Label>
                        <div className="flex flex-wrap gap-2">
                            {selectedFeatures.map((feature) => (
                                <div
                                    key={feature}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/50 rounded-full text-sm text-emerald-300"
                                >
                                    <span>{feature}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeFeature(feature)}
                                        className="hover:text-white transition-colors"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 justify-end pt-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
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