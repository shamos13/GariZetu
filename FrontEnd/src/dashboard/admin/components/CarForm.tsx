import React, {useEffect, useState, useMemo, useRef} from "react";
import {Button} from "../../../components/ui/button";
import {Input} from "../../../components/ui/input";
import {Label} from "../../../components/ui/label";
import {CarStatus, FuelType, TransmissionType, BodyType, FeaturedCategory} from "../types/Car.ts";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "../../../components/ui/select.tsx";
import {Plus, Upload, X, Search, Check} from "lucide-react";
import { getImageUrl } from "../../../lib/ImageUtils.ts";
import { api } from "../../../lib/api.ts";

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
    featuredCategory: FeaturedCategory;
    description: string;
    featureName: string[];
    // Optional existing image URL (used when editing)
    mainImageUrl?: string;
    galleryImageUrls?: string[];
}

interface Feature {
    featureId: number;
    featureName: string;
    featureDescription: string;
    featureCategory: string;
}

const normalizeFeatureName = (value: string) => value.trim().toLowerCase();

type CarFeatureLike = {
    featureName?: string;
    name?: string;
    available?: boolean;
};

type CarFormInputData = CarFormData & {
    features?: CarFeatureLike[];
};

const extractCarFeatureNames = (car?: CarFormInputData): string[] => {
    if (!car) {
        return [];
    }

    const fromFeatureName = (car.featureName || [])
        .map((feature) => feature.trim())
        .filter((feature) => feature.length > 0);

    const fromFeatureObjects = (car.features || [])
        .filter((feature) => feature.available !== false)
        .map((feature) => (feature.featureName ?? feature.name ?? "").trim())
        .filter((feature) => feature.length > 0);

    return Array.from(new Set([...fromFeatureName, ...fromFeatureObjects]));
};

type PendingGalleryImage = {
    id: string;
    file: File;
    preview: string;
};

export type GallerySubmitPayload = {
    newImages: File[];
    existingUrls: string[];
    hasChanges: boolean;
};

interface CarFormProps {
    car?: CarFormInputData;
    onSubmit: (
        car: CarFormData,
        image: File | null,
        gallery: GallerySubmitPayload
    ) => void | Promise<void>;
    onCancel: () => void;
}

export function CarForm({ car, onSubmit, onCancel }: CarFormProps) {
    const initialCarFeatureNames = useMemo(() => extractCarFeatureNames(car), [car]);

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
        featuredCategory: car.featuredCategory || "Popular Car",
        description: car.description || "",
        featureName: initialCarFeatureNames,
        hasImage: !!car.mainImageUrl,
        galleryImageUrls: car.galleryImageUrls || [],
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
        featuredCategory: car?.featuredCategory || "Popular Car",
        description: car?.description || "",
        featureName: initialCarFeatureNames,
        mainImageUrl: car?.mainImageUrl,
        galleryImageUrls: car?.galleryImageUrls || [],
    });

    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(
        car?.mainImageUrl ? getImageUrl(car.mainImageUrl) : null
    );
    const [existingGalleryUrls, setExistingGalleryUrls] = useState<string[]>(car?.galleryImageUrls || []);
    const [pendingGalleryImages, setPendingGalleryImages] = useState<PendingGalleryImage[]>([]);
    const pendingGalleryImagesRef = useRef<PendingGalleryImage[]>([]);
    const existingGalleryPreviews = useMemo(
        () => existingGalleryUrls.map(getImageUrl),
        [existingGalleryUrls]
    );
    const hasGalleryChanges = useMemo(() => {
        if (!car) return pendingGalleryImages.length > 0;
        const original = (car.galleryImageUrls || []).slice().sort().join(",");
        const current = existingGalleryUrls.slice().sort().join(",");
        return original !== current || pendingGalleryImages.length > 0;
    }, [car, existingGalleryUrls, pendingGalleryImages.length]);

    // Features state
    const [availableFeatures, setAvailableFeatures] = useState<Feature[]>([]);
    const [selectedFeatures, setSelectedFeatures] = useState<string[]>(initialCarFeatureNames);
    const [featureSearch, setFeatureSearch] = useState("");
    const [isLoadingFeatures, setIsLoadingFeatures] = useState(false);
    const [isCreatingFeature, setIsCreatingFeature] = useState(false);
    const [showFeatureDropdown, setShowFeatureDropdown] = useState(false);
    const selectedFeatureNameSet = useMemo(
        () => new Set(selectedFeatures.map((feature) => normalizeFeatureName(feature))),
        [selectedFeatures]
    );
    const sortedAvailableFeatures = useMemo(
        () =>
            [...availableFeatures].sort((a, b) =>
                a.featureName.localeCompare(b.featureName, undefined, { sensitivity: "base" })
            ),
        [availableFeatures]
    );

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
        if (fieldName === 'galleryImageUrls') {
            const originalGallery = (originalValues.galleryImageUrls || []).slice().sort().join(',');
            const currentGallery = existingGalleryUrls.slice().sort().join(',');
            return currentGallery !== originalGallery || pendingGalleryImages.length > 0;
        }
        
        return currentValue !== originalValue;
    };

    // Get count of dirty fields
    const getDirtyFieldsCount = (): number => {
        if (!originalValues || !car) return 0;
        
        const fields: (keyof CarFormData)[] = [
            'make', 'registrationNumber', 'vehicleModel', 'year', 'engineCapacity',
            'colour', 'mileage', 'dailyPrice', 'seatingCapacity', 'carStatus',
            'transmissionType', 'fuelType', 'bodyType', 'featuredCategory', 'description', 'featureName', 'mainImageUrl',
            'galleryImageUrls'
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

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('.feature-dropdown-container')) {
                setShowFeatureDropdown(false);
            }
        };
        if (showFeatureDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [showFeatureDropdown]);

    // Filter features based on search - improved case-insensitive matching
    const filteredFeatures = useMemo(() => {
        if (!featureSearch.trim()) {
            // When no search, show all features (selected ones will be visually marked)
            return availableFeatures;
        }
        const searchLower = featureSearch.toLowerCase().trim();
        return availableFeatures.filter(f => {
            const nameMatch = f.featureName.toLowerCase().includes(searchLower);
            const descMatch = f.featureDescription?.toLowerCase().includes(searchLower) || false;
            const categoryMatch = f.featureCategory?.toLowerCase().includes(searchLower) || false;
            // Match if any field contains the search term
            return nameMatch || descMatch || categoryMatch;
        }).sort((a, b) => {
            // Sort by relevance: exact name matches first, then starts with, then contains
            const aNameLower = a.featureName.toLowerCase();
            const bNameLower = b.featureName.toLowerCase();
            
            // Exact match first
            if (aNameLower === searchLower) return -1;
            if (bNameLower === searchLower) return 1;
            
            // Starts with second
            if (aNameLower.startsWith(searchLower) && !bNameLower.startsWith(searchLower)) return -1;
            if (bNameLower.startsWith(searchLower) && !aNameLower.startsWith(searchLower)) return 1;
            
            // Then alphabetical
            return aNameLower.localeCompare(bNameLower);
        });
    }, [availableFeatures, featureSearch]);

    // Check if search term matches an existing feature
    const exactMatch = useMemo(() => {
        if (!featureSearch.trim()) return null;
        return availableFeatures.find(f => 
            normalizeFeatureName(f.featureName) === normalizeFeatureName(featureSearch)
        );
    }, [availableFeatures, featureSearch]);

    // Create new feature in database
    const createNewFeature = async (featureName: string) => {
        try {
            setIsCreatingFeature(true);
            const normalizedFeatureName = normalizeFeatureName(featureName);
            const existingFeature = availableFeatures.find(
                (feature) => normalizeFeatureName(feature.featureName) === normalizedFeatureName
            );

            if (existingFeature) {
                addFeature(existingFeature.featureName);
                setFeatureSearch("");
                setShowFeatureDropdown(false);
                return;
            }

            // Note: This endpoint needs to be created in backend: POST /api/v1/features
            // For now, we'll add it to the list locally and it will be created when car is saved
            const newFeature: Feature = {
                featureId: Date.now(), // Temporary ID
                featureName: featureName.trim(),
                featureDescription: "",
                featureCategory: "CUSTOM"
            };
            setAvailableFeatures(prev => [...prev, newFeature]);
            addFeature(featureName.trim());
            setFeatureSearch("");
            setShowFeatureDropdown(false);
        } catch (error) {
            console.error("Failed to create feature:", error);
            alert("Failed to create feature. It will be added when you save the car.");
            // Still add it locally
            addFeature(featureName.trim());
            setFeatureSearch("");
        } finally {
            setIsCreatingFeature(false);
        }
    };

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

        // Ensure number fields are valid (not 0 or empty)
        if (!formData.year || formData.year === 0) {
            alert("Please enter a valid year");
            return;
        }
        if (!formData.engineCapacity || formData.engineCapacity === 0) {
            alert("Please enter a valid engine capacity");
            return;
        }
        if (formData.mileage === undefined || formData.mileage === null) {
            alert("Please enter mileage");
            return;
        }
        if (!formData.dailyPrice || formData.dailyPrice === 0) {
            alert("Please enter a valid daily price");
            return;
        }
        if (!formData.seatingCapacity || formData.seatingCapacity === 0) {
            alert("Please enter a valid seating capacity");
            return;
        }

        // Add selected features to formData (can be empty array)
        const dataToSubmit = {
            ...formData,
            featureName: selectedFeatures,
            galleryImageUrls: existingGalleryUrls
        };

        onSubmit(dataToSubmit, selectedImage, {
            newImages: pendingGalleryImages.map((item) => item.file),
            existingUrls: existingGalleryUrls,
            hasChanges: hasGalleryChanges
        });
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

    const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);

        if (files.length === 0) {
            return;
        }

        const invalidFile = files.find((file) => !file.type.startsWith("image"));
        if (invalidFile) {
            alert("Please select only image files");
            return;
        }

        const maxSize = 10 * 1024 * 1024;
        const oversized = files.find((file) => file.size > maxSize);
        if (oversized) {
            alert("Each image must be less than 10mb");
            return;
        }

        setPendingGalleryImages((prev) => {
            const existingSignatures = new Set(
                prev.map((item) => `${item.file.name}-${item.file.size}-${item.file.lastModified}`)
            );

            const newItems: PendingGalleryImage[] = [];
            files.forEach((file, index) => {
                const signature = `${file.name}-${file.size}-${file.lastModified}`;
                if (existingSignatures.has(signature)) {
                    return;
                }

                existingSignatures.add(signature);
                newItems.push({
                    id: `${signature}-${Date.now()}-${index}`,
                    file,
                    preview: URL.createObjectURL(file)
                });
            });

            return [...prev, ...newItems];
        });

        // Allow selecting the same file again on the next change.
        e.target.value = "";
    };

    const handleRemoveExistingGalleryImage = (index: number) => {
        setExistingGalleryUrls((prev) => prev.filter((_, currentIndex) => currentIndex !== index));
    };

    const handleRemovePendingGalleryImage = (imageId: string) => {
        setPendingGalleryImages((prev) => {
            const target = prev.find((item) => item.id === imageId);
            if (target) {
                URL.revokeObjectURL(target.preview);
            }
            return prev.filter((item) => item.id !== imageId);
        });
    };

    const handleClearPendingGallery = () => {
        setPendingGalleryImages((prev) => {
            prev.forEach((item) => URL.revokeObjectURL(item.preview));
            return [];
        });
        const fileInput = document.getElementById('galleryImages') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    };

    const handleClearAllGallery = () => {
        setExistingGalleryUrls([]);
        setPendingGalleryImages((prev) => {
            prev.forEach((item) => URL.revokeObjectURL(item.preview));
            return [];
        });
        const fileInput = document.getElementById('galleryImages') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    };

    useEffect(() => {
        pendingGalleryImagesRef.current = pendingGalleryImages;
    }, [pendingGalleryImages]);

    useEffect(() => {
        return () => {
            pendingGalleryImagesRef.current.forEach((item) => URL.revokeObjectURL(item.preview));
        };
    }, []);

    const handleClearImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        const fileInput = document.getElementById('image') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    };

    // Feature handlers
    const addFeature = (featureName: string) => {
        const trimmed = featureName.trim();
        if (!trimmed) return;

        const normalized = normalizeFeatureName(trimmed);
        if (selectedFeatureNameSet.has(normalized)) {
            return;
        }

        setSelectedFeatures((prev) => [...prev, trimmed]);
    };

    const handleFeatureInputChange = (value: string) => {
        setFeatureSearch(value);
        // Show dropdown when typing or when input is focused
        if (value.trim() || availableFeatures.length > 0) {
            setShowFeatureDropdown(true);
        }
    };

    const handleSelectFeature = (featureName: string) => {
        addFeature(featureName);
        setFeatureSearch("");
        setShowFeatureDropdown(false);
    };

    const handleAddNewFeature = () => {
        const trimmed = featureSearch.trim();
        if (!trimmed) {
            return;
        }
        if (selectedFeatureNameSet.has(normalizeFeatureName(trimmed))) {
            alert("This feature is already selected");
            return;
        }
        if (exactMatch) {
            // Feature exists, just select it
            handleSelectFeature(exactMatch.featureName);
            return;
        }
        // Create new feature
        createNewFeature(trimmed);
    };

    const removeFeature = (featureName: string) => {
        const normalized = normalizeFeatureName(featureName);
        setSelectedFeatures((prev) =>
            prev.filter((feature) => normalizeFeatureName(feature) !== normalized)
        );
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

            {/* Gallery Upload */}
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <Label htmlFor="galleryImages" className="text-gray-300">Gallery Images</Label>
                    {isFieldDirty('galleryImageUrls') && (
                        <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">Modified</span>
                    )}
                </div>

                {(pendingGalleryImages.length > 0 || existingGalleryPreviews.length > 0) && (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {existingGalleryPreviews.map((url, index) => (
                            <div key={`existing-${url}-${index}`} className="relative">
                                <img
                                    src={url}
                                    alt={`Gallery preview ${index + 1}`}
                                    className="h-28 w-full rounded-lg border border-gray-700 object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleRemoveExistingGalleryImage(index)}
                                    className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600 transition-colors"
                                    aria-label="Remove existing gallery image"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                                <span className="absolute left-2 bottom-2 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-white">
                                    Saved
                                </span>
                            </div>
                        ))}
                        {pendingGalleryImages.map((item, index) => (
                            <div key={item.id} className="relative">
                                <img
                                    src={item.preview}
                                    alt={`New gallery preview ${index + 1}`}
                                    className="h-28 w-full rounded-lg border border-gray-700 object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleRemovePendingGalleryImage(item.id)}
                                    className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600 transition-colors"
                                    aria-label="Remove new gallery image"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                                <span className="absolute left-2 bottom-2 rounded bg-emerald-600/90 px-1.5 py-0.5 text-[10px] text-white">
                                    New
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex flex-wrap gap-2">
                    <label
                        htmlFor="galleryImages"
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-700 bg-[#0a0a0a] px-3 py-2 text-sm text-gray-300 hover:border-gray-500 hover:bg-[#141414] transition-colors cursor-pointer"
                    >
                        <Upload className="h-4 w-4" />
                        Add Gallery Images
                    </label>
                    {pendingGalleryImages.length > 0 && (
                        <button
                            type="button"
                            onClick={handleClearPendingGallery}
                            className="inline-flex items-center gap-2 rounded-lg border border-orange-500/40 bg-orange-500/10 px-3 py-2 text-sm text-orange-300 hover:bg-orange-500/20 transition-colors"
                        >
                            <X className="h-4 w-4" />
                            Clear New Images
                        </button>
                    )}
                    {(existingGalleryUrls.length > 0 || pendingGalleryImages.length > 0) && (
                        <button
                            type="button"
                            onClick={handleClearAllGallery}
                            className="inline-flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300 hover:bg-red-500/20 transition-colors"
                        >
                            <X className="h-4 w-4" />
                            Clear All Gallery
                        </button>
                    )}
                </div>

                <input
                    id="galleryImages"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleGalleryChange}
                    className="hidden"
                    multiple
                />

                <p className="text-xs text-gray-500">
                    Optional. Add images in batches, remove individual images, and keep only the gallery images you want to save.
                </p>
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
                        onChange={(e) => {
                            const val = e.target.value;
                            if (val === "") {
                                setFormData({ ...formData, year: 0 });
                            } else {
                                const num = parseInt(val);
                                if (!isNaN(num)) {
                                    handleChange("year", num);
                                }
                            }
                        }}
                        onBlur={(e) => {
                            if (e.target.value === "" || parseInt(e.target.value) === 0) {
                                setFormData({ ...formData, year: new Date().getFullYear() });
                            }
                        }}
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
                        onChange={(e) => {
                            const val = e.target.value;
                            if (val === "") {
                                setFormData({ ...formData, engineCapacity: 0 });
                            } else {
                                const num = parseInt(val);
                                if (!isNaN(num)) {
                                    handleChange("engineCapacity", num);
                                }
                            }
                        }}
                        onBlur={(e) => {
                            if (e.target.value === "" || parseInt(e.target.value) === 0) {
                                setFormData({ ...formData, engineCapacity: 1500 });
                            }
                        }}
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
                        onChange={(e) => {
                            const val = e.target.value;
                            if (val === "") {
                                setFormData({ ...formData, mileage: 0 });
                            } else {
                                const num = parseInt(val);
                                if (!isNaN(num)) {
                                    handleChange("mileage", num);
                                }
                            }
                        }}
                        onBlur={(e) => {
                            if (e.target.value === "" || parseInt(e.target.value) === 0) {
                                setFormData({ ...formData, mileage: 100000 });
                            }
                        }}
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
                        onChange={(e) => {
                            const val = e.target.value;
                            if (val === "") {
                                setFormData({ ...formData, dailyPrice: 0 });
                            } else {
                                const num = parseFloat(val);
                                if (!isNaN(num)) {
                                    handleChange("dailyPrice", num);
                                }
                            }
                        }}
                        onBlur={(e) => {
                            if (e.target.value === "" || parseFloat(e.target.value) === 0) {
                                setFormData({ ...formData, dailyPrice: 1000 });
                            }
                        }}
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
                        onChange={(e) => {
                            const val = e.target.value;
                            if (val === "") {
                                setFormData({ ...formData, seatingCapacity: 0 });
                            } else {
                                const num = parseInt(val);
                                if (!isNaN(num)) {
                                    handleChange("seatingCapacity", num);
                                }
                            }
                        }}
                        onBlur={(e) => {
                            if (e.target.value === "" || parseInt(e.target.value) === 0) {
                                setFormData({ ...formData, seatingCapacity: 5 });
                            }
                        }}
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

                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Label htmlFor="featuredCategory" className="text-gray-300">Featured Category</Label>
                        {isFieldDirty('featuredCategory') && (
                            <span className="text-xs bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">Modified</span>
                        )}
                    </div>
                    <Select
                        value={formData.featuredCategory}
                        onValueChange={(value) => handleChange("featuredCategory", value as FeaturedCategory)}
                    >
                        <SelectTrigger id="featuredCategory" className={`bg-[#0a0a0a] ${getFieldBorderClass('featuredCategory')} text-white`}>
                            <SelectValue placeholder="Select featured category" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a1a1a] border-gray-700 text-white">
                            <SelectItem value="Popular Car">Popular Car</SelectItem>
                            <SelectItem value="Luxury Car">Luxury Car</SelectItem>
                            <SelectItem value="Vintage Car">Vintage Car</SelectItem>
                            <SelectItem value="Family Car">Family Car</SelectItem>
                            <SelectItem value="Off-Road Car">Off-Road Car</SelectItem>
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

                {/* Searchable Feature Input */}
                <div className="relative feature-dropdown-container">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <Input
                            value={featureSearch}
                            onChange={(e) => handleFeatureInputChange(e.target.value)}
                            onFocus={() => setShowFeatureDropdown(true)}
                            placeholder="Search or type a new feature..."
                            className="pl-12 pr-12 bg-[#0a0a0a] border-gray-700 text-white placeholder:text-gray-500"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && featureSearch.trim()) {
                                    e.preventDefault();
                                    handleAddNewFeature();
                                }
                                if (e.key === 'Escape') {
                                    setShowFeatureDropdown(false);
                                }
                            }}
                        />
                        {featureSearch && (
                            <button
                                type="button"
                                onClick={() => {
                                    setFeatureSearch("");
                                    setShowFeatureDropdown(false);
                                }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Dropdown with search results - Autocomplete style */}
                    {showFeatureDropdown && (
                        <div className="absolute z-50 w-full mt-2 bg-[#1a1a1a] border border-gray-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                            {isLoadingFeatures ? (
                                <div className="p-4 text-center text-gray-400 text-sm">Loading features...</div>
                            ) : filteredFeatures.length > 0 ? (
                                <>
                                    {filteredFeatures.slice(0, 10).map((feature) => {
                                        const isSelected = selectedFeatureNameSet.has(
                                            normalizeFeatureName(feature.featureName)
                                        );
                                        return (
                                            <button
                                                key={feature.featureId}
                                                type="button"
                                                onClick={() => handleSelectFeature(feature.featureName)}
                                                disabled={isSelected}
                                                className={`w-full text-left px-4 py-3 hover:bg-gray-800 transition-colors flex items-center justify-between ${
                                                    isSelected
                                                        ? "bg-emerald-500/20 border-l-2 border-emerald-500"
                                                        : ""
                                                }`}
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <div className={`text-sm font-medium flex items-center gap-2 ${
                                                        isSelected ? "text-emerald-300" : "text-white"
                                                    }`}>
                                                        {isSelected && <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                                                        <span className="truncate">{feature.featureName}</span>
                                                    </div>
                                                    {feature.featureDescription && (
                                                        <div className="text-gray-400 text-xs mt-0.5 line-clamp-1">{feature.featureDescription}</div>
                                                    )}
                                                    {feature.featureCategory && (
                                                        <div className="text-gray-500 text-xs mt-1">Category: {feature.featureCategory}</div>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                    {featureSearch.trim() && !exactMatch && (
                                        <div className="border-t border-gray-700">
                                            <button
                                                type="button"
                                                onClick={handleAddNewFeature}
                                                disabled={isCreatingFeature}
                                                className="w-full text-left px-4 py-3 hover:bg-gray-800 transition-colors flex items-center gap-2 text-emerald-400 hover:text-emerald-300"
                                            >
                                                <Plus className="w-4 h-4" />
                                                <span className="text-sm font-medium">
                                                    {isCreatingFeature ? "Creating..." : `Create "${featureSearch.trim()}"`}
                                                </span>
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : featureSearch.trim() ? (
                                <div>
                                    <div className="p-3 text-xs text-gray-500 border-b border-gray-700">
                                        No matching features found
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleAddNewFeature}
                                        disabled={isCreatingFeature}
                                        className="w-full text-left px-4 py-3 hover:bg-gray-800 transition-colors flex items-center gap-2 text-emerald-400 hover:text-emerald-300"
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span className="text-sm font-medium">
                                            {isCreatingFeature ? "Creating..." : `Create "${featureSearch.trim()}"`}
                                        </span>
                                    </button>
                                </div>
                            ) : (
                                <div className="p-4 text-center text-gray-400 text-sm">
                                    Start typing to search features...
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Features currently available on this car */}
                <div>
                    <Label className="text-gray-300 text-sm mb-2 block">
                        Features on This Car ({selectedFeatures.length})
                    </Label>
                    <div className="max-h-48 overflow-y-auto rounded-lg border border-gray-700 bg-[#0a0a0a] p-3">
                        {selectedFeatures.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {selectedFeatures.map((feature) => (
                                    <div
                                        key={`selected-${feature}`}
                                        className="flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/20 px-3 py-1.5 text-sm text-emerald-300"
                                    >
                                        <Check className="h-3 w-3 text-emerald-400" />
                                        <span>{feature}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeFeature(feature)}
                                            className="ml-1 text-emerald-200 transition-colors hover:text-red-400"
                                            title="Remove feature from this car"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">No features assigned to this car yet.</p>
                        )}
                    </div>
                </div>

                {/* Always-visible available features list */}
                <div>
                    <Label className="text-gray-300 text-sm mb-2 block">
                        Available Features ({sortedAvailableFeatures.length})
                    </Label>
                    <div className="max-h-48 overflow-y-auto rounded-lg border border-gray-700 bg-[#0a0a0a] p-3">
                        {isLoadingFeatures ? (
                            <div className="text-sm text-gray-400">Loading features...</div>
                        ) : sortedAvailableFeatures.length === 0 ? (
                            <div className="text-sm text-gray-500">No features available yet.</div>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {sortedAvailableFeatures.map((feature) => {
                                    const isSelected = selectedFeatureNameSet.has(
                                        normalizeFeatureName(feature.featureName)
                                    );

                                    return (
                                        <button
                                            key={`available-${feature.featureId}`}
                                            type="button"
                                            onClick={() => handleSelectFeature(feature.featureName)}
                                            disabled={isSelected}
                                            className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                                                isSelected
                                                    ? "cursor-not-allowed border-emerald-500/40 bg-emerald-500/20 text-emerald-300"
                                                    : "border-gray-600 bg-[#141414] text-gray-300 hover:border-emerald-400 hover:text-emerald-300"
                                            }`}
                                            title={isSelected ? "Already selected" : "Add feature"}
                                        >
                                            {isSelected ? "Added: " : ""}{feature.featureName}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                        Existing features are shown here so admins can pick from them and avoid duplicate custom entries.
                    </p>
                </div>
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
