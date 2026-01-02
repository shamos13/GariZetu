import {HeroSection} from "../components/HeroSection.tsx";
import {Navbar} from "../components/Navbar.tsx";
import {CategorySections} from "../components/CategorySection.tsx";
import {BookingForm} from "../components/BookingForm.tsx";

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