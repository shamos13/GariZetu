import { ArrowRight } from "lucide-react";

const brands = [
    { name: "Toyota", icon: "/logos/toyota-7.svg" },
    { name: "Mercedes-Benz", icon: "/logos/mercedes-benz-8.svg" },
    { name: "BMW", icon: "/logos/bmw-7.svg" },
    { name: "Volkswagen", icon: "/logos/volkswagen-10.svg" },
    { name: "Audi", icon: "/logos/audi (1).svg" },
    { name: "Nissan", icon: "/logos/nissan.svg" },
];

export function CategorySections() {
    return (
        <section className="section-space bg-white">
            <div className="layout-container">
                {/* Header */}
                <div className="mb-5 flex items-center justify-between gap-3">
                    <h2 className="text-lg font-bold tracking-tight sm:text-xl">Rent by Brands</h2>
                    <button className="hidden md:flex items-center gap-2 text-sm font-semibold hover:gap-3 transition-all">
                        View all <ArrowRight className="w-4 h-4" />
                    </button>
                </div>

                {/* Brand Grid */}
                <div className="-mx-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-3 pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-6">
                    {brands.map((brand) => (
                        <div
                            key={brand.name}
                            className="group flex min-w-[8.75rem] shrink-0 snap-start cursor-pointer flex-col items-center justify-center rounded-xl bg-gray-50 p-3.5 transition-colors hover:bg-gray-100 sm:min-w-0 md:p-4"
                        >
                            {/* Logo Container */}
                            <div className="w-10 h-10 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                                <img
                                    src={brand.icon}
                                    alt={`${brand.name} logo`}
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <p className="text-xs font-medium text-gray-600 text-center">{brand.name}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-4 md:hidden">
                    <button className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700">
                        View all brands <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>


        </section>
    );
}
