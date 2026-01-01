import {HeroSection} from "../components/HeroSection.tsx";
import {Navbar} from "../components/Navbar.tsx";
import {BookingForm} from "../components/BookingForm.tsx";
import {CategorySections} from "../components/CategorySection.tsx";

export default function HomePage() {
    return (
        <div className="min-h-screen">
            <Navbar/>
            <HeroSection/>
            <BookingForm/>
            <CategorySections/>
        </div>
    )
}