import {useEffect, useState} from "react";
import {Link, useLocation, useNavigate} from "react-router-dom";
import {ChevronDown, Phone, User, LogOut} from "lucide-react";
import {AuthModal} from "./AuthModal";
import {authService} from "../services/AuthService.ts";

export function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isVehiclesOpen, setIsVehiclesOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authMode, setAuthMode] = useState<"login" | "signup">("login");
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(authService.getUser());
    const location = useLocation();
    const navigate = useNavigate();

    // Check authentication status
    useEffect(() => {
        const checkAuth = () => {
            const authenticated = authService.isAuthenticated();
            setIsAuthenticated(authenticated);
            setUser(authService.getUser());
        };
        checkAuth();
        // Listen for storage changes (when login/logout happens in other tabs)
        window.addEventListener('storage', checkAuth);
        return () => window.removeEventListener('storage', checkAuth);
    }, [location]);

    const handleLogout = () => {
        authService.logout();
        setIsAuthenticated(false);
        setUser(null);
        navigate("/");
        window.location.reload();
    };

    const handleLoginSuccess = () => {
        setIsAuthenticated(true);
        const currentUser = authService.getUser();
        setUser(currentUser);
        
        // Redirect based on user role
        if (authService.isAdmin()) {
            navigate("/adashboard");
        } else {
            navigate("/dashboard");
        }
    };
    
    const openAuthModal = (mode: "login" | "signup") => {
        setAuthMode(mode);
        setIsAuthModalOpen(true);
        closeMobileMenu();
    };

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
        setIsVehiclesOpen(false);
    }, [location.pathname]);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
        setIsVehiclesOpen(false);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
        setIsVehiclesOpen(false);
    };

    // Check if link is active
    const isActive = (path: string) => {
        if (path === "/vehicles") {
            return location.pathname.startsWith("/vehicles");
        }
        return location.pathname === path;
    };

    return (
        <nav 
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                isScrolled 
                    ? "bg-black/95 backdrop-blur-md shadow-lg" 
                    : "bg-black"
            }`}
        >
            {/* Top Bar - Contact Info (hidden on scroll) */}
            <div 
                className={`hidden md:block border-b border-white/10 overflow-hidden transition-all duration-300 ${
                    isScrolled ? "h-0 opacity-0" : "h-10 opacity-100"
                }`}
            >
                <div className="max-w-[1920px] mx-auto px-5 md:px-8 lg:px-12 h-10 flex items-center justify-between">
                    <p className="text-xs text-gray-400">
                        🇰🇪 Kenya's Premier Car Rental Service
                    </p>
                    <div className="flex items-center gap-4">
                        <a 
                            href="tel:+254759064318"
                            className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors"
                        >
                            <Phone className="w-3 h-3" />
                            +254 727 805 351
                        </a>
                        <span className="text-xs text-emerald-400 font-medium animate-pulse">
                            • Open Now
                        </span>
                    </div>
                </div>
            </div>

            {/* Main Navbar */}
            <div 
                className={`flex items-center justify-between px-5 md:px-8 lg:px-12 max-w-[1920px] mx-auto transition-all duration-300 ${
                    isScrolled ? "py-3" : "py-4"
                }`}
            >
                {/* Logo */}
                <Link 
                    to="/" 
                    className="relative z-50 flex items-center group"
                >
                    <img 
                        src="/src/assets/logo.png" 
                        alt="GariZetu" 
                        className={`w-auto object-contain transition-all duration-300 group-hover:scale-105 ${
                            isScrolled ? "h-7 md:h-8" : "h-8 md:h-10"
                        }`}
                    />
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-6 lg:gap-8">

                    {/* Temporary Admin Dashboard Link (visible to all) */}
                    <Link
                        to="/adashboard"
                        className={`relative transition-colors text-sm lg:text-base font-medium ${
                            isActive("/adashboard")
                                ? "text-white"
                                : "text-white/70 hover:text-white"
                        }`}
                    >
                        Admin Dashboard
                        {isActive("/adashboard") && (
                            <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-white rounded-full"/>
                        )}
                    </Link>

                    {/* Home Link */}
                    <Link 
                        to="/" 
                        className={`relative transition-colors text-sm lg:text-base font-medium ${
                            isActive("/") && location.pathname === "/"
                                ? "text-white"
                                : "text-white/70 hover:text-white"
                        }`}
                    >
                        Home
                        {location.pathname === "/" && (
                            <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-white rounded-full" />
                        )}
                    </Link>

                    {/* Vehicles Dropdown */}
                    <div className="relative group">
                        <Link 
                            to="/vehicles"
                            className={`flex items-center gap-1 transition-colors text-sm lg:text-base font-medium ${
                                isActive("/vehicles")
                                    ? "text-white"
                                    : "text-white/70 hover:text-white"
                            }`}
                        >
                            Vehicles
                            <ChevronDown 
                                size={14} 
                                className="group-hover:rotate-180 transition-transform duration-200" 
                            />
                            {isActive("/vehicles") && (
                                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-white rounded-full" />
                            )}
                        </Link>
                        {/* Dropdown Menu */}
                        <div className="absolute top-full left-0 pt-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform group-hover:translate-y-0 translate-y-2">
                            <div className="bg-white rounded-xl shadow-2xl py-2 min-w-[200px] border border-gray-100 overflow-hidden">
                                <Link 
                                    to="/vehicles?bodyType=Sedan" 
                                    className="px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors block"
                                >
                                    Sedans
                                </Link>
                                <Link 
                                    to="/vehicles?bodyType=SUV" 
                                    className="px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors block"
                                >
                                    SUVs
                                </Link>
                                <Link 
                                    to="/vehicles?sort=price-desc" 
                                    className="px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors block"
                                >
                                    Luxury
                                </Link>
                                <div className="border-t border-gray-100 mt-2 pt-2">
                                    <Link 
                                        to="/vehicles" 
                                        className="flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors"
                                    >
                                        View All Vehicles
                                        <span className="text-xs bg-black text-white px-2 py-0.5 rounded-full">
                                            8+
                                        </span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Link 
                        to="/about" 
                        className={`relative transition-colors text-sm lg:text-base font-medium ${
                            isActive("/about")
                                ? "text-white"
                                : "text-white/70 hover:text-white"
                        }`}
                    >
                        About Us
                        {isActive("/about") && (
                            <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-white rounded-full" />
                        )}
                    </Link>

                    <Link 
                        to="/contact" 
                        className={`relative transition-colors text-sm lg:text-base font-medium ${
                            isActive("/contact")
                                ? "text-white"
                                : "text-white/70 hover:text-white"
                        }`}
                    >
                        Contact
                        {isActive("/contact") && (
                            <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-white rounded-full" />
                        )}
                    </Link>

                    {isAuthenticated ? (
                        <div className="ml-2 flex items-center gap-3">
                            {/* Profile Circle */}
                            <Link
                                to="/dashboard"
                                className="relative w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-semibold hover:scale-110 transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/50 cursor-pointer"
                                title="Dashboard"
                            >
                                <span className="text-sm">
                                    {user?.userName 
                                        ? user.userName.trim().split(/\s+/).length >= 2
                                            ? (user.userName.trim().split(/\s+/)[0].charAt(0) + user.userName.trim().split(/\s+/)[1].charAt(0)).toUpperCase()
                                            : user.userName.charAt(0).toUpperCase()
                                        : "U"}
                                </span>
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2.5 bg-white/10 text-white rounded-full text-sm lg:text-base font-semibold hover:bg-white/20 transition-all duration-200 flex items-center gap-2"
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
                            </button>
                        </div>
                    ) : (
                    <button
                        onClick={() => openAuthModal("login")}
                        className="ml-2 px-5 py-2.5 bg-white text-black rounded-full text-sm lg:text-base font-semibold hover:bg-gray-100 transition-all duration-200 hover:scale-105 hover:shadow-lg"
                    >
                        Login / Register
                    </button>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    onClick={toggleMobileMenu}
                    className="md:hidden relative z-50 p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                    aria-label="Toggle menu"
                >
                    <div className="relative w-6 h-6">
                        <span 
                            className={`absolute left-0 w-6 h-0.5 bg-white rounded-full transition-all duration-300 ${
                                isMobileMenuOpen 
                                    ? "top-1/2 -translate-y-1/2 rotate-45" 
                                    : "top-1"
                            }`}
                        />
                        <span 
                            className={`absolute left-0 top-1/2 -translate-y-1/2 w-6 h-0.5 bg-white rounded-full transition-all duration-300 ${
                                isMobileMenuOpen ? "opacity-0 scale-0" : "opacity-100 scale-100"
                            }`}
                        />
                        <span 
                            className={`absolute left-0 w-6 h-0.5 bg-white rounded-full transition-all duration-300 ${
                                isMobileMenuOpen 
                                    ? "top-1/2 -translate-y-1/2 -rotate-45" 
                                    : "bottom-1"
                            }`}
                        />
                    </div>
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
                className={`md:hidden fixed top-0 right-0 h-full w-[300px] bg-black z-40 transform transition-transform duration-300 ease-out shadow-2xl ${
                    isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
                }`}
            >
                <div className="flex flex-col h-full pt-20 pb-6 px-6">
                    {/* Mobile Nav Links */}
                    <div className="flex flex-col space-y-1">
                        {/* Admin Dashboard Link (Temporary - visible to all) */}
                        <Link
                            to="/adashboard"
                            onClick={closeMobileMenu}
                            className={`py-3 transition-colors font-medium flex items-center gap-2 ${
                                isActive("/adashboard") ? "text-white" : "text-white/70"
                            }`}
                        >
                            <User className="w-5 h-5" />
                            Admin Dashboard
                            {isActive("/adashboard") && (
                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                            )}
                        </Link>

                        {/* Home Link */}
                        <Link
                            to="/"
                            onClick={closeMobileMenu}
                            className={`py-3 transition-colors font-medium flex items-center gap-2 ${
                                location.pathname === "/" ? "text-white" : "text-white/70"
                            }`}
                        >
                            <User className="w-5 h-5" />
                            Home
                            {location.pathname === "/" && (
                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                            )}
                        </Link>

                        {/* Vehicles Accordion */}
                        <div>
                            <button
                                onClick={() => setIsVehiclesOpen(!isVehiclesOpen)}
                                className={`flex items-center justify-between w-full py-3 transition-colors font-medium ${
                                    isActive("/vehicles") ? "text-white" : "text-white/70"
                                }`}
                            >
                                <span>Vehicles</span>
                                <ChevronDown 
                                    size={18} 
                                    className={`transition-transform duration-300 ${isVehiclesOpen ? "rotate-180" : ""}`} 
                                />
                            </button>
                            <div 
                                className={`overflow-hidden transition-all duration-300 ${
                                    isVehiclesOpen ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
                                }`}
                            >
                                <div className="pl-4 pb-2 space-y-1 border-l-2 border-white/20 ml-2">
                                    <Link
                                        to="/vehicles?bodyType=Sedan"
                                        onClick={closeMobileMenu}
                                        className="block py-2.5 text-sm text-white/60 hover:text-white transition-colors"
                                    >
                                        Sedans
                                    </Link>
                                    <Link
                                        to="/vehicles?bodyType=SUV"
                                        onClick={closeMobileMenu}
                                        className="block py-2.5 text-sm text-white/60 hover:text-white transition-colors"
                                    >
                                        SUVs
                                    </Link>
                                    <Link
                                        to="/vehicles?sort=price-desc"
                                        onClick={closeMobileMenu}
                                        className="block py-2.5 text-sm text-white/60 hover:text-white transition-colors"
                                    >
                                        Luxury
                                    </Link>
                                    <Link
                                        to="/vehicles"
                                        onClick={closeMobileMenu}
                                        className="block py-2.5 text-sm text-white font-medium transition-colors"
                                    >
                                        View All →
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <Link
                            to="/about"
                            onClick={closeMobileMenu}
                            className={`py-3 transition-colors font-medium flex items-center gap-2 ${
                                isActive("/about") ? "text-white" : "text-white/70"
                            }`}
                        >
                            <User className="w-5 h-5" />
                            About Us
                            {isActive("/about") && (
                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                            )}
                        </Link>

                        <Link
                            to="/contact"
                            onClick={closeMobileMenu}
                            className={`py-3 transition-colors font-medium flex items-center gap-2 ${
                                isActive("/contact") ? "text-white" : "text-white/70"
                            }`}
                        >
                            <Phone className="w-5 h-5" />
                            Contact
                            {isActive("/contact") && (
                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                            )}
                        </Link>
                    </div>

                    {/* Quick Contact */}
                    <div className="mt-8 p-4 bg-white/5 rounded-xl">
                        <p className="text-xs text-gray-400 mb-2">Need help?</p>
                        <a 
                            href="tel:+254712345678"
                            className="text-white font-semibold flex items-center gap-2"
                        >
                            <Phone className="w-4 h-4" />
                            +254 712 345 678
                        </a>
                    </div>

                    {/* Mobile CTA Button */}
                    <div className="mt-auto pt-6 border-t border-white/10 space-y-2">
                        {isAuthenticated ? (
                            <>
                                <Link
                                    to="/dashboard"
                                    onClick={closeMobileMenu}
                                    className="flex items-center justify-center gap-3 w-full py-3.5 px-4 bg-emerald-500 text-white text-center rounded-xl font-semibold hover:bg-emerald-600 transition-all active:scale-95"
                                >
                                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                        <span className="text-sm font-bold">
                                            {user?.userName 
                                                ? user.userName.trim().split(/\s+/).length >= 2
                                                    ? (user.userName.trim().split(/\s+/)[0].charAt(0) + user.userName.trim().split(/\s+/)[1].charAt(0)).toUpperCase()
                                                    : user.userName.charAt(0).toUpperCase()
                                                : "U"}
                                        </span>
                                    </div>
                                    <span>Dashboard</span>
                                </Link>
                                <button
                                    onClick={() => {
                                        handleLogout();
                                        closeMobileMenu();
                                    }}
                                    className="block w-full py-3.5 px-4 bg-white/10 text-white text-center rounded-xl font-semibold hover:bg-white/20 transition-all active:scale-95"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                        <button
                            onClick={() => openAuthModal("login")}
                            className="block w-full py-3.5 px-4 bg-white text-black text-center rounded-xl font-semibold hover:bg-gray-100 transition-all active:scale-95"
                        >
                            Login / Register
                        </button>
                        )}
                    </div>

                    {/* Brand Footer */}
                    <div className="mt-4 text-center">
                        <p className="text-xs text-white/30">
                            © 2024 GariZetu • Made in Kenya 🇰🇪
                        </p>
                    </div>
                </div>
            </div>

            {/* Auth Modal */}
            <AuthModal 
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                initialMode={authMode}
                onLoginSuccess={handleLoginSuccess}
            />
        </nav>
    );
}
