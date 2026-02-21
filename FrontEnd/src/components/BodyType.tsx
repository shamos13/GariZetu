import { ArrowRight, Car } from "lucide-react";

const bodyTypes = [
    { name: "SUV", icon: Car },
    { name: "Sedan", icon: Car },
    { name: "Wagon", icon: Car },
    { name: "Family Van", icon: Car },
    { name: "Pick-Up", icon: Car },
    { name: "Coup", icon: Car },
];

export function BodyType() {
    return (
        <section className="section-space-sm bg-white">
            <div className="layout-container">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xl md:text-xl font-semibold tracking-tight">Rent by Body Type</h2>
                    <button className="hidden md:flex items-center gap-2 text-sm font-semibold hover:gap-3 transition-all">
                        View all <ArrowRight className="w-4 h-4" />
                    </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {bodyTypes.map((type) => (
                        <div key={type.name} className="flex flex-col items-center justify-center p-4 md:p-5 bg-gray-50/50 rounded-xl hover:bg-gray-100/80 transition-all cursor-pointer group">
                            <type.icon className="w-8 h-8 text-gray-600 mb-2.5 group-hover:text-black group-hover:scale-110 transition-all" strokeWidth={1.5} />
                            <span className="text-sm font-medium text-gray-700 text-center">{type.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
