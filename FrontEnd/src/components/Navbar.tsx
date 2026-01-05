import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Menu, X } from "lucide-react";

export function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isVehiclesOpen, setIsVehiclesOpen] = useState(false);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
        setIsVehiclesOpen(false);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
        setIsVehiclesOpen(false);
    };

    return (
        <nav className="absolute top-0 left-0 right-0 z-50">
            {/* Main Navbar */}
            <div className="flex items-center justify-between px-5 py-4 md:px-8 lg:px-12">
                {/* Logo */}
                <Link to="/" className="relative z-50 flex items-center">
                    <img 
                        src="/src/assets/logo.png" 
                        alt="GariZetu" 
                        className="h-8 md:h-10 w-auto object-contain"
                    />
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-6 lg:gap-8">
                    {/* Vehicles Dropdown */}
                    <div className="relative group">
                        <button className="flex items-center gap-1 text-white/90 hover:text-white transition-colors text-sm lg:text-base font-medium">
                            Vehicles
                            <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-200" />
                        </button>
                        {/* Dropdown Menu */}
                        <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                            <div className="bg-white rounded-xl shadow-xl py-2 min-w-[180px] border border-gray-100">
                                <Link 
                                    to="/vehicles/sedan" 
                                    className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                                >
                                    Sedans
                                </Link>
                                <Link 
                                    to="/vehicles/suv" 
                                    className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                                >
                                    SUVs
                                </Link>
                                <Link 
                                    to="/vehicles/luxury" 
                                    className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                                >
                                    Luxury
                                </Link>
                                <Link 
                                    to="/vehicles/all" 
                                    className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors border-t border-gray-100 mt-1"
                                >
                                    View All
                                </Link>
                            </div>
                        </div>
                    </div>

                    <Link 
                        to="/rent" 
                        className="text-white/90 hover:text-white transition-colors text-sm lg:text-base font-medium"
                    >
                        Rent
                    </Link>

                    <Link 
                        to="/contact" 
                        className="text-white/90 hover:text-white transition-colors text-sm lg:text-base font-medium"
                    >
                        Contact
                    </Link>

                    <Link
                        to="/login"
                        className="ml-2 px-5 py-2 border border-white/80 text-white rounded-full text-sm lg:text-base font-medium hover:bg-white hover:text-gray-900 transition-all duration-200"
                    >
                        Login / Register
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <button
                    onClick={toggleMobileMenu}
                    className="md:hidden relative z-50 p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                    aria-label="Toggle menu"
                >
                    {isMobileMenuOpen ? (
                        <X size={24} />
                    ) : (
                        <Menu size={24} />
                    )}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            <div
                className={`md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${
                    isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
                }`}
                onClick={closeMobileMenu}
            />

            {/* Mobile Menu Panel */}
            <div
                className={`md:hidden fixed top-0 right-0 h-full w-[280px] bg-gray-900 z-40 transform transition-transform duration-300 ease-out ${
                    isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
                }`}
            >
                <div className="flex flex-col h-full pt-20 pb-6 px-6">
                    {/* Mobile Nav Links */}
                    <div className="flex flex-col space-y-1">
                        {/* Vehicles Accordion */}
                        <div>
                            <button
                                onClick={() => setIsVehiclesOpen(!isVehiclesOpen)}
                                className="flex items-center justify-between w-full py-3 text-white/90 hover:text-white transition-colors font-medium"
                            >
                                Vehicles
                                <ChevronDown 
                                    size={18} 
                                    className={`transition-transform duration-200 ${isVehiclesOpen ? "rotate-180" : ""}`} 
                                />
                            </button>
                            <div 
                                className={`overflow-hidden transition-all duration-200 ${
                                    isVehiclesOpen ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
                                }`}
                            >
                                <div className="pl-4 pb-2 space-y-1">
                                    <Link
                                        to="/vehicles/sedan"
                                        onClick={closeMobileMenu}
                                        className="block py-2 text-sm text-white/70 hover:text-white transition-colors"
                                    >
                                        Sedans
                                    </Link>
                                    <Link
                                        to="/vehicles/suv"
                                        onClick={closeMobileMenu}
                                        className="block py-2 text-sm text-white/70 hover:text-white transition-colors"
                                    >
                                        SUVs
                                    </Link>
                                    <Link
                                        to="/vehicles/luxury"
                                        onClick={closeMobileMenu}
                                        className="block py-2 text-sm text-white/70 hover:text-white transition-colors"
                                    >
                                        Luxury
                                    </Link>
                                    <Link
                                        to="/vehicles/all"
                                        onClick={closeMobileMenu}
                                        className="block py-2 text-sm text-white/70 hover:text-white transition-colors"
                                    >
                                        View All
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <Link
                            to="/rent"
                            onClick={closeMobileMenu}
                            className="py-3 text-white/90 hover:text-white transition-colors font-medium"
                        >
                            Rent
                        </Link>

                        <Link
                            to="/contact"
                            onClick={closeMobileMenu}
                            className="py-3 text-white/90 hover:text-white transition-colors font-medium"
                        >
                            Contact
                        </Link>
                    </div>

                    {/* Mobile CTA Button */}
                    <div className="mt-auto pt-6 border-t border-white/10">
                        <Link
                            to="/login"
                            onClick={closeMobileMenu}
                            className="block w-full py-3 px-4 bg-white text-gray-900 text-center rounded-full font-semibold hover:bg-gray-100 transition-colors"
                        >
                            Login / Register
                        </Link>
                    </div>

                    {/* Brand Footer */}
                    <div className="mt-6 pt-4 border-t border-white/10">
                        <p className="text-xs text-white/40 text-center">
                            © 2024 GariZetu. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </nav>
    );
}
