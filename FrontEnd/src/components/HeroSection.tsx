export function HeroSection() {
    return (
        <section className="relative min-h-[70vh] md:min-h-[85vh] bg-black flex flex-col items-center justify-start pt-20 md:pt-32 pb-0 overflow-hidden">
            <div className="z-10 text-center space-y-4 px-4 max-w-5xl">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-white leading-[1.1] tracking-tight text-balance">
                    You don't need to own a car to own the road
                </h1>
                <p className="text-3xl md:text-4xl lg:text-5xl font-script text-white italic opacity-90">We've got your ride</p>
            </div>

            <div className="relative w-full max-w-4xl px-2  flex flex-grow justify-center mt-[-20px] md:mt-[-40px]">
                <img
                    src="/src/assets/car_traced.png"
                    alt="GariZetu Car"
                    className="
            w-[110%] md:w-[120%]
            max-w-none
            object-contain
            pointer-events-none
            select-none
            relative
            z-0
          "
                />
            </div>
        </section>
    )
}
