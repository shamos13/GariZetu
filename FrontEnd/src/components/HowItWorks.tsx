import { Search, CalendarCheck, Smile } from "lucide-react"

const STEPS = [
    {
        title: "Browse and select",
        description:
            "Choose from our wide range of premium cars, select the pickup and return dates and locations that suit you best.",
        icon: Search,
    },
    {
        title: "Book and confirm",
        description: "Book your desired car with just a few clicks and receive an instant confirmation via email or SMS.",
        icon: CalendarCheck,
    },
    {
        title: "Enjoy your ride",
        description:
            "Pick up your car at the designated location and enjoy your premium driving experience with our top-quality service.",
        icon: Smile,
    },
]

export function HowItWorks() {
    return (
        <section className="section-space">
            <div className="layout-container">
            <div className="mb-6 space-y-2.5 text-center">
                <h2 className="text-[1.65rem] font-bold sm:text-2xl md:text-[1.75rem]">How it works</h2>
                <p className="text-gray-500 max-w-2xl mx-auto">
                    Renting a luxury car has never been easier. Our streamlined process makes it simple for you to book and
                    confirm your vehicle of choice online
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
                <div className="space-y-3">
                    {STEPS.map((step) => (
                        <div
                            key={step.title}
                            className="flex gap-3 rounded-xl border border-gray-100 bg-white p-3.5 shadow-sm transition-all hover:shadow-md"
                        >
                            <div className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center shrink-0">
                                <step.icon className="text-gray-900" size={18} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-bold text-base">{step.title}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">{step.description}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="relative flex aspect-[4/3] items-center justify-center rounded-[2rem] bg-gray-50 p-4 sm:aspect-square md:p-6">
                    <div className="relative h-full w-full">
                        <img src="/src/assets/car-jeep.png" alt="Jeep Wrangler" className="h-full w-full object-contain" />
                    </div>
                </div>
            </div>
            </div>
        </section>
    )
}
