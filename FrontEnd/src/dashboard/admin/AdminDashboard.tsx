import {useEffect, useState} from 'react';
import {AdminLayout} from "./components/AdminLayout.tsx";
import {Car} from "./types/Car.ts";
import {CarManagementPage} from "./pages/CarManagementPage.tsx";

const INITIAL_CARS: Car[] = [
    {
        id: "1",
        name: "Audi A8 L 2022",
        year: 2022,
        price: 4000,
        category: "Sedan",
        transmission: "Auto",
        seats: 4,
        fuelType: "Petrol",
        image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80",
        description: "Luxury sedan with premium features",
        available: true,
    },
    {
        id: "2",
        name: "Nissan Maxima Platinum 2022",
        year: 2022,
        price: 3500,
        category: "Sedan",
        transmission: "Auto",
        seats: 4,
        fuelType: "Petrol",
        image: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800&q=80",
        description: "Comfortable and reliable sedan",
        available: false,
    },
    {
        id: "3",
        name: "Porsche Cayenne GTS 2022",
        year: 2022,
        price: 5500,
        category: "Porsche",
        transmission: "Auto",
        seats: 4,
        fuelType: "Petrol",
        image: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&q=80",
        description: "High-performance luxury SUV",
        available: true,
    },
];


interface AdminDashboardProps {
    onBack: () => void;
}

export function AdminDashboard({ onBack }: AdminDashboardProps) {
    const [currentPage, setCurrentPage] = useState("dashboard");
    const [cars, setCars] = useState<Car[]>([]);


    // Load cars from localStorage on mount
    useEffect(() => {
        const storedCars = localStorage.getItem("garizetu_cars");
        if (storedCars) {
            setCars(JSON.parse(storedCars));
        } else {
            // Initialize with default cars
            setCars(INITIAL_CARS);
            localStorage.setItem("garizetu_cars", JSON.stringify(INITIAL_CARS));
        }
    }, []);


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
                    <CarManagementPage cars={cars}/>
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
        </>
    )

}