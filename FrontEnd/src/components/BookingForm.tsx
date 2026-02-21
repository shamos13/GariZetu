import { MapPin, ArrowRight } from "lucide-react"

export function BookingForm() {
    return (
        <div className="layout-container relative z-20 -mt-8 md:-mt-10">
            <div
                className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-[0_12px_24px_rgba(0,0,0,0.12)] p-3.5 md:p-4 flex flex-col md:flex-row items-end gap-2.5 border border-white/40">
                <div className="flex-1 w-full space-y-2">
                    <label className="text-[13px] font-semibold text-[#555] ml-1">Pick-up Location</label>
                    <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                        <input
                            type="text"
                            placeholder="Search a location"
                            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-black outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="w-full md:w-52 space-y-2">
                    <label className="text-[13px] font-semibold text-[#555] ml-1">Pick-up date</label>
                    <div className="relative">
                        <input
                            type="date"
                            defaultValue="2023-12-12"
                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-1 focus:ring-black outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="flex-1 w-full space-y-2">
                    <label className="text-[13px] font-semibold text-[#555] ml-1">Drop-off Location</label>
                    <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                        <input
                            type="text"
                            placeholder="Search a location"
                            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-black outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="w-full md:w-52 space-y-2">
                    <label className="text-[13px] font-semibold text-[#555] ml-1">Drop-off date</label>
                    <div className="relative">
                        <input
                            type="date"
                            defaultValue="2023-12-12"
                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-1 focus:ring-black outline-none transition-all"
                        />
                    </div>
                </div>

                <button
                    className="w-full md:w-auto bg-[#111] text-white px-7 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-black transition-all group">
                    Find a Vehicle
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/>
                </button>
            </div>
        </div>
    )
}
