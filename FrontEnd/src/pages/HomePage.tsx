import { useEffect, useState } from "react";
import {HeroSection} from "../components/HeroSection.tsx";
import {Navbar} from "../components/Navbar.tsx";
import {CategorySections} from "../components/CategorySections.tsx";
import {BookingForm} from "../components/BookingForm.tsx";
import {BodyType} from "../components/BodyType.tsx";
import {FeaturedCollection} from "../components/FeaturedCollection.tsx";
import {HowItWorks} from "../components/HowItWorks.tsx";
import {Services} from "../components/Services.tsx";
import {Testimonials} from "../components/Testimonials.tsx";
import {Footer} from "../components/Footer.tsx";
import { carService } from "../services/carService.ts";
import type { Car } from "../data/cars.ts";

export default function HomePage() {
    const [cars, setCars] = useState<Car[]>([]);
    const [isLoadingCars, setIsLoadingCars] = useState(true);

    useEffect(() => {
        const loadCars = async () => {
            try {
                const fetchedCars = await carService.getAll();
                setCars(fetchedCars);
            } catch (error) {
                console.error("Failed to load homepage cars:", error);
                setCars([]);
            } finally {
                setIsLoadingCars(false);
            }
        };

        void loadCars();
    }, []);

    return (
        <div>
            <Navbar/>
            <HeroSection/>
            <BookingForm cars={cars} isLoading={isLoadingCars} />
            <CategorySections cars={cars} isLoading={isLoadingCars} />
            <BodyType cars={cars} isLoading={isLoadingCars} />
            <FeaturedCollection cars={cars} isLoading={isLoadingCars} />
            <HowItWorks/>
            <Testimonials/>
            <Services/>
            <Footer/>
        </div>
    )
}
