import { useEffect, useState } from "react";
import { ArrowDown } from "lucide-react";

export function HeroSection() {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const animationFrame = window.requestAnimationFrame(() => {
            setIsLoaded(true);
        });

        return () => window.cancelAnimationFrame(animationFrame);
    }, []);

    const scrollToContent = () => {
        window.scrollTo({
            top: window.innerHeight * 0.7,
            behavior: "smooth"
        });
    };

    return (
        <section className="relative flex min-h-[48vh] flex-col items-center justify-start overflow-hidden bg-black pb-0 pt-16 sm:min-h-[52vh] md:min-h-[56vh] md:pt-24">
            {/* Animated Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/50 via-transparent to-black/50" />
            
            {/* Subtle Grid Pattern */}
            <div 
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
            />

            {/* Main Content */}
            <div
                className={`z-10 max-w-4xl px-2 text-center space-y-2 transition-all duration-1000 sm:px-4 ${
                    isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
            >
                <h1 className="text-[1.75rem] sm:text-3xl md:text-4xl lg:text-[2.9rem] font-serif font-bold text-white leading-[1.1] tracking-tight text-balance">
                    You don't need to own a car to own the road
                </h1>
                <p
                    className={`text-base sm:text-xl md:text-2xl lg:text-[1.75rem] font-script text-white italic opacity-90 transition-all duration-1000 delay-200 ${
                        isLoaded ? "opacity-90 translate-y-0" : "opacity-0 translate-y-4"
                    }`}
                >
                    We've got our ride - gari zetu
                </p>

                {/* Stats Bar */}
                <div
                    className={`grid grid-cols-3 gap-3 pt-3 transition-all duration-1000 delay-500 sm:flex sm:items-center sm:justify-center sm:gap-6 ${
                        isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                    }`}
                >
                    {[
                        { value: "50+", label: "Premium Cars" },
                        { value: "5K+", label: "Happy Clients" },
                        { value: "24/7", label: "Support" },
                        ].map((stat, i) => (
                        <div key={i} className="text-center">
                            <p className="text-base sm:text-lg md:text-xl font-bold text-white">{stat.value}</p>
                            <p className="text-[11px] sm:text-xs md:text-sm text-gray-400">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Car Image with Animation */}
            <div 
                className={`relative mt-[-6px] flex w-full max-w-3xl flex-grow justify-center px-1 md:mt-[-14px] transition-all duration-1000 delay-300 ${
                    isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
                }`}
            >
                <img
                    src="/src/assets/car_traced.png"
                    alt="GariZetu Car"
                    className="relative z-0 w-[120%] max-w-none object-contain pointer-events-none select-none drop-shadow-2xl sm:w-[112%] md:w-[118%]"
                />
                
                {/* Glow Effect */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-20 bg-emerald-500/20 blur-3xl rounded-full" />
            </div>

            {/* Scroll Indicator */}
            <button
                onClick={scrollToContent}
                className={`absolute bottom-2 left-1/2 z-20 hidden -translate-x-1/2 flex-col items-center gap-1 text-white/60 transition-all cursor-pointer group hover:text-white sm:flex ${
                    isLoaded ? "opacity-100" : "opacity-0"
                }`}
                aria-label="Scroll down"
            >
                <span className="text-xs uppercase tracking-widest">Scroll</span>
                <ArrowDown className="w-4 h-4 animate-bounce" />
            </button>
        </section>
    )
}
