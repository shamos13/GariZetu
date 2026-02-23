import { ArrowRight, Car } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { BodyType as BodyTypeValue, Car as CarType } from "../data/cars.ts";

interface BodyTypeProps {
    cars: CarType[];
    isLoading?: boolean;
}

const bodyTypeIcons: Record<string, string> = {
    suv: "/bodyType/suv.svg",
    sedan: "/bodyType/sedan.svg",
    wagon: "/bodyType/wagon.svg",
    minivan: "/bodyType/minivan.svg",
    van: "/bodyType/minivan.svg",
    truck: "/bodyType/pickup.svg",
    "pick-up": "/bodyType/pickup.svg",
    coupe: "/bodyType/coup.svg",
};

const formatBodyTypeLabel = (value: BodyTypeValue): string => {
    if (value === "SUV") {
        return "SUV";
    }
    return value;
};

export function BodyType({ cars, isLoading = false }: BodyTypeProps) {
    const navigate = useNavigate();

    const bodyTypeEntries = Array.from(
        cars.reduce((accumulator, car) => {
            accumulator.set(car.bodyType, (accumulator.get(car.bodyType) ?? 0) + 1);
            return accumulator;
        }, new Map<BodyTypeValue, number>())
    )
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

    const topBodyTypes = bodyTypeEntries.slice(0, 6);

    return (
        <section className="section-space-sm bg-white">
            <div className="layout-container">
                <div className="mb-5 flex items-center justify-between gap-3">
                    <h2 className="text-lg font-semibold tracking-tight sm:text-xl">Rent by Body Type</h2>
                    <button
                        type="button"
                        onClick={() => navigate("/vehicles")}
                        className="hidden items-center gap-2 text-sm font-semibold transition-all hover:gap-3 md:flex"
                    >
                        View all <ArrowRight className="h-4 w-4" />
                    </button>
                </div>

                {isLoading ? (
                    <div className="-mx-3 flex gap-3 overflow-x-auto px-3 pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-6">
                        {Array.from({ length: 6 }, (_, index) => (
                            <div
                                key={`body-skeleton-${index}`}
                                className="h-[108px] min-w-[8.75rem] animate-pulse rounded-xl bg-gray-100 sm:min-w-0"
                            />
                        ))}
                    </div>
                ) : topBodyTypes.length > 0 ? (
                    <div className="-mx-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-3 pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-6">
                        {topBodyTypes.map((type) => {
                            const iconPath = bodyTypeIcons[type.name.toLowerCase()];
                            return (
                                <button
                                    type="button"
                                    key={type.name}
                                    onClick={() => navigate(`/vehicles?bodyType=${encodeURIComponent(type.name)}`)}
                                    className="group flex min-w-[8.75rem] shrink-0 snap-start cursor-pointer flex-col items-center justify-center rounded-xl bg-gray-50/50 p-4 transition-all hover:bg-gray-100/80 sm:min-w-0 md:p-5"
                                >
                                    {iconPath ? (
                                        <img
                                            src={iconPath}
                                            alt={type.name}
                                            className="mb-2.5 h-8 w-8 object-contain transition-all group-hover:scale-110"
                                        />
                                    ) : (
                                        <Car className="mb-2.5 h-8 w-8 text-gray-600 transition-all group-hover:scale-110 group-hover:text-black" strokeWidth={1.5} />
                                    )}
                                    <span className="text-center text-sm font-medium text-gray-700">
                                        {formatBodyTypeLabel(type.name)}
                                    </span>
                                    <span className="mt-0.5 text-xs text-gray-400">{type.count} vehicles</span>
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
                        No vehicle categories available right now.
                    </div>
                )}

                <div className="mt-4 md:hidden">
                    <button
                        type="button"
                        onClick={() => navigate("/vehicles")}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700"
                    >
                        View all body types <ArrowRight className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </section>
    );
}
