import {useEffect, useState} from 'react';
import {AdminLayout} from "./components/AdminLayout.tsx";
import {Car, CarCreateRequest} from "./types/Car.ts";
import {CarManagementPage} from "./pages/CarManagementPage.tsx";
import { carService } from "../../services/carService.ts";
import {CarForm} from "./components/CarForm.tsx";
import {toast} from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../components/ui/dialog.tsx";

interface AdminDashboardProps {
    onBack: () => void;
}

export function AdminDashboard({ onBack }: AdminDashboardProps) {
    const [currentPage, setCurrentPage] = useState("dashboard");
    const [cars, setCars] = useState<Car[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const openAddForm = () => setIsFormOpen(true);
    const closeForm = () => setIsFormOpen(false);


    // Load cars from localStorage on mount
    useEffect(() => {
        carService.getAll()
            .then(setCars)
            .catch(console.error);
    }, []);
    
    const handleAddCar = async (carData: CarCreateRequest) => {
        try{
            const createdCar = await carService.createCar(carData)
            setCars(prev => [...prev, createdCar]);
            setIsFormOpen(false);
            toast.success("Car added Successfully!");
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

            {/* Add Car Form*/}
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
                        car={undefined}
                        onSubmit={handleAddCar}
                        onCancel={closeForm}
                    />
                </DialogContent>
            </Dialog>
        </>
    )

}