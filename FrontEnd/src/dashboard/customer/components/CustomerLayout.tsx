import { ReactNode, useEffect, useRef, useState } from "react";
import { Bell, Calendar, ChevronDown, CreditCard, Gift, Heart, History, Home, LogOut, Menu, User } from "lucide-react";
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

interface MenuItem {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    targetPage: "dashboard" | "bookings" | "profile";
    badge?: string;
}

const primaryMenuItems: MenuItem[] = [
    { id: "dashboard", label: "Dashboard", icon: Home, targetPage: "dashboard" },
    { id: "bookings", label: "My Bookings", icon: Calendar, targetPage: "bookings" },
    { id: "history", label: "Rental History", icon: History, targetPage: "bookings" },
    { id: "rewards", label: "Rewards", icon: Gift, targetPage: "dashboard", badge: "Gold" },
    { id: "favorites", label: "Favorites", icon: Heart, targetPage: "dashboard" },
];

const settingsMenuItems: MenuItem[] = [
    { id: "profile", label: "Profile", icon: User, targetPage: "profile" },
    { id: "payments", label: "Payments", icon: CreditCard, targetPage: "profile" },
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
        window.location.reload();
    };

    const handleNavigate = (item: MenuItem) => {
        onNavigate(item.targetPage);
        setIsMobileMenuOpen(false);
    };

    const userInitial = user?.userName?.charAt(0).toUpperCase() || "U";

    return (
        <div className="bg-[#f3f4f6] text-[#111827]">
            <aside className={`fixed top-0 left-0 h-full w-[250px] bg-[#070a10] border-r border-white/10 z-50 transition-transform duration-300 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
                <div className="h-full p-5 md:p-6 flex flex-col">
                    <div className="flex items-center gap-3 mb-8 pb-7 border-b border-white/10">
                        <img src={logoImage} alt="GariZetu" className="w-8 h-8 object-contain" />
                        <span className="text-white font-semibold tracking-wide">GariZetu Drive</span>
                    </div>

                    <nav className="space-y-1">
                        {primaryMenuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = (item.id === "dashboard" && currentPage === "dashboard")
                                || ((item.id === "bookings" || item.id === "history") && currentPage === "bookings")
                                || (item.id === "profile" && currentPage === "profile");

                            return (
                                <button
                                    key={item.id}
                                    onClick={() => handleNavigate(item)}
                                    className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-colors ${
                                        isActive ? "bg-white/10 text-white" : "text-gray-400 hover:bg-white/5 hover:text-white"
                                    }`}
                                >
                                    <span className="flex items-center gap-3">
                                        <Icon className="w-4.5 h-4.5" />
                                        <span>{item.label}</span>
                                    </span>
                                    {item.badge && (
                                        <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-amber-400 text-black font-semibold">
                                            {item.badge}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </nav>

                    <div className="mt-6 pt-6 border-t border-white/10">
                        <p className="text-[11px] tracking-wider text-gray-500 mb-2 px-3">SETTINGS</p>
                        <div className="space-y-1">
                            {settingsMenuItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = item.id === "profile" && currentPage === "profile";
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => handleNavigate(item)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                                            isActive ? "bg-white/10 text-white" : "text-gray-400 hover:bg-white/5 hover:text-white"
                                        }`}
                                    >
                                        <Icon className="w-4.5 h-4.5" />
                                        <span>{item.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                        {onBack && (
                            <button
                                onClick={onBack}
                                className="w-full mt-3 text-left px-4 py-3 rounded-xl text-gray-300 hover:bg-white/5 transition-colors"
                            >
                                Back to Site
                            </button>
                        )}
                    </div>

                    <div className="mt-auto pt-6 border-t border-white/10 space-y-2">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                        >
                            <LogOut className="w-4.5 h-4.5" />
                            <span>Log Out</span>
                        </button>
                    </div>
                </div>
            </aside>

            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            <div className="lg:ml-[250px]">
                <header className="sticky top-0 z-30 bg-[#f8f8fa]/95 backdrop-blur-sm border-b border-gray-200">
                    <div className="flex items-center justify-between px-5 py-3.5 md:px-6">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setIsMobileMenuOpen(true)}
                                className="lg:hidden text-gray-800"
                            >
                                <Menu className="w-6 h-6" />
                            </button>
                            <div>
                                <h1 className="text-[#111827] text-xl md:text-2xl font-semibold">Welcome back, {user?.userName || "Member"}</h1>
                                <p className="text-sm text-gray-500">
                                    {title === "Dashboard" ? "Manage your premium fleet experience." : title}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => onNavigate("bookings")}
                                className="relative p-2 hover:bg-gray-200 rounded-lg transition-colors"
                                aria-label="Notifications"
                            >
                                <Bell className="w-5 h-5 text-gray-600" />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                            </button>

                            <div className="h-8 w-px bg-gray-300" />

                            <div className="relative" ref={profileRef}>
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="flex items-center gap-3 p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    <div className="text-right hidden md:block leading-tight">
                                        <p className="text-sm text-[#111827] font-semibold">{user?.userName || "User"}</p>
                                        <p className="text-xs text-gray-500">Premium Member</p>
                                    </div>
                                    <div className="w-9 h-9 bg-gradient-to-br from-amber-200 to-amber-300 rounded-full flex items-center justify-center border border-amber-400/30">
                                        <span className="text-sm font-semibold text-white">{userInitial}</span>
                                    </div>
                                    <ChevronDown className="w-4 h-4 text-gray-500" />
                                </button>

                                {isProfileOpen && (
                                    <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-lg py-2">
                                        <button
                                            onClick={() => {
                                                onNavigate("profile");
                                                setIsProfileOpen(false);
                                            }}
                                            className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                        >
                                            <User className="w-4 h-4" />
                                            Profile
                                        </button>
                                        <button
                                            onClick={() => {
                                                onNavigate("bookings");
                                                setIsProfileOpen(false);
                                            }}
                                            className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                        >
                                            <Calendar className="w-4 h-4" />
                                            My Bookings
                                        </button>
                                        <hr className="my-2 border-gray-200" />
                                        <button
                                            onClick={handleLogout}
                                            className="w-full px-4 py-2.5 text-left text-sm text-red-500 hover:bg-gray-100 flex items-center gap-2"
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

                <main className="p-5 md:p-6">
                    {children}
                </main>

                <footer className="border-t border-gray-200 px-5 py-3 md:px-6">
                    <p className="text-gray-500 text-sm text-center">© 2025 GariZetu. All rights reserved.</p>
                </footer>
            </div>
        </div>
    );
}
