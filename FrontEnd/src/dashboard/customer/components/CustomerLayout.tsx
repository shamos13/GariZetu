import { ReactNode, useState, useEffect, useRef } from "react";
import { Search, Bell, ChevronDown, Menu, Home, Car, Calendar, User, LogOut } from "lucide-react";
import { Button } from "../../../components/ui/button.tsx";
import { useNavigate } from "react-router-dom";
import { authService } from "../../../services/AuthService.ts";
import logoImage from "../../../assets/logo.png";

interface CustomerLayoutProps {
    children: ReactNode;
    title: string;
    currentPage: string;
    onNavigate: (page: string) => void;
    onBack?: () => void;
}

const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home, path: "/dashboard" },
    { id: "profile", label: "My Profile", icon: User, path: "/dashboard/profile" },
    { id: "bookings", label: "My Bookings", icon: Calendar, path: "/dashboard/bookings" },
    { id: "vehicles", label: "Browse Vehicles", icon: Car, path: "/vehicles" },
];

export function CustomerLayout({ children, title, currentPage, onNavigate, onBack }: CustomerLayoutProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const user = authService.getUser();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        authService.logout();
        navigate("/");
        window.location.reload(); // Refresh to update navbar
    };

    const handleNavigate = (item: typeof menuItems[0]) => {
        if (item.path.startsWith("/dashboard")) {
            onNavigate(item.id);
        } else {
            navigate(item.path);
        }
        setIsMobileMenuOpen(false);
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            {/* Sidebar */}
            <aside className={`fixed top-0 left-0 h-full w-[240px] bg-[#141414] border-r border-gray-800 z-50 transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
                <div className="p-6 h-full flex flex-col">
                    <div className="flex items-center gap-3 mb-8">
                        <img src={logoImage} alt="GariZetu" className="w-8 h-8" />
                        <span className="text-white font-semibold">GariZetu</span>
                    </div>

                    <nav className="space-y-1 flex-1">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => handleNavigate(item)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                                        currentPage === item.id
                                            ? "bg-white text-black"
                                            : "text-gray-400 hover:bg-gray-800 hover:text-white"
                                    }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span>{item.label}</span>
                                </button>
                            );
                        })}
                    </nav>

                    {onBack && (
                        <div className="pt-6 mt-6 border-t border-gray-800">
                            <Button
                                onClick={onBack}
                                variant="outline"
                                className="w-full bg-transparent border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white"
                            >
                                Back to Site
                            </Button>
                        </div>
                    )}
                </div>
            </aside>

            {/* Mobile menu overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Main content */}
            <div className="lg:ml-[240px]">
                {/* Header */}
                <header className="sticky top-0 z-30 bg-[#0a0a0a] border-b border-gray-800">
                    <div className="flex items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setIsMobileMenuOpen(true)}
                                className="lg:hidden text-white"
                            >
                                <Menu className="w-6 h-6" />
                            </button>
                            <h1 className="text-white text-xl font-semibold">{title}</h1>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Search */}
                            <div className="hidden md:flex items-center gap-2 bg-[#1a1a1a] rounded-lg px-4 py-2 min-w-[300px]">
                                <Search className="w-4 h-4 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Search vehicles..."
                                    className="bg-transparent border-none outline-none text-sm text-white placeholder:text-gray-500 w-full"
                                />
                            </div>

                            {/* Notifications */}
                            <button 
                                onClick={() => navigate("/dashboard/bookings")}
                                className="relative p-2 hover:bg-gray-800 rounded-lg transition-colors"
                            >
                                <Bell className="w-5 h-5 text-gray-400" />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full"></span>
                            </button>

                            {/* Profile */}
                            <div className="relative" ref={profileRef}>
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="flex items-center gap-2 p-2 hover:bg-gray-800 rounded-lg transition-colors"
                                >
                                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center">
                                        <span className="text-sm font-semibold text-white">
                                            {user?.userName?.charAt(0).toUpperCase() || "U"}
                                        </span>
                                    </div>
                                    <span className="hidden md:inline text-sm text-white">{user?.userName || "User"}</span>
                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                </button>

                                {isProfileOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-[#1a1a1a] border border-gray-800 rounded-lg shadow-lg py-2">
                                        <button 
                                            onClick={() => {
                                                onNavigate("profile");
                                                setIsProfileOpen(false);
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-2"
                                        >
                                            <User className="w-4 h-4" />
                                            Profile
                                        </button>
                                        <button 
                                            onClick={() => {
                                                navigate("/vehicles");
                                                setIsProfileOpen(false);
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-2"
                                        >
                                            <Car className="w-4 h-4" />
                                            Browse Vehicles
                                        </button>
                                        <hr className="my-2 border-gray-800" />
                                        <button 
                                            onClick={handleLogout}
                                            className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-gray-800 flex items-center gap-2"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="p-6 min-h-[calc(100vh-80px)]">
                    {children}
                </main>

                {/* Footer */}
                <footer className="border-t border-gray-800 px-6 py-4">
                    <p className="text-gray-500 text-sm text-center">© 2025 GariZetu. All rights reserved.</p>
                </footer>
            </div>
        </div>
    );
}
