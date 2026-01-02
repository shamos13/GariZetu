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
        <section className="py-24 px-4 md:px-12 max-w-7xl mx-auto">
            <div className="text-center space-y-4 mb-16">
                <h2 className="text-4xl font-bold">How it woks</h2>
                <p className="text-gray-500 max-w-2xl mx-auto">
                    Renting a luxury car has never been easier. Our streamlined process makes it simple for you to book and
                    confirm your vehicle of choice online
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                    {STEPS.map((step) => (
                        <div
                            key={step.title}
                            className="bg-white rounded-3xl p-6 flex gap-6 border border-gray-100 shadow-sm hover:shadow-md transition-all"
                        >
                            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center shrink-0">
                                <step.icon className="text-gray-900" size={24} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-bold text-lg">{step.title}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">{step.description}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="relative bg-gray-50 rounded-[4rem] p-12 aspect-square flex items-center justify-center">
                    <div className="relative w-full h-full transform translate-x-4">
                        <img src="/src/assets/car-jeep.png" alt="Jeep Wrangler"  className="object-contain" />
                    </div>
                </div>
            </div>
        </section>
    )
}
