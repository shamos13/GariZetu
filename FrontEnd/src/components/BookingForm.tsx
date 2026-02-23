import { useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, MapPin } from "lucide-react";
import type { BodyType, Car } from "../data/cars.ts";

interface BookingFormProps {
    cars: Car[];
    isLoading?: boolean;
}

const formatDateInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

export function BookingForm({ cars, isLoading = false }: BookingFormProps) {
    const navigate = useNavigate();
    const tomorrow = useMemo(() => {
        const value = new Date();
        value.setDate(value.getDate() + 1);
        return value;
    }, []);

    const [pickupLocation, setPickupLocation] = useState("");
    const [dropoffLocation, setDropoffLocation] = useState("");
    const [pickupDate, setPickupDate] = useState(formatDateInput(new Date()));
    const [dropoffDate, setDropoffDate] = useState(formatDateInput(tomorrow));
    const [selectedMake, setSelectedMake] = useState("all");
    const [selectedBodyType, setSelectedBodyType] = useState<BodyType | "all">("all");

    const makeOptions = useMemo(
        () =>
            Array.from(new Set(cars.map((car) => car.make)))
                .filter((value) => value.trim().length > 0)
                .sort((a, b) => a.localeCompare(b)),
        [cars]
    );

    const bodyTypeOptions = useMemo(
        () =>
            Array.from(new Set(cars.map((car) => car.bodyType))).sort((a, b) =>
                a.localeCompare(b)
            ),
        [cars]
    );

    const locationSuggestions = useMemo(
        () =>
            Array.from(new Set(cars.map((car) => car.location)))
                .filter((value) => value.trim().length > 0)
                .sort((a, b) => a.localeCompare(b)),
        [cars]
    );

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();

        const params = new URLSearchParams();
        if (selectedMake !== "all") {
            params.set("make", selectedMake);
        }
        if (selectedBodyType !== "all") {
            params.set("bodyType", selectedBodyType);
        }
        if (pickupDate) {
            params.set("pickupDate", pickupDate);
        }
        if (dropoffDate) {
            params.set("dropoffDate", dropoffDate);
        }
        if (pickupLocation.trim().length > 0) {
            params.set("pickup", pickupLocation.trim());
        }
        if (dropoffLocation.trim().length > 0) {
            params.set("dropoff", dropoffLocation.trim());
        }

        navigate(`/vehicles${params.toString() ? `?${params.toString()}` : ""}`);
    };

    return (
        <div className="layout-container relative z-20 -mt-5 sm:-mt-8 md:-mt-10">
            <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 gap-3 rounded-2xl border border-white/40 bg-white/95 p-3.5 shadow-[0_12px_24px_rgba(0,0,0,0.12)] backdrop-blur-sm sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_210px_minmax(0,1fr)_210px_auto]"
            >
                <div className="w-full space-y-2">
                    <label className="ml-1 text-[13px] font-semibold text-[#555]">Pick-up Location</label>
                    <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            value={pickupLocation}
                            onChange={(event) => setPickupLocation(event.target.value)}
                            list="pickup-location-options"
                            placeholder="Search a location"
                            className="w-full rounded-xl border-none bg-gray-50 py-3 pl-11 pr-4 outline-none transition-all focus:ring-2 focus:ring-black"
                        />
                    </div>
                </div>

                <div className="w-full space-y-2 xl:w-[210px]">
                    <label className="ml-1 text-[13px] font-semibold text-[#555]">Pick-up date</label>
                    <input
                        type="date"
                        value={pickupDate}
                        onChange={(event) => setPickupDate(event.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none transition-all focus:ring-1 focus:ring-black"
                    />
                </div>

                <div className="w-full space-y-2">
                    <label className="ml-1 text-[13px] font-semibold text-[#555]">Drop-off Location</label>
                    <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            value={dropoffLocation}
                            onChange={(event) => setDropoffLocation(event.target.value)}
                            list="dropoff-location-options"
                            placeholder="Search a location"
                            className="w-full rounded-xl border-none bg-gray-50 py-3 pl-11 pr-4 outline-none transition-all focus:ring-2 focus:ring-black"
                        />
                    </div>
                </div>

                <div className="w-full space-y-2 xl:w-[210px]">
                    <label className="ml-1 text-[13px] font-semibold text-[#555]">Drop-off date</label>
                    <input
                        type="date"
                        value={dropoffDate}
                        onChange={(event) => setDropoffDate(event.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none transition-all focus:ring-1 focus:ring-black"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#111] px-7 py-3 font-semibold text-white transition-all hover:bg-black disabled:cursor-not-allowed disabled:bg-zinc-500 sm:col-span-2 xl:col-span-1 xl:h-full xl:w-auto"
                >
                    {isLoading ? "Loading..." : "Find a Vehicle"}
                    {!isLoading && <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />}
                </button>

                <div className="grid grid-cols-1 gap-3 pt-1 sm:col-span-2 lg:grid-cols-2">
                    <div className="space-y-2">
                        <label className="ml-1 text-[13px] font-semibold text-[#555]">Rent by Brand</label>
                        <select
                            value={selectedMake}
                            onChange={(event) => setSelectedMake(event.target.value)}
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-zinc-800 outline-none transition-all focus:ring-1 focus:ring-black"
                        >
                            <option value="all">All brands</option>
                            {makeOptions.map((make) => (
                                <option key={make} value={make}>
                                    {make}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="ml-1 text-[13px] font-semibold text-[#555]">Vehicle Category</label>
                        <select
                            value={selectedBodyType}
                            onChange={(event) => setSelectedBodyType(event.target.value as BodyType | "all")}
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-zinc-800 outline-none transition-all focus:ring-1 focus:ring-black"
                        >
                            <option value="all">All categories</option>
                            {bodyTypeOptions.map((bodyType) => (
                                <option key={bodyType} value={bodyType}>
                                    {bodyType}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </form>

            <datalist id="pickup-location-options">
                {locationSuggestions.map((location) => (
                    <option key={`pickup-${location}`} value={location} />
                ))}
            </datalist>
            <datalist id="dropoff-location-options">
                {locationSuggestions.map((location) => (
                    <option key={`dropoff-${location}`} value={location} />
                ))}
            </datalist>
        </div>
    );
}
