import { Sparkles, Tag, CheckCircle } from "lucide-react"

const SERVICES = [
    {
        title: "Quality Choice",
        description:
            "We offer a wide range of high-quality vehicles to choose from, including luxury cars, SUVs, vans, and more.",
        icon: Sparkles,
    },
    {
        title: "Affordable Prices",
        description:
            "Our rental rates are highly competitive and affordable, allowing our customers to enjoy their trips without breaking the bank.",
        icon: Tag,
    },
    {
        title: "Convenient Online Booking",
        description:
            "With our easy-to-use online booking system, customers can quickly and conveniently reserve their rental car from anywhere, anytime.",
        icon: CheckCircle,
    },
]

export function Services() {
    return (
        <section className="section-space bg-black text-white text-center">
            <div className="layout-container">
            <div className="mb-6 mx-auto max-w-4xl space-y-2.5">
                <h2 className="text-[1.65rem] font-bold sm:text-2xl md:text-[1.75rem]">Our Services & Benefits</h2>
                <p className="text-gray-400 text-sm">
                    To make renting easy and hassle-free, we provide a variety of services and advantages. We have you covered
                    with a variety of vehicles and flexible rental terms.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
                {SERVICES.map((service) => (
                    <div key={service.title} className="space-y-3 group">
                        <div className="mx-auto w-9 h-9 bg-white rounded-full flex items-center justify-center transition-transform group-hover:scale-110">
                            <service.icon className="text-black" size={20} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-base font-bold">{service.title}</h3>
                            <p className="text-sm text-gray-400 leading-relaxed">{service.description}</p>
                        </div>
                    </div>
                ))}
            </div>
            </div>
        </section>
    )
}
