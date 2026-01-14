import {useEffect, useState} from 'react';
import {AdminLayout} from "./components/AdminLayout.tsx";
import {Car, CarCreateRequest} from "./types/Car.ts";
import {CarManagementPage} from "./pages/CarManagementPage.tsx";
import {carService} from "../../services/carService.ts";
import {adminCarService} from "../admin/service/AdminCarService.ts";
import {CarForm} from "./components/CarForm.tsx";
import {toast} from "sonner";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "../../components/ui/dialog.tsx";

interface AdminDashboardProps {
    onBack: () => void;
}

export default function AdminDashboard({ onBack }: AdminDashboardProps) {
    const [currentPage, setCurrentPage] = useState("dashboard");
    const [cars, setCars] = useState<Car[]>([]);
    const [editingCars, setEditingCars] = useState<Car | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const closeForm = () => setIsFormOpen(false);

    // Add car form
    const openAddForm = () => {
        setIsFormOpen(true);
        setEditingCars(null);
    }

    // Load cars from API on mount
    useEffect(() => {
        carService.getAll()
            .then(setCars)
            .catch(console.error);
    }, []);

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

            // Step 5: Close form and show success message
            setIsFormOpen(false);
            toast.success("Car added successfully!");

        } catch (error) {
            console.error("Failed to create car:", error);
            toast.error("Failed to add car. Please try again.");
        }
    }

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

    const renderPage = () => {
        switch (currentPage) {
            case "cars":
                return (
                    <CarManagementPage cars={cars} onAdd={openAddForm}/>
                );
            default:
                return <div className="text-white">Select a page from the sidebar</div>;
        }
    }

    return (
        <>
            <AdminLayout
                title={getPageTitle()}
                currentPage={currentPage}
                onNavigate={setCurrentPage}
                onBack={onBack}
            >
                {renderPage()}
            </AdminLayout>

            {/* Add/Edit Car Form Dialog */}
            <Dialog open={isFormOpen} onOpenChange={closeForm}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#1a1a1a] border-gray-800 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-white">
                            {editingCars ? "Edit Car" : "Add New Car"}
                        </DialogTitle>
                        <DialogDescription className="text-gray-400">
                            {editingCars ? "Update the car details below" : "Enter the car details below"}
                        </DialogDescription>
                    </DialogHeader>
                    <CarForm
                        car={editingCars || undefined}
                        onSubmit={editingCars ? () => {console.log("Update feature coming soon")} : handleAddCar}
                        onCancel={closeForm}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
}