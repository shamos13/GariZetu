import { useEffect, useState, useCallback } from 'react';
import { AdminLayout } from "./components/AdminLayout.tsx";
import { Car, CarCreateRequest } from "./types/Car.ts";
import { CarManagementPage } from "./pages/CarManagementPage.tsx";
import { UserManagementPage } from "./pages/UserManagementPage.tsx";
import { DashboardPage } from "./pages/DashboardPage.tsx";
import { adminCarService } from "../admin/service/AdminCarService.ts";
import { CarForm } from "./components/CarForm.tsx";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../components/ui/dialog.tsx";

interface AdminDashboardProps {
    onBack: () => void;
}

const ADMIN_PAGE_STORAGE_KEY = "admin_dashboard_current_page";

export default function AdminDashboard({ onBack }: AdminDashboardProps) {
    // Load saved page from localStorage on mount, default to "dashboard"
    const [currentPage, setCurrentPage] = useState(() => {
        const savedPage = localStorage.getItem(ADMIN_PAGE_STORAGE_KEY);
        return savedPage || "dashboard";
    });
    const [cars, setCars] = useState<Car[]>([]);
    const [editingCar, setEditingCar] = useState<Car | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [carsLoaded, setCarsLoaded] = useState(false);
    const closeForm = () => setIsFormOpen(false);

    // Save current page to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem(ADMIN_PAGE_STORAGE_KEY, currentPage);
    }, [currentPage]);

    // Wrapper function to update page and persist it
    const handlePageChange = useCallback((page: string) => {
        setCurrentPage(page);
        localStorage.setItem(ADMIN_PAGE_STORAGE_KEY, page);
    }, []);

    // Add car form
    const openAddForm = () => {
        setIsFormOpen(true);
        setEditingCar(null);
    }

    // Load cars from backend only when cars page is active and not already loaded
    useEffect(() => {
        if (currentPage === "cars" && !carsLoaded) {
            adminCarService.getAll()
                .then((data) => {
                    setCars(data);
                    setCarsLoaded(true);
                })
                .catch(console.error);
        }
    }, [currentPage, carsLoaded]);

    const handleAddCar = async (carData: CarCreateRequest, image: File | null) => {
        try {
            // Step 1: Validate we have an image
            if (!image) {
                toast.error("Please select an image file");
                return;
            }

            // Step 2: Create FormData object for multipart/form-data
            const formData = new FormData();

            // Append the image first
            formData.append("image", image);

            // Append all required fields
            // FormData only accepts Blobs/Files/strings, so convert numbers to strings
            formData.append("make", carData.make);
            formData.append("registrationNumber", carData.registrationNumber);
            formData.append("vehicleModel", carData.vehicleModel);
            formData.append("year", carData.year.toString());
            formData.append("engineCapacity", carData.engineCapacity.toString());
            formData.append("colour", carData.colour);
            formData.append("mileage", carData.mileage.toString());
            formData.append("dailyPrice", carData.dailyPrice.toString());
            formData.append("seatingCapacity", carData.seatingCapacity.toString());
            formData.append("transmissionType", carData.transmissionType);
            formData.append("fuelType", carData.fuelType);
            formData.append("carStatus", carData.carStatus);
            formData.append("bodyType", carData.bodyType);

            // ✅ FIXED: Append description only if it exists
            if (carData.description) {
                formData.append("description", carData.description);
            }

            // ✅ FIXED: Loop through features array and append each one separately
            // This creates multiple "featureName" entries, which Spring Boot handles correctly
            if (carData.featureName && carData.featureName.length > 0) {
                carData.featureName.forEach(name => {
                    formData.append("featureName", name);
                });
            }

            // Step 3: Send to backend
            const createdCar = await adminCarService.createCar(formData);

            // Step 4: Update local state with the new car
            setCars(prev => [...prev, createdCar]);
            setCarsLoaded(true);

            // Step 5: Close form and show success message
            setIsFormOpen(false);
            toast.success("Car added successfully!");

        } catch (error) {
            console.error("Failed to create car:", error);
            toast.error("Failed to add car. Please try again.");
        }
    };

    const handleEditClick = (car: Car) => {
        setEditingCar(car);
        setIsFormOpen(true);
    };

    const handleDeleteCar = async (car: Car) => {
        const confirmed = window.confirm(`Are you sure you want to delete ${car.make} (${car.registrationNumber})?`);
        if (!confirmed) return;

        try {
            await adminCarService.deleteCar(car.carId);
            setCars(prev => prev.filter(c => c.carId !== car.carId));
            setCarsLoaded(true);
            toast.success("Car deleted successfully");
        } catch (error) {
            console.error("Failed to delete car:", error);
            toast.error("Failed to delete car. Please try again.");
        }
    };

    const handleUpdateCar = async (carData: CarCreateRequest, image: File | null) => {
        if (!editingCar) return;

        try {
            // Send all fields so any of them can be updated
            const payload = {
                make: carData.make,
                registrationNumber: carData.registrationNumber,
                vehicleModel: carData.vehicleModel,
                year: carData.year,
                engineCapacity: carData.engineCapacity,
                colour: carData.colour,
                mileage: carData.mileage,
                dailyPrice: carData.dailyPrice,
                seatingCapacity: carData.seatingCapacity,
                carStatus: carData.carStatus,
                transmissionType: carData.transmissionType,
                fuelType: carData.fuelType,
                bodyType: carData.bodyType,
                description: carData.description,
                featureName: carData.featureName,
            };

            const updatedCar = await adminCarService.updateCar(
                editingCar.carId,
                payload,
                image ?? undefined
            );

            setCars(prev =>
                prev.map(c => (c.carId === updatedCar.carId ? updatedCar : c))
            );
            setCarsLoaded(true);

            setIsFormOpen(false);
            setEditingCar(null);
            toast.success("Car updated successfully!");
        } catch (error) {
            console.error("Failed to update car:", error);
            toast.error("Failed to update car. Please try again.");
        }
    };

    const handleQuickStatusChange = async (car: Car, newStatus: Car["carStatus"]) => {
        try {
            const updatedCar = await adminCarService.updateCar(
                car.carId,
                { carStatus: newStatus }
            );

            setCars(prev =>
                prev.map(c => (c.carId === updatedCar.carId ? updatedCar : c))
            );
            setCarsLoaded(true);

            toast.success(`Car status updated to ${newStatus}`);
        } catch (error) {
            console.error("Failed to update car status:", error);
            toast.error("Failed to update car status. Please try again.");
        }
    };

    const getPageTitle = () => {
        switch (currentPage) {
            case "dashboard":
                return "Dashboard";
            case "cars":
                return "Cars";
            case "bookings":
                return "Bookings";
            case "users":
                return "Users";
            case "payments":
                return "Payments";
            case "reports":
                return "Reports";
            case "settings":
                return "Settings";
            default:
                return "Dashboard";
        }
    };

    // Refresh cars list manually
    const refreshCars = useCallback(() => {
        adminCarService.getAll()
            .then((data) => {
                setCars(data);
                setCarsLoaded(true);
            })
            .catch(console.error);
    }, []);

    const renderPage = () => {
        switch (currentPage) {
            case "dashboard":
                return <DashboardPage key="dashboard" />;
            case "cars":
                return (
                    <CarManagementPage
                        key="cars"
                        cars={cars}
                        onAdd={openAddForm}
                        onEdit={handleEditClick}
                        onDelete={handleDeleteCar}
                        onStatusChange={handleQuickStatusChange}
                    />
                );
            case "users":
                return <UserManagementPage key="users" />;
            default:
                return <DashboardPage key="dashboard-default" />;
        }
    }

    return (
        <>
            <AdminLayout
                title={getPageTitle()}
                currentPage={currentPage}
                onNavigate={handlePageChange}
                onBack={onBack}
            >
                {renderPage()}
            </AdminLayout>

            {/* Add/Edit Car Form Dialog */}
            <Dialog open={isFormOpen} onOpenChange={closeForm}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#1a1a1a] border-gray-800 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-white">
                            {editingCar ? "Edit Car" : "Add New Car"}
                        </DialogTitle>
                        <DialogDescription className="text-gray-400">
                            {editingCar ? "Update the car details below" : "Enter the car details below"}
                        </DialogDescription>
                    </DialogHeader>
                    <CarForm
                        car={editingCar || undefined}
                        onSubmit={editingCar ? handleUpdateCar : handleAddCar}
                        onCancel={closeForm}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
}