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
import { siteContentService } from "../services/SiteContentService.ts";

export default function HomePage() {
    const [cars, setCars] = useState<Car[]>([]);
    const [isLoadingCars, setIsLoadingCars] = useState(true);
    const [brandLogoOverrides, setBrandLogoOverrides] = useState<Record<string, string>>({});

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

    useEffect(() => {
        const loadBrandLogos = async () => {
            try {
                const overrides = await siteContentService.getPublicBrandLogos();
                setBrandLogoOverrides(
                    overrides.reduce<Record<string, string>>((accumulator, item) => {
                        accumulator[item.brandKey] = item.logoUrl;
                        return accumulator;
                    }, {})
                );
            } catch (error) {
                console.error("Failed to load brand logo overrides:", error);
                setBrandLogoOverrides({});
            }
        };

        void loadBrandLogos();
    }, []);

    return (
        <div>
            <Navbar/>
            <HeroSection/>
            <BookingForm cars={cars} isLoading={isLoadingCars} />
            <CategorySections
                cars={cars}
                isLoading={isLoadingCars}
                brandLogoOverrides={brandLogoOverrides}
            />
            <BodyType cars={cars} isLoading={isLoadingCars} />
            <FeaturedCollection cars={cars} isLoading={isLoadingCars} />
            <HowItWorks/>
            <Testimonials/>
            <Services/>
            <Footer/>
        </div>
    )
}
