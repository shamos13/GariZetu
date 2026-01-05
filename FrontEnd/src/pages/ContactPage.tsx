import { useState } from "react";
import { 
    Phone, 
    Mail, 
    MapPin, 
    Clock, 
    Send,
    MessageCircle,
    CheckCircle2,
    ArrowRight
} from "lucide-react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

// Contact info
const CONTACT_INFO = {
    phone: "+254 712 345 678",
    altPhone: "+254 720 987 654",
    email: "info@garizetu.co.ke",
    supportEmail: "support@garizetu.co.ke",
    whatsapp: "+254712345678",
    address: "Westlands Business Park, 3rd Floor",
    city: "Nairobi, Kenya",
    hours: "Mon - Sat: 8:00 AM - 6:00 PM",
    sundayHours: "Sunday: 9:00 AM - 4:00 PM"
};

// Office locations
const LOCATIONS = [
    {
        name: "Nairobi - Headquarters",
        address: "Westlands Business Park, 3rd Floor, Waiyaki Way",
        phone: "+254 712 345 678",
        hours: "Mon-Sat: 8AM-6PM"
    },
    {
        name: "JKIA Airport Desk",
        address: "Jomo Kenyatta International Airport, Arrivals Hall",
        phone: "+254 720 987 654",
        hours: "Daily: 6AM-11PM"
    },
    {
        name: "Mombasa Branch",
        address: "Nyali Centre, Links Road",
        phone: "+254 733 456 789",
        hours: "Mon-Sat: 8AM-6PM"
    }
];

// FAQ items
const FAQS = [
    {
        question: "What documents do I need to rent a car?",
        answer: "You need a valid driving license (at least 2 years old), National ID or Passport, and a credit/debit card for the deposit."
    },
    {
        question: "Is there a minimum rental period?",
        answer: "Yes, our minimum rental period is 24 hours. We offer competitive rates for weekly and monthly rentals."
    },
    {
        question: "Do you offer airport pickup?",
        answer: "Yes! We offer convenient pickup and drop-off at JKIA and Wilson Airport. Pre-booking is recommended."
    },
    {
        question: "What's included in the rental price?",
        answer: "All rentals include basic insurance, 24/7 roadside assistance, and unlimited mileage within Kenya."
    }
];

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setIsSubmitting(false);
        setIsSubmitted(true);
        setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    };

    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            
            {/* Hero Section */}
            <section className="bg-black pt-32 pb-16">
                <div className="max-w-6xl mx-auto px-5 md:px-8">
                    <div className="max-w-2xl">
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Get in Touch
                        </h1>
                        <p className="text-lg text-gray-400">
                            Have questions? We're here to help. Reach out to our team through any of the channels below.
                        </p>
                    </div>
                </div>
            </section>

            {/* Quick Contact Cards */}
            <section className="relative -mt-8 z-10 mb-16">
                <div className="max-w-6xl mx-auto px-5 md:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Phone */}
                        <a 
                            href={`tel:${CONTACT_INFO.phone}`}
                            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:border-black transition-all group"
                        >
                            <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Phone className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="font-bold text-gray-900 mb-1">Call Us</h3>
                            <p className="text-gray-600 text-sm mb-3">Available during business hours</p>
                            <p className="font-semibold text-black">{CONTACT_INFO.phone}</p>
                            <p className="text-sm text-gray-500">{CONTACT_INFO.altPhone}</p>
                        </a>

                        {/* WhatsApp */}
                        <a 
                            href={`https://wa.me/${CONTACT_INFO.whatsapp}?text=Hello GariZetu, I'd like to inquire about car rental.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:border-emerald-500 transition-all group"
                        >
                            <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <MessageCircle className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="font-bold text-gray-900 mb-1">WhatsApp</h3>
                            <p className="text-gray-600 text-sm mb-3">Quick responses 24/7</p>
                            <p className="font-semibold text-emerald-600 flex items-center gap-2">
                                Chat Now <ArrowRight className="w-4 h-4" />
                            </p>
                        </a>

                        {/* Email */}
                        <a 
                            href={`mailto:${CONTACT_INFO.email}`}
                            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:border-black transition-all group"
                        >
                            <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Mail className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="font-bold text-gray-900 mb-1">Email Us</h3>
                            <p className="text-gray-600 text-sm mb-3">We'll respond within 24 hours</p>
                            <p className="font-semibold text-black">{CONTACT_INFO.email}</p>
                            <p className="text-sm text-gray-500">{CONTACT_INFO.supportEmail}</p>
                        </a>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-16">
                <div className="max-w-6xl mx-auto px-5 md:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Contact Form */}
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send Us a Message</h2>
                            
                            {isSubmitted ? (
                                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center">
                                    <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Message Sent!</h3>
                                    <p className="text-gray-600 mb-6">
                                        Thank you for reaching out. We'll get back to you within 24 hours.
                                    </p>
                                    <button
                                        onClick={() => setIsSubmitted(false)}
                                        className="text-emerald-600 font-medium hover:underline"
                                    >
                                        Send another message
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Your Name *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                placeholder="John Doe"
                                                className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Phone Number *
                                            </label>
                                            <input
                                                type="tel"
                                                required
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                placeholder="+254 712 345 678"
                                                className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email Address *
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="john@example.com"
                                            className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Subject
                                        </label>
                                        <select
                                            value={formData.subject}
                                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
                                        >
                                            <option value="">Select a topic</option>
                                            <option value="booking">Booking Inquiry</option>
                                            <option value="pricing">Pricing & Availability</option>
                                            <option value="support">Customer Support</option>
                                            <option value="feedback">Feedback</option>
                                            <option value="corporate">Corporate Rentals</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Message *
                                        </label>
                                        <textarea
                                            required
                                            rows={5}
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            placeholder="How can we help you?"
                                            className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none"
                                        />
                                    </div>
                                    
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                                            isSubmitting
                                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                                : "bg-black text-white hover:bg-zinc-800"
                                        }`}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                Send Message
                                                <Send className="w-4 h-4" />
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>

                        {/* Info & Map */}
                        <div className="space-y-8">
                            {/* Business Hours */}
                            <div className="bg-gray-50 rounded-2xl p-6">
                                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Clock className="w-5 h-5" />
                                    Business Hours
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Monday - Saturday</span>
                                        <span className="font-medium text-gray-900">8:00 AM - 6:00 PM</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Sunday</span>
                                        <span className="font-medium text-gray-900">9:00 AM - 4:00 PM</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">JKIA Desk</span>
                                        <span className="font-medium text-emerald-600">6:00 AM - 11:00 PM</span>
                                    </div>
                                </div>
                            </div>

                            {/* Map Placeholder */}
                            <div className="bg-gray-100 rounded-2xl overflow-hidden">
                                <div className="aspect-video relative">
                                    {/* Replace with actual Google Maps embed */}
                                    <iframe
                                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.8193!2d36.8072!3d-1.2641!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMcKwMTUnNTAuOCJTIDM2wrA0OCcyNi4wIkU!5e0!3m2!1sen!2ske!4v1234567890"
                                        width="100%"
                                        height="100%"
                                        style={{ border: 0 }}
                                        allowFullScreen
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        className="absolute inset-0"
                                    />
                                </div>
                                <div className="p-4 bg-white">
                                    <p className="font-medium text-gray-900 flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-black" />
                                        {CONTACT_INFO.address}
                                    </p>
                                    <p className="text-sm text-gray-500 ml-6">{CONTACT_INFO.city}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Our Locations */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-6xl mx-auto px-5 md:px-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8">Our Locations</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {LOCATIONS.map((location) => (
                            <div key={location.name} className="bg-white rounded-2xl p-6 border border-gray-100">
                                <h3 className="font-bold text-gray-900 mb-2">{location.name}</h3>
                                <p className="text-sm text-gray-600 mb-4">{location.address}</p>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Phone className="w-4 h-4 text-gray-400" />
                                        <a href={`tel:${location.phone}`} className="text-gray-700 hover:text-black">
                                            {location.phone}
                                        </a>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Clock className="w-4 h-4 text-gray-400" />
                                        <span className="text-gray-700">{location.hours}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-16">
                <div className="max-w-4xl mx-auto px-5 md:px-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                        Frequently Asked Questions
                    </h2>
                    
                    <div className="space-y-4">
                        {FAQS.map((faq, index) => (
                            <div key={index} className="bg-gray-50 rounded-xl p-6">
                                <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">{faq.answer}</p>
                            </div>
                        ))}
                    </div>
                    
                    <div className="mt-8 text-center">
                        <p className="text-gray-600">
                            Still have questions? {" "}
                            <a 
                                href={`https://wa.me/${CONTACT_INFO.whatsapp}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-600 font-medium hover:underline"
                            >
                                Chat with us on WhatsApp
                            </a>
                        </p>
                    </div>
                </div>
            </section>

            {/* CTA Banner */}
            <section className="bg-black py-16">
                <div className="max-w-4xl mx-auto px-5 md:px-8 text-center">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                        Ready to Hit the Road?
                    </h2>
                    <p className="text-gray-400 mb-8">
                        Browse our collection of premium vehicles and book your perfect ride today.
                    </p>
                    <a 
                        href="/vehicles"
                        className="inline-block px-8 py-4 bg-white text-black rounded-xl font-semibold hover:bg-gray-100 transition-colors"
                    >
                        Browse Vehicles
                    </a>
                </div>
            </section>

            <Footer />
        </div>
    );
}

