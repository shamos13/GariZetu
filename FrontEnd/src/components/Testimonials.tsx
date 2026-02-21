import { Star, Quote } from "lucide-react";

const TESTIMONIALS = [
    {
        id: 1,
        name: "James Mwangi",
        role: "Business Executive",
        avatar: "/avatars/james.jpg",
        rating: 5,
        text: "GariZetu made my airport pickup seamless. The car was spotless, and the service was exceptional. I've been a repeat customer ever since!",
        location: "Nairobi"
    },
    {
        id: 2,
        name: "Sarah Wanjiku",
        role: "Travel Blogger",
        avatar: "/avatars/sarah.jpg",
        rating: 5,
        text: "I've rented from many companies across Kenya, but GariZetu stands out. Their attention to detail and customer care is unmatched.",
        location: "Mombasa"
    },
    {
        id: 3,
        name: "David Ochieng",
        role: "Safari Guide",
        avatar: "/avatars/david.jpg",
        rating: 5,
        text: "For my safari business, I need reliable vehicles. GariZetu's Land Cruisers are always in perfect condition. Highly recommended!",
        location: "Nakuru"
    },
];

export function Testimonials() {
    return (
        <section className="section-space bg-gray-50">
            <div className="layout-container">
                {/* Header */}
                <div className="text-center mb-6">
                    <p className="text-sm font-medium text-emerald-600 uppercase tracking-wider mb-2">
                        Testimonials
                    </p>
                    <h2 className="text-2xl md:text-[1.75rem] font-bold text-gray-900 mb-2.5">
                        What Our Customers Say
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Don't just take our word for it. Here's what our valued customers have to say about their experience with GariZetu.
                    </p>
                </div>

                {/* Testimonials Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                    {TESTIMONIALS.map((testimonial, index) => (
                        <div 
                            key={testimonial.id}
                            className={`bg-white rounded-xl p-3.5 shadow-sm hover:shadow-lg transition-all duration-300 ${
                                index === 1 ? "md:-translate-y-2" : ""
                            }`}
                        >
                            {/* Quote Icon */}
                            <div className="w-9 h-9 bg-black rounded-full flex items-center justify-center mb-3">
                                <Quote className="w-5 h-5 text-white" />
                            </div>

                            {/* Rating */}
                            <div className="flex items-center gap-1 mb-3">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <Star 
                                        key={i} 
                                        className="w-4 h-4 text-amber-400 fill-amber-400" 
                                    />
                                ))}
                            </div>

                            {/* Text */}
                            <p className="text-gray-600 mb-3 leading-relaxed text-sm">
                                "{testimonial.text}"
                            </p>

                            {/* Author */}
                            <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                                <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden flex items-center justify-center">
                                    <span className="text-lg font-semibold text-gray-500">
                                        {testimonial.name.charAt(0)}
                                    </span>
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                                    <p className="text-sm text-gray-500">
                                        {testimonial.role} • {testimonial.location}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Stats */}
                <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                        { value: "5,000+", label: "Happy Customers" },
                        { value: "4.9/5", label: "Average Rating" },
                        { value: "98%", label: "Satisfaction Rate" },
                        { value: "24/7", label: "Customer Support" },
                    ].map((stat) => (
                        <div key={stat.label} className="text-center">
                            <p className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
                                {stat.value}
                            </p>
                            <p className="text-sm text-gray-500">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
