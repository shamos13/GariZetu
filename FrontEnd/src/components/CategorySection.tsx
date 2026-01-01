

const BRANDS = [
    { name: "Toyota", icon: "/toyota-logo.png" },
    { name: "Mercedes-Benz", icon: "/mercedes-logo.png" },
    { name: "BMW", icon: "/bmw-logo.png" },
    { name: "Volkswagen", icon: "/volkswagen-logo.png" },
    { name: "Audi", icon: "/four-interlocking-rings.png" },
    { name: "Nissan", icon: "/nissan-logo.png" },
]

const BODY_TYPES = [
    { name: "SUV", icon: "/suv-outline.jpg" },
    { name: "Sedan", icon: "/sedan-outline.jpg" },
    { name: "Wagon", icon: "/wagon-outline.jpg" },
    { name: "Family Van", icon: "/van-outline.jpg" },
    { name: "Pick-Up", icon: "/pickup-outline.jpg" },
    { name: "Coup", icon: "/coupe-outline.jpg" },
]

export function CategorySections() {
    return (
        <section className="py-20 px-4 md:px-12 max-w-7xl mx-auto space-y-16">
            {/* Brands */}
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">Rent by Brands</h2>
                    <button className="flex items-center gap-1 text-sm font-medium hover:underline">
                        View all
                    </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                    {BRANDS.map((brand) => (
                        <div
                            key={brand.name}
                            className="bg-gray-50 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 hover:bg-gray-100 transition-colors cursor-pointer group"
                        >
                            <div className="relative w-10 h-10 grayscale group-hover:grayscale-0 transition-all">
                                <img src={brand.icon || "/placeholder.svg"} alt={brand.name}  className="object-contain" />
                            </div>
                            <span className="text-sm font-medium text-gray-600">{brand.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Body Types */}
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">Rent by body type</h2>
                    <button className="flex items-center gap-1 text-sm font-medium hover:underline">
                        View all
                    </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                    {BODY_TYPES.map((type) => (
                        <div
                            key={type.name}
                            className="bg-gray-50 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                            <div className="relative w-16 h-8 opacity-70">
                                <img src={type.icon || "/placeholder.svg"} alt={type.name}  className="object-contain" />
                            </div>
                            <span className="text-sm font-medium text-gray-600">{type.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
