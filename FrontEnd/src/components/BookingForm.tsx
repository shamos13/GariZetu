import { MapPin } from "lucide-react"

export function BookingForm() {
    return (
        <div className="relative z-20 -mt-16 md:-mt-20 px-4 md:px-12 max-w-7xl mx-auto">
            <div className="bg-white/95 backdrop-blur-sm rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] p-6 md:p-8 flex flex-col md:flex-row items-end gap-4 border border-white/40">
                <div className="flex-1 w-full space-y-3">
                    <label className="text-[13px] font-semibold text-[#555] ml-1">Pick-up Location</label>
                    <div className="relative">

                        <input
                            type="text"
                            placeholder="Search a location"
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-black outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="w-full md:w-52 space-y-3">
                    <label className="text-[13px] font-semibold text-[#555] ml-1">Pick-up date</label>
                    <div className="relative">
                        <input
                            type="date"
                            defaultValue="2023-12-12"
                            className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-1 focus:ring-black outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="flex-1 w-full space-y-3">
                    <label className="text-[13px] font-semibold text-[#555] ml-1">Drop-off Location</label>
                    <div className="relative">

                        <input
                            type="text"
                            placeholder="Search a location"
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-black outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="w-full md:w-52 space-y-3">
                    <label className="text-[13px] font-semibold text-[#555] ml-1">Drop-off date</label>
                    <div className="relative">
                        <input
                            type="date"
                            defaultValue="2023-12-12"
                            className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-1 focus:ring-black outline-none transition-all"
                        />
                    </div>
                </div>

                <button className="w-full md:w-auto bg-[#111] text-white px-10 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all group">
                    Find a Vehicle
                </button>
            </div>
        </div>
    )
}
