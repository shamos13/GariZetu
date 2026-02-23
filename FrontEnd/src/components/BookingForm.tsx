import { MapPin, ArrowRight } from "lucide-react"

export function BookingForm() {
    return (
        <div className="layout-container relative z-20 -mt-5 sm:-mt-8 md:-mt-10">
            <div
                className="grid grid-cols-1 gap-3 rounded-2xl border border-white/40 bg-white/95 p-3.5 shadow-[0_12px_24px_rgba(0,0,0,0.12)] backdrop-blur-sm sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_210px_minmax(0,1fr)_210px_auto]">
                <div className="w-full space-y-2">
                    <label className="text-[13px] font-semibold text-[#555] ml-1">Pick-up Location</label>
                    <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                        <input
                            type="text"
                            placeholder="Search a location"
                            className="w-full rounded-xl border-none bg-gray-50 py-3 pl-11 pr-4 outline-none transition-all focus:ring-2 focus:ring-black"
                        />
                    </div>
                </div>

                <div className="w-full space-y-2 xl:w-[210px]">
                    <label className="text-[13px] font-semibold text-[#555] ml-1">Pick-up date</label>
                    <div className="relative">
                        <input
                            type="date"
                            defaultValue="2023-12-12"
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none transition-all focus:ring-1 focus:ring-black"
                        />
                    </div>
                </div>

                <div className="w-full space-y-2">
                    <label className="text-[13px] font-semibold text-[#555] ml-1">Drop-off Location</label>
                    <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                        <input
                            type="text"
                            placeholder="Search a location"
                            className="w-full rounded-xl border-none bg-gray-50 py-3 pl-11 pr-4 outline-none transition-all focus:ring-2 focus:ring-black"
                        />
                    </div>
                </div>

                <div className="w-full space-y-2 xl:w-[210px]">
                    <label className="text-[13px] font-semibold text-[#555] ml-1">Drop-off date</label>
                    <div className="relative">
                        <input
                            type="date"
                            defaultValue="2023-12-12"
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none transition-all focus:ring-1 focus:ring-black"
                        />
                    </div>
                </div>

                <button
                    className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#111] px-7 py-3 font-semibold text-white transition-all hover:bg-black sm:col-span-2 xl:col-span-1 xl:h-full xl:w-auto">
                    Find a Vehicle
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/>
                </button>
            </div>
        </div>
    )
}
