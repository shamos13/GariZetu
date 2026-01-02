import {HeroSection} from "../components/HeroSection.tsx";
import {Navbar} from "../components/Navbar.tsx";
import {CategorySections} from "../components/CategorySections.tsx";
import {BookingForm} from "../components/BookingForm.tsx";
import {BodyType} from "../components/BodyType.tsx";

export default function HomePage() {
    return (
        <div className="min-h-screen">
            <Navbar/>
            <HeroSection/>
            <BookingForm/>
            <CategorySections/>
            <BodyType/>
        </div>
    )
}