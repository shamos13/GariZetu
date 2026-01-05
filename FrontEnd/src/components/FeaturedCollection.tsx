import { useState } from "react";
import { Gauge, Milestone, Users, Fuel, ArrowRight } from "lucide-react";
import { CarDetailsModal } from "./CarDetailsModal";

const CARS = [
    {
        id: 1,
        name: "Audi A8 L 2022",
        price: 4000,
        image: "/audi-a8-gray.jpg",
        specs: { mileage: "4,000", transmission: "Auto", capacity: "4 Person", fuel: "Electric" },
    },
    {
        id: 2,
        name: "Nissan Maxima Platinum 2022",
        price: 3500,
        image: "/nissan-maxima-white.jpg",
        specs: { mileage: "4,000", transmission: "Auto", capacity: "4 Person", fuel: "Electric" },
    },
    {
        id: 3,
        name: "Porsche Cayenne GTS 2022",
        price: 5500,
        image: "/porsche-cayenne-black.jpg",
        specs: { mileage: "4,000", transmission: "Auto", capacity: "4 Person", fuel: "Electric" },
    },
]

const CATEGORIES = ["Popular Car", "Luxury Car", "Vintage Car", "Family Car", "Off-Road Car"]

export function FeaturedCollection() {
    const [selectedCar, setSelectedCar] = useState<typeof CARS[0] | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleRentNow = (car: typeof CARS[0]) => {
        setSelectedCar(car);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedCar(null);
    };

    const handleBookNow = (car: typeof CARS[0]) => {
        // Handle booking logic here
        console.log("Booking:", car);
        // You can navigate to booking page or show booking form
        handleCloseModal();
    };

    return (
        <section className="py-20 px-4 md:px-12 bg-white max-w-7xl mx-auto">
            <div className="text-center space-y-4 mb-12">
                <h2 className="text-3xl md:text-4xl font-bold">Our Impressive Collection of Cars</h2>
                <p className="text-gray-500 max-w-2xl mx-auto">
                    From everyday elegance to raw performance — our cars are carefully selected so you can drive like you own the
                    road
                </p>
            </div>

            <div className="flex flex-wrap justify-center gap-4 mb-12">
                {CATEGORIES.map((cat, i) => (
                    <button
                        key={cat}
                        className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                            i === 0 ? "bg-black text-white" : "bg-white border border-gray-200 hover:border-black"
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {CARS.map((car) => (
                    <div
                        key={car.id}
                        className="group bg-white rounded-3xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all"
                    >
                        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-6">
                            <img
                                src={car.image || "/placeholder.svg"}
                                alt={car.name}
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                        </div>

                        <div className="space-y-4 px-2">
                            <h3 className="text-lg font-bold">{car.name}</h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-xl font-bold font-sans">Ksh {car.price}</span>
                                <span className="text-gray-400 text-sm">/day</span>
                            </div>

                            <div className="grid grid-cols-2 gap-y-4 gap-x-2 pt-4 border-t border-gray-50">
                                <div className="flex items-center gap-2 text-[11px] text-gray-500 uppercase tracking-wider">
                                    <Gauge size={14} className="text-gray-400" /> {car.specs.mileage}
                                </div>
                                <div className="flex items-center gap-2 text-[11px] text-gray-500 uppercase tracking-wider">
                                    <Milestone size={14} className="text-gray-400" /> {car.specs.transmission}
                                </div>
                                <div className="flex items-center gap-2 text-[11px] text-gray-500 uppercase tracking-wider">
                                    <Users size={14} className="text-gray-400" /> {car.specs.capacity}
                                </div>
                                <div className="flex items-center gap-2 text-[11px] text-gray-500 uppercase tracking-wider">
                                    <Fuel size={14} className="text-gray-400" /> {car.specs.fuel}
                                </div>
                            </div>

                            <button
                                onClick={() => handleRentNow(car)}
                                className={`w-full py-3 rounded-full text-sm font-bold transition-all border mt-4 ${
                                    car.id === 2 ? "bg-black text-white" : "bg-white border-gray-200 hover:border-black"
                                }`}
                            >
                                Rent Now
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-16 flex justify-center">
                <button className="bg-black text-white px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 hover:bg-zinc-800 transition-colors">
                    See all Cars <ArrowRight size={18} />
                </button>
            </div>

            {/* Car Details Modal */}
            {selectedCar && (
                <CarDetailsModal
                    car={selectedCar}
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onBookNow={handleBookNow}
                />
            )}
        </section>
    )
}
