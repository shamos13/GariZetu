import React, {useEffect, useState, useMemo} from "react";
import {Button} from "../../../components/ui/button";
import {Input} from "../../../components/ui/input";
import {Label} from "../../../components/ui/label";
import {CarStatus, FuelType, TransmissionType, BodyType} from "../types/Car.ts";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "../../../components/ui/select.tsx";
import {Plus, Upload, X, Search, Check} from "lucide-react";
import { getImageUrl } from "../../../lib/ImageUtils.ts";
import { api } from "../../../lib/api.ts";

export type CarFormData = {
    make: string;
    registrationNumber: string;
    vehicleModel: string;
    year: number | "";
    engineCapacity: number | "";
    colour: string;
    mileage: number | "";
    dailyPrice: number | "";
    seatingCapacity: number | "";
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
    const [featureSearchQuery, setFeatureSearchQuery] = useState("");
    const [isFeatureDropdownOpen, setIsFeatureDropdownOpen] = useState(false);
    const [isLoadingFeatures, setIsLoadingFeatures] = useState(false);
    const [isCreatingFeature, setIsCreatingFeature] = useState(false);

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
                const response = await api.get<Feature[]>("/features");
                setAvailableFeatures(response.data);
            } catch (error) {
                console.error("Failed to load features:", error);
            } finally {
                setIsLoadingFeatures(false);
            }
        };
        loadFeatures();
    }, []);

    // Filter features based on search query
    const filteredFeatures = useMemo(() => {
        if (!featureSearchQuery.trim()) {
            return availableFeatures;
        }
        const query = featureSearchQuery.toLowerCase();
        return availableFeatures.filter(feature =>
            feature.featureName.toLowerCase().includes(query) ||
            feature.featureDescription?.toLowerCase().includes(query) ||
            feature.featureCategory?.toLowerCase().includes(query)
        );
    }, [availableFeatures, featureSearchQuery]);

    // Check if search query matches an existing feature
    const isNewFeature = useMemo(() => {
        if (!featureSearchQuery.trim()) return false;
        return !availableFeatures.some(f =>
            f.featureName.toLowerCase() === featureSearchQuery.trim().toLowerCase()
        );
    }, [availableFeatures, featureSearchQuery]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const isEdit = !!car;

        // For create, require an image; for edit, image is optional
        if (!isEdit && !selectedImage) {
            alert("Please select a car image");
            return;
        }

        // Validate number fields are not empty
        if (formData.year === "" || formData.engineCapacity === "" || formData.mileage === "" || 
            formData.dailyPrice === "" || formData.seatingCapacity === "") {
            alert("Please fill in all required number fields");
            return;
        }

        // Optional: Only validate max length if description is provided
        if (formData.description && formData.description.length > 1000) {
            alert("Description must not exceed 1000 characters");
            return;
        }

        // Convert empty strings to numbers for submission
        const dataToSubmit: CarFormData = {
            ...formData,
            year: formData.year === "" ? new Date().getFullYear() : Number(formData.year),
            engineCapacity: formData.engineCapacity === "" ? 1500 : Number(formData.engineCapacity),
            mileage: formData.mileage === "" ? 0 : Number(formData.mileage),
            dailyPrice: formData.dailyPrice === "" ? 0 : Number(formData.dailyPrice),
            seatingCapacity: formData.seatingCapacity === "" ? 5 : Number(formData.seatingCapacity),
            featureName: selectedFeatures
        };

        onSubmit(dataToSubmit, selectedImage);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('.feature-dropdown-container')) {
                setIsFeatureDropdownOpen(false);
            }
        };

        if (isFeatureDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isFeatureDropdownOpen]);

    const handleChange = (field: keyof CarFormData, value: string | number | string[]) => {
        setFormData({ ...formData, [field]: value });
    };

    // Handle number input changes - allows empty values
    const handleNumberChange = (field: keyof CarFormData, value: string) => {
        if (value === "" || value === null || value === undefined) {
            // Allow empty string for better UX
            setFormData({ ...formData, [field]: "" as any });
        } else {
            const numValue = field === "dailyPrice" ? parseFloat(value) : parseInt(value);
            if (!isNaN(numValue)) {
                setFormData({ ...formData, [field]: numValue });
            } else {
                // If invalid number, allow empty
                setFormData({ ...formData, [field]: "" as any });
            }
        }
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
        setFeatureSearchQuery("");
        setIsFeatureDropdownOpen(false);
    };

    const createAndAddFeature = async () => {
        const trimmed = featureSearchQuery.trim();
        if (!trimmed) {
            alert("Please enter a feature name");
            return;
        }
        if (selectedFeatures.includes(trimmed)) {
            alert("This feature is already added");
            return;
        }

        try {
            setIsCreatingFeature(true);
            // Create the feature in the backend
            // The backend's FeatureService.findOrCreateFeature will handle this
            // For now, we'll add it to selected features and it will be created when the car is saved
            // (The backend processes feature names and creates them if they don't exist)
            
            setSelectedFeatures([...selectedFeatures, trimmed]);
            setFeatureSearchQuery("");
            setIsFeatureDropdownOpen(false);
            
            // Optionally refresh the features list
            // Note: The feature will be created on the backend when the car is saved
        } catch (error) {
            console.error("Failed to create feature:", error);
            alert("Failed to create feature. It will be created when you save the car.");
            // Still add it to selected features - backend will create it
            setSelectedFeatures([...selectedFeatures, trimmed]);
            setFeatureSearchQuery("");
            setIsFeatureDropdownOpen(false);
        } finally {
            setIsCreatingFeature(false);
        }
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
                        value={formData.year || ""}
                        onChange={(e) => handleNumberChange("year", e.target.value)}
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
                        value={formData.engineCapacity || ""}
                        onChange={(e) => handleNumberChange("engineCapacity", e.target.value)}
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
                        value={formData.mileage || ""}
                        onChange={(e) => handleNumberChange("mileage", e.target.value)}
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
                        value={formData.dailyPrice || ""}
                        onChange={(e) => handleNumberChange("dailyPrice", e.target.value)}
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
                        value={formData.seatingCapacity || ""}
                        onChange={(e) => handleNumberChange("seatingCapacity", e.target.value)}
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

                {/* Searchable Feature Dropdown */}
                <div className="relative feature-dropdown-container">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <Input
                            type="text"
                            value={featureSearchQuery}
                            onChange={(e) => {
                                setFeatureSearchQuery(e.target.value);
                                setIsFeatureDropdownOpen(true);
                            }}
                            onFocus={() => setIsFeatureDropdownOpen(true)}
                            placeholder="Search features or type to add new..."
                            className="pl-12 pr-4 py-3 bg-[#0a0a0a] border-gray-700 text-white placeholder:text-gray-500 focus:outline-none focus:border-white/50"
                        />
                    </div>

                    {/* Dropdown Results */}
                    {isFeatureDropdownOpen && (
                        <div className="absolute z-50 w-full mt-2 bg-[#1a1a1a] border border-gray-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                            {isLoadingFeatures ? (
                                <div className="p-4 text-center text-gray-400 text-sm">Loading features...</div>
                            ) : filteredFeatures.length > 0 ? (
                                <div className="py-2">
                                    {filteredFeatures.map((feature) => (
                                        <button
                                            key={feature.featureId}
                                            type="button"
                                            onClick={() => toggleFeature(feature.featureName)}
                                            className={`w-full px-4 py-2.5 text-left hover:bg-gray-800 transition-colors flex items-center justify-between ${
                                                selectedFeatures.includes(feature.featureName)
                                                    ? "bg-white/10"
                                                    : ""
                                            }`}
                                        >
                                            <div className="flex-1">
                                                <div className="text-white text-sm font-medium">{feature.featureName}</div>
                                                {feature.featureDescription && (
                                                    <div className="text-gray-400 text-xs mt-0.5">{feature.featureDescription}</div>
                                                )}
                                            </div>
                                            {selectedFeatures.includes(feature.featureName) && (
                                                <Check className="w-4 h-4 text-white ml-2" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            ) : null}
                            
                            {/* Add New Feature Option */}
                            {isNewFeature && featureSearchQuery.trim() && (
                                <div className={`${filteredFeatures.length > 0 ? "border-t border-gray-700" : ""} pt-2`}>
                                    <button
                                        type="button"
                                        onClick={createAndAddFeature}
                                        disabled={isCreatingFeature}
                                        className="w-full px-4 py-2.5 text-left hover:bg-gray-800 transition-colors flex items-center gap-2 text-white disabled:opacity-50"
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span className="text-sm font-medium">
                                            {isCreatingFeature ? "Adding..." : `Add "${featureSearchQuery.trim()}"`}
                                        </span>
                                    </button>
                                </div>
                            )}

                            {!isLoadingFeatures && featureSearchQuery && filteredFeatures.length === 0 && !isNewFeature && (
                                <div className="p-4 text-center text-gray-400 text-sm">
                                    No features found. Type to create a new one.
                                </div>
                            )}

                            {!featureSearchQuery && (
                                <div className="p-4 text-center text-gray-400 text-sm">
                                    Start typing to search features or add a new one
                                </div>
                            )}
                        </div>
                    )}
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
                                    className="flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/20 rounded-full text-sm text-white"
                                >
                                    <span>{feature}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeFeature(feature)}
                                        className="hover:text-red-400 transition-colors"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Quick Add Popular Features */}
                {!isLoadingFeatures && availableFeatures.length > 0 && selectedFeatures.length === 0 && (
                    <div className="pt-2">
                        <Label className="text-gray-400 text-xs mb-2 block">Quick Add (Click to select)</Label>
                        <div className="flex flex-wrap gap-2">
                            {availableFeatures.slice(0, 6).map((feature) => (
                                <button
                                    key={feature.featureId}
                                    type="button"
                                    onClick={() => toggleFeature(feature.featureName)}
                                    className="px-3 py-1.5 bg-[#0a0a0a] border border-gray-700 rounded-lg text-sm text-gray-300 hover:border-white/30 hover:text-white transition-colors"
                                >
                                    {feature.featureName}
                                </button>
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