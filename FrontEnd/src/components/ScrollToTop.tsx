import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop component - scrolls to top on route change
 * Also provides a floating "back to top" button
 */
export function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [pathname]);

    return null;
}

/**
 * FloatingScrollButton - appears when user scrolls down
 */
import { useState } from "react";
import { ArrowUp } from "lucide-react";

export function FloatingScrollButton() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 500) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener("scroll", toggleVisibility);
        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <button
            onClick={scrollToTop}
            className={`fixed bottom-4 right-4 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-black text-white shadow-lg transition-all duration-300 hover:scale-110 hover:bg-zinc-800 sm:bottom-6 sm:right-6 sm:h-12 sm:w-12 ${
                isVisible 
                    ? "opacity-100 translate-y-0" 
                    : "opacity-0 translate-y-4 pointer-events-none"
            }`}
            aria-label="Scroll to top"
        >
            <ArrowUp className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
    );
}
