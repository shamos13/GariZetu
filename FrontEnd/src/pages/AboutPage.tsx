import { 
    Shield, 
    Users, 
    Car, 
    Award, 
    CheckCircle2,
    MapPin,
    Calendar,
    Star,
    Heart
} from "lucide-react";
import { Link } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

// Team members data
const TEAM_MEMBERS = [
    {
        name: "James Mwangi",
        role: "Founder & CEO",
        image: "/team/ceo.jpg",
        bio: "A Nairobi native with 15+ years in the automotive industry."
    },
    {
        name: "Sarah Wanjiku",
        role: "Operations Director",
        image: "/team/ops.jpg",
        bio: "Former fleet manager ensuring seamless customer experiences."
    },
    {
        name: "David Ochieng",
        role: "Head of Customer Service",
        image: "/team/cs.jpg",
        bio: "Dedicated to making every rental journey memorable."
    },
    {
        name: "Grace Njeri",
        role: "Finance Manager",
        image: "/team/finance.jpg",
        bio: "Ensuring transparent pricing and financial integrity."
    }
];

// Stats
const STATS = [
    { value: "5,000+", label: "Happy Customers", icon: Users },
    { value: "200+", label: "Premium Vehicles", icon: Car },
    { value: "8+", label: "Years in Business", icon: Calendar },
    { value: "4.9", label: "Average Rating", icon: Star },
];

// Values
const VALUES = [
    {
        title: "Kenyan Owned & Operated",
        description: "Proudly Kenyan. GariZetu is built by Kenyans, for Kenyans. We understand local needs and preferences.",
        icon: Heart
    },
    {
        title: "Transparency First",
        description: "No hidden fees, no surprises. What you see is what you pay. We believe in honest, straightforward pricing.",
        icon: CheckCircle2
    },
    {
        title: "Quality Assurance",
        description: "Every vehicle in our fleet is regularly serviced, inspected, and meets our strict quality standards.",
        icon: Award
    },
    {
        title: "Customer Safety",
        description: "Your safety is paramount. All vehicles are fully insured and come with 24/7 roadside assistance.",
        icon: Shield
    }
];

export default function AboutPage() {
    return (
        <div className="bg-white">
            <Navbar />
            
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-black pb-8 pt-20 md:pt-24">
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-900 to-black" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-zinc-800/30 via-transparent to-transparent" />
                </div>
                
                <div className="layout-container relative">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
                            <MapPin className="w-4 h-4 text-emerald-400" />
                            <span className="text-sm text-white/90">Proudly Kenyan 🇰🇪</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                            Driving Kenya Forward, <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                                One Journey at a Time
                            </span>
                        </h1>
                        <p className="text-base text-gray-400 max-w-2xl">
                            GariZetu is more than a car rental service. We're a Kenyan company committed to making 
                            quality vehicles accessible to everyone, from business travelers to weekend adventurers.
                        </p>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="relative -mt-6 z-10">
                <div className="layout-container">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {STATS.map((stat) => (
                            <div key={stat.label} className="bg-white rounded-xl p-3.5 shadow-lg border border-gray-100 text-center">
                                <stat.icon className="w-6 h-6 text-black mx-auto mb-2" />
                                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Our Story */}
            <section className="section-space">
                <div className="layout-container">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
                        <div>
                            <h2 className="text-2xl md:text-[1.75rem] font-bold text-gray-900 mb-3">
                                Our Story
                            </h2>
                            <div className="space-y-2.5 text-gray-600 leading-relaxed">
                                <p>
                                    GariZetu was born in 2016 from a simple observation: Kenyans deserve better car rental 
                                    experiences. Our founder, James Mwangi, experienced firsthand the challenges of finding 
                                    reliable, well-maintained vehicles at fair prices.
                                </p>
                                <p>
                                    What started as a small fleet of 5 cars in Nairobi has grown into one of Kenya's most 
                                    trusted car rental services. Today, we operate across major cities with over 200 vehicles 
                                    ranging from economical sedans to luxury SUVs.
                                </p>
                                <p>
                                    Our name "GariZetu" means "Our Cars" in Swahili – because we believe every customer 
                                    should feel like they're driving their own car, with all the comfort and reliability 
                                    that comes with it.
                                </p>
                            </div>
                            
                            <div className="mt-5 flex flex-wrap gap-2.5">
                                <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                    <span className="text-sm font-medium text-gray-700">Licensed by NTSA</span>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                    <span className="text-sm font-medium text-gray-700">Registered in Kenya</span>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                    <span className="text-sm font-medium text-gray-700">Fully Insured Fleet</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="relative">
                            <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100">
                                <img 
                                    src="/about-hero.jpg" 
                                    alt="GariZetu Office" 
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="absolute -bottom-4 -left-4 bg-black text-white p-3.5 rounded-xl shadow-xl">
                                <p className="text-2xl font-bold">Since 2016</p>
                                <p className="text-sm text-gray-400">Serving Kenya with pride</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Our Values */}
            <section className="section-space bg-gray-50">
                <div className="layout-container">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl md:text-[1.75rem] font-bold text-gray-900 mb-2.5">
                            What Makes Us Different
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            We're not just another car rental company. We're your trusted partner for safe, 
                            reliable, and affordable mobility solutions across Kenya.
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {VALUES.map((value) => (
                            <div 
                                key={value.title}
                                className="bg-white rounded-xl p-4 border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all"
                            >
                                <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center mb-3">
                                    <value.icon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2.5">{value.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="section-space">
                <div className="layout-container">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl md:text-[1.75rem] font-bold text-gray-900 mb-2.5">
                            Meet the Team
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Behind GariZetu is a passionate team of Kenyan professionals dedicated to 
                            transforming your travel experience.
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {TEAM_MEMBERS.map((member) => (
                            <div key={member.name} className="text-center group">
                                <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-3">
                                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                                        <Users className="w-14 h-14 text-gray-400" />
                                    </div>
                                </div>
                                <h3 className="font-bold text-gray-900">{member.name}</h3>
                                <p className="text-sm text-emerald-600 font-medium mb-2">{member.role}</p>
                                <p className="text-sm text-gray-500">{member.bio}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Trust & Legitimacy */}
            <section className="section-space bg-black text-white">
                <div className="layout-container">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl md:text-[1.75rem] font-bold mb-2.5">
                            Your Trust, Our Priority
                        </h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            We understand that trusting a car rental service with your journey is a big decision. 
                            Here's why thousands of Kenyans choose GariZetu.
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div className="text-center p-3.5">
                            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Shield className="w-8 h-8 text-emerald-400" />
                            </div>
                            <h3 className="font-bold text-lg mb-2">Fully Licensed</h3>
                            <p className="text-gray-400 text-sm">
                                Registered with the Registrar of Companies and licensed by NTSA for car hire services.
                            </p>
                        </div>
                        
                        <div className="text-center p-3.5">
                            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Car className="w-8 h-8 text-emerald-400" />
                            </div>
                            <h3 className="font-bold text-lg mb-2">Verified Fleet</h3>
                            <p className="text-gray-400 text-sm">
                                All vehicles undergo rigorous inspection, are fully insured, and maintained to the highest standards.
                            </p>
                        </div>
                        
                        <div className="text-center p-3.5">
                            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Award className="w-8 h-8 text-emerald-400" />
                            </div>
                            <h3 className="font-bold text-lg mb-2">5,000+ Happy Customers</h3>
                            <p className="text-gray-400 text-sm">
                                Join thousands of satisfied customers who trust us for their transportation needs.
                            </p>
                        </div>
                    </div>
                    
                    <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                        <Link 
                            to="/vehicles"
                            className="px-6 py-2.5 bg-white text-black rounded-xl font-semibold hover:bg-gray-100 transition-colors"
                        >
                            Browse Our Fleet
                        </Link>
                        <Link 
                            to="/contact"
                            className="px-6 py-2.5 border border-white/30 text-white rounded-xl font-semibold hover:bg-white/10 transition-colors"
                        >
                            Contact Us
                        </Link>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="section-space-sm bg-emerald-600">
                <div className="layout-container max-w-4xl text-center">
                    <h2 className="text-2xl md:text-[1.75rem] font-bold text-white mb-2.5">
                        Ready to Experience GariZetu?
                    </h2>
                    <p className="text-emerald-100 mb-5">
                        Join thousands of Kenyans who trust us for their journeys. Book your ride today!
                    </p>
                    <Link 
                        to="/vehicles"
                        className="inline-block px-6 py-2.5 bg-white text-emerald-600 rounded-xl font-bold hover:bg-gray-100 transition-colors"
                    >
                        Start Your Journey
                    </Link>
                </div>
            </section>

            <Footer />
        </div>
    );
}
