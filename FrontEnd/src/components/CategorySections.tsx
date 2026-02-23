import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Car } from "../data/cars.ts";

interface CategorySectionsProps {
    cars: Car[];
    isLoading?: boolean;
}

const brandLogos: Record<string, string> = {
    toyota: "/logos/toyota-7.svg",
    "mercedes-benz": "/logos/mercedes-benz-8.svg",
    bmw: "/logos/bmw-7.svg",
    volkswagen: "/logos/volkswagen-10.svg",
    audi: "/logos/audi.svg",
    nissan: "/logos/nissan.svg",
};

export function CategorySections({ cars, isLoading = false }: CategorySectionsProps) {
    const navigate = useNavigate();

    const brandEntries = Array.from(
        cars.reduce((accumulator, car) => {
            const key = car.make.trim();
            if (!key) {
                return accumulator;
            }
            accumulator.set(key, (accumulator.get(key) ?? 0) + 1);
            return accumulator;
        }, new Map<string, number>())
    )
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

    const topBrands = brandEntries.slice(0, 6);

    return (
        <section className="section-space bg-white">
            <div className="layout-container">
                <div className="mb-5 flex items-center justify-between gap-3">
                    <h2 className="text-lg font-bold tracking-tight sm:text-xl">Rent by Brands</h2>
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
                                key={`brand-skeleton-${index}`}
                                className="h-[92px] min-w-[8.75rem] animate-pulse rounded-xl bg-gray-100 sm:min-w-0"
                            />
                        ))}
                    </div>
                ) : topBrands.length > 0 ? (
                    <div className="-mx-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-3 pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-6">
                        {topBrands.map((brand) => {
                            const logo = brandLogos[brand.name.toLowerCase()];
                            return (
                                <button
                                    type="button"
                                    key={brand.name}
                                    onClick={() => navigate(`/vehicles?make=${encodeURIComponent(brand.name)}`)}
                                    className="group flex min-w-[8.75rem] shrink-0 snap-start cursor-pointer flex-col items-center justify-center rounded-xl bg-gray-50 p-3.5 transition-colors hover:bg-gray-100 sm:min-w-0 md:p-4"
                                >
                                    <div className="mb-2 flex h-10 w-10 items-center justify-center">
                                        {logo ? (
                                            <img
                                                src={logo}
                                                alt={`${brand.name} logo`}
                                                className="h-full w-full object-contain"
                                            />
                                        ) : (
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-sm font-semibold text-white">
                                                {brand.name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-center text-xs font-medium text-gray-600">{brand.name}</p>
                                    <p className="mt-0.5 text-[11px] text-gray-400">{brand.count} vehicles</p>
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
                        No brand categories available right now.
                    </div>
                )}

                <div className="mt-4 md:hidden">
                    <button
                        type="button"
                        onClick={() => navigate("/vehicles")}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700"
                    >
                        View all brands <ArrowRight className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </section>
    );
}
