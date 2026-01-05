import {useEffect, useState} from 'react';
import {AdminLayout} from "./components/AdminLayout.tsx";
import {Car, CarCreateRequest} from "./types/Car.ts";
import {CarManagementPage} from "./pages/CarManagementPage.tsx";
import {carService} from "../../services/carService.ts";
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

    // Editing car Form

    // Load cars from API on mount
    useEffect(() => {
        carService.getAll()
            .then(setCars)
            .catch(console.error);
    }, []);
    
    const handleAddCar = async (carData: CarCreateRequest, image: File | null) => {
        try{

            //Step 1 validate we have an image
            if (!image) {
                toast.error("Please Select an image file");
                return;
            }

            // create a formData object that packages data for multipart
            const formData = new FormData();

            //append the image first
            formData.append("image", image);

            //Append all other fields
            // Form Data only Accepts Blobs/Files/ so we convert no's to Strings using to String
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

            // We send it to the Backend
            const createdCar = await carService.createCar(formData);

            // Update local state with the new car
            setCars(prev => [...prev, createdCar]);

            //close form and show success
            setIsFormOpen(false);
            toast.success("Car Added Successfully");
        } catch (error) {
            console.log(error);
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
        switch (currentPage){
            case "cars":
                return (
                    <CarManagementPage cars={cars} onAdd={openAddForm}/>
                )
        }
    }


    return(
        <>
            <AdminLayout
                title={getPageTitle()}
                currentPage={currentPage}
                onNavigate={setCurrentPage}
                onBack={onBack}
            >
                {renderPage()}
            </AdminLayout>

            {/* Add/Edit Car Form*/}
            <Dialog open={isFormOpen} onOpenChange={closeForm}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#1a1a1a] border-gray-800 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-white">
                            Add New Car
                        </DialogTitle>
                        <DialogDescription className="text-gray-400">
                            Enter the car details
                        </DialogDescription>
                    </DialogHeader>
                    <CarForm
                        car={editingCars || undefined}
                        onSubmit={editingCars ? () =>{console.log("Implement later")} : handleAddCar}
                        onCancel={closeForm}
                    />
                </DialogContent>
            </Dialog>
        </>
    )

}