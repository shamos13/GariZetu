import { lazy, Suspense, useEffect, useState, useCallback } from 'react';
import { AdminLayout } from "./components/AdminLayout.tsx";
import { Car } from "./types/Car.ts";
import { adminCarService } from "../admin/service/AdminCarService.ts";
import { CarForm, type CarFormData, type GallerySubmitPayload } from "./components/CarForm.tsx";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../components/ui/dialog.tsx";
import { bookingService } from "../../services/BookingService.ts";
import { getAdminActionErrorMessage } from "../../lib/adminErrorUtils.ts";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "../../components/ui/alert-dialog.tsx";

const CarManagementPage = lazy(() =>
    import("./pages/CarManagementPage.tsx").then((module) => ({ default: module.CarManagementPage }))
);
const UserManagementPage = lazy(() =>
    import("./pages/UserManagementPage.tsx").then((module) => ({ default: module.UserManagementPage }))
);
const DashboardPage = lazy(() =>
    import("./pages/DashboardPage.tsx").then((module) => ({ default: module.DashboardPage }))
);
const BookingManagementPage = lazy(() =>
    import("./pages/BookingManagementPage.tsx").then((module) => ({ default: module.BookingManagementPage }))
);

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
    const [bookingNotificationCount, setBookingNotificationCount] = useState(0);
    const [carPendingDelete, setCarPendingDelete] = useState<Car | null>(null);
    const [isDeletingCar, setIsDeletingCar] = useState(false);
    const closeForm = () => setIsFormOpen(false);

    const pageLoader = (
        <div className="flex min-h-[34vh] items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-700 border-t-white" />
        </div>
    );

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

    const refreshBookingNotifications = useCallback(async () => {
        try {
            const notifications = await bookingService.getAdminNotifications(false);
            setBookingNotificationCount(notifications.length);
        } catch (error) {
            console.error("Failed to fetch booking notifications:", error);
            toast.error(getAdminActionErrorMessage(error, "Unable to load admin notifications."));
        }
    }, []);

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

    useEffect(() => {
        void refreshBookingNotifications();
    }, [refreshBookingNotifications]);

    const handleAddCar = async (carData: CarFormData, image: File | null, gallery: GallerySubmitPayload) => {
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
            formData.append("featuredCategory", carData.featuredCategory);

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

            if (gallery.newImages.length > 0) {
                gallery.newImages.forEach((file) => {
                    formData.append("galleryImages", file);
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
            toast.error(getAdminActionErrorMessage(error, "Failed to add car. Please try again."));
        }
    };

    const handleEditClick = (car: Car) => {
        setEditingCar(car);
        setIsFormOpen(true);
    };

    const handleDeleteCar = async () => {
        if (!carPendingDelete) return;
        try {
            setIsDeletingCar(true);
            await adminCarService.deleteCar(carPendingDelete.carId);
            setCars(prev => prev.filter(c => c.carId !== carPendingDelete.carId));
            setCarsLoaded(true);
            toast.success("Car deleted successfully");
            setCarPendingDelete(null);
        } catch (error) {
            console.error("Failed to delete car:", error);
            toast.error(getAdminActionErrorMessage(error, "Failed to delete car. Please try again."));
        } finally {
            setIsDeletingCar(false);
        }
    };

    const handleUpdateCar = async (carData: CarFormData, image: File | null, gallery: GallerySubmitPayload) => {
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
                featuredCategory: carData.featuredCategory,
                description: carData.description,
                featureName: carData.featureName,
            };

            const updatedCar = await adminCarService.updateCar(
                editingCar.carId,
                payload,
                image ?? undefined,
                gallery.newImages,
                gallery.existingUrls,
                gallery.hasChanges
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
            toast.error(getAdminActionErrorMessage(error, "Failed to update car. Please try again."));
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
            toast.error(getAdminActionErrorMessage(error, "Failed to update car status. Please try again."));
        }
    };

    const getPageTitle = () => {
        switch (currentPage) {
            case "dashboard":
                return "Dashboard";
            case "cars":
                return "Fleet Management";
            case "bookings":
                return "Bookings";
            case "users":
                return "Customers";
            case "payments":
                return "Payments";
            case "reports":
                return "Analytics";
            case "settings":
                return "Configuration";
            default:
                return "Dashboard";
        }
    };

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
                        onDelete={setCarPendingDelete}
                        onStatusChange={handleQuickStatusChange}
                    />
                );
            case "users":
                return <UserManagementPage key="users" />;
            case "bookings":
                return (
                    <BookingManagementPage
                        key="bookings"
                        onNotificationCountChange={setBookingNotificationCount}
                    />
                );
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
                bookingNotificationCount={bookingNotificationCount}
                onBack={onBack}
            >
                <Suspense fallback={pageLoader}>
                    {renderPage()}
                </Suspense>
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

            <AlertDialog
                open={Boolean(carPendingDelete)}
                onOpenChange={(open) => {
                    if (!open && !isDeletingCar) {
                        setCarPendingDelete(null);
                    }
                }}
            >
                <AlertDialogContent className="bg-[#1a1a1a] border-gray-800 text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-semibold text-white">
                            Delete Vehicle
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-400">
                            {carPendingDelete
                                ? `Delete ${carPendingDelete.make} (${carPendingDelete.registrationNumber}) from the fleet? This action cannot be undone.`
                                : "Delete this vehicle? This action cannot be undone."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            disabled={isDeletingCar}
                            onClick={() => setCarPendingDelete(null)}
                            className="bg-gray-800 text-white border-gray-700 hover:bg-gray-700"
                        >
                            Keep Vehicle
                        </AlertDialogCancel>
                        <AlertDialogAction
                            disabled={isDeletingCar}
                            onClick={() => {
                                void handleDeleteCar();
                            }}
                            className="bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                        >
                            {isDeletingCar ? "Deleting..." : "Delete Vehicle"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
