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

export default function HomePage() {
    return (
        <div>
            <Navbar/>
            <HeroSection/>
            <BookingForm/>
            <CategorySections/>
            <BodyType/>
            <FeaturedCollection/>
            <HowItWorks/>
            <Testimonials/>
            <Services/>
            <Footer/>
        </div>
    )
}
