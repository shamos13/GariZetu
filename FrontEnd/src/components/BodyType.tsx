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
                <div className="mb-5 flex items-center justify-between gap-3">
                    <h2 className="text-lg font-semibold tracking-tight sm:text-xl">Rent by Body Type</h2>
                    <button className="hidden md:flex items-center gap-2 text-sm font-semibold hover:gap-3 transition-all">
                        View all <ArrowRight className="w-4 h-4" />
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                    {bodyTypes.map((type) => (
                        <div key={type.name} className="group flex cursor-pointer flex-col items-center justify-center rounded-xl bg-gray-50/50 p-4 transition-all hover:bg-gray-100/80 md:p-5">
                            <type.icon className="w-8 h-8 text-gray-600 mb-2.5 group-hover:text-black group-hover:scale-110 transition-all" strokeWidth={1.5} />
                            <span className="text-sm font-medium text-gray-700 text-center">{type.name}</span>
                        </div>
                    ))}
                </div>

                <div className="mt-4 md:hidden">
                    <button className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700">
                        View all body types <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </section>
    );
}
