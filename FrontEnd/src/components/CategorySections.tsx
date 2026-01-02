import { ArrowRight } from "lucide-react";

const brands = [
    { name: "Toyota", icon: "/logos/toyota-7.svg" },
    { name: "Mercedes-Benz", icon: "/logos/mercedes-benz-8.svg" },
    { name: "BMW", icon: "/logos/bmw-7.svg" },
    { name: "Volkswagen", icon: "/logos/volkswagen-10.svg" },
    { name: "Audi", icon: "/logos/audi.svg" },
    { name: "Nissan", icon: "/logos/nissan.svg" },
];

export function CategorySections() {
    return (
        <section className="py-20 px-4 md:px-12 bg-white max-w-7xl mx-auto">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-10">
                    <h2 className="text-xl font-bold tracking-tight">Rent by Brands</h2>
                    <button className="hidden md:flex items-center gap-2 text-sm font-semibold hover:gap-3 transition-all">
                        View all <ArrowRight className="w-4 h-4" />
                    </button>
                </div>

                {/* Brand Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {brands.map((brand) => (
                        <div
                            key={brand.name}
                            className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors cursor-pointer group"
                        >
                            {/* Logo Container */}
                            <div className="w-12 h-12 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                                <img
                                    src={brand.icon}
                                    alt={`${brand.name} logo`}
                                    className="w-full h-full object-contain"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            
        </section>
    );
}