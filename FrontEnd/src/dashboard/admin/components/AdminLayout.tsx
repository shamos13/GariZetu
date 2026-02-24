import { ReactNode, useState, useEffect, useRef } from "react";
import {
    Search,
    Bell,
    ChevronDown,
    Menu,
    LayoutGrid,
    CarFront,
    CalendarDays,
    Users,
    BarChart3,
    Settings,
    LogOut,
    type LucideIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/button.tsx";
import { authService } from "../../../services/AuthService.ts";
import logoImage from "../../../assets/logo.png";

interface AdminLayoutProps {
    children: ReactNode;
    title: string;
    currentPage: string;
    onNavigate: (page: string) => void;
    bookingNotificationCount?: number;
    onBack?: () => void;
}

type SidebarMenuItem = {
    id: string;
    label: string;
    icon: LucideIcon;
    badge?: string;
    action?: "navigate" | "logout";
};

const mainMenuItems: SidebarMenuItem[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutGrid },
    { id: "cars", label: "Fleet Management", icon: CarFront },
    { id: "bookings", label: "Bookings", icon: CalendarDays },
    { id: "users", label: "Customers", icon: Users },
    { id: "reports", label: "Analytics", icon: BarChart3 },
];

const settingsMenuItems: SidebarMenuItem[] = [
    { id: "settings", label: "Configuration", icon: Settings },
    { id: "logout", label: "Log Out", icon: LogOut, action: "logout" },
];

export function AdminLayout({
    children,
    title,
    currentPage,
    onNavigate,
    bookingNotificationCount = 0,
    onBack,
}: AdminLayoutProps) {
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

    useEffect(() => {
        const previousOverflow = document.body.style.overflow;
        if (isMobileMenuOpen) {
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [isMobileMenuOpen]);

    const handleLogout = () => {
        authService.logout();
        navigate("/", { replace: true });
    };

    const handleSidebarItemClick = (item: SidebarMenuItem) => {
        if (item.action === "logout") {
            handleLogout();
            return;
        }

        onNavigate(item.id);
        setIsMobileMenuOpen(false);
        setIsProfileOpen(false);
    };

    // Get user initials for avatar
    const getUserInitials = () => {
        if (!user?.userName) return "A";
        const names = user.userName.trim().split(/\s+/);
        if (names.length >= 2) {
            return (names[0].charAt(0) + names[1].charAt(0)).toUpperCase();
        }
        return user.userName.charAt(0).toUpperCase();
    };

    return (
        <div className="min-h-screen overflow-x-hidden bg-[#0a0a0a] text-white font-sans">
            {/* Sidebar */}
            <aside className={`fixed top-0 left-0 h-full w-[240px] overflow-y-auto bg-[#141414] border-r border-gray-800 z-50 transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
                <div className="h-full p-5 md:p-6 flex flex-col">
                    <div className="flex items-center gap-3 mb-8">
                        <img src={logoImage} alt="GariZetu" className="w-8 h-8" />
                        <span className="text-white">GariZetu</span>
                    </div>

                    <nav className="space-y-1 flex-1">
                        <div className="mb-6">
                            <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
                                Main Menu
                            </p>
                            <div className="mt-3 space-y-1.5">
                                {mainMenuItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = currentPage === item.id;
                                    const badgeValue = item.id === "bookings" && bookingNotificationCount > 0
                                        ? bookingNotificationCount.toString()
                                        : item.badge;

                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => handleSidebarItemClick(item)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                                                isActive
                                                    ? "bg-white text-black"
                                                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                                            }`}
                                        >
                                            <Icon className="w-5 h-5 flex-shrink-0" />
                                            <span className="flex-1 text-left text-sm whitespace-nowrap">{item.label}</span>
                                            {badgeValue && (
                                                <span className="inline-flex items-center justify-center rounded-full bg-amber-400 px-2 py-0.5 text-[11px] font-semibold text-black">
                                                    {badgeValue}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
                                Settings
                            </p>
                            <div className="mt-3 space-y-1.5">
                                {settingsMenuItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = item.action !== "logout" && currentPage === item.id;

                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => handleSidebarItemClick(item)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                                                isActive
                                                    ? "bg-white text-black"
                                                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                                            }`}
                                        >
                                            <Icon className="w-5 h-5 flex-shrink-0" />
                                            <span className="text-left text-sm whitespace-nowrap">{item.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </nav>

                    {onBack && (
                        <Button
                            onClick={onBack}
                            variant="outline"
                            className="w-full mt-4 bg-transparent border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white"
                        >
                            Back to Site
                        </Button>
                    )}

                    {/* User Profile Section */}
                    <div className="pt-6 mt-6 border-t border-gray-800">
                        <div className="flex items-center gap-3 px-4 py-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-sm font-semibold text-white">{getUserInitials()}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">{user?.userName || "Admin User"}</p>
                                <p className="text-xs text-gray-400 truncate">{user?.email || "admin@garizetu.com"}</p>
                            </div>
                        </div>
                    </div>
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
            <div className="lg:ml-[240px] min-h-screen flex flex-col">
                {/* Header */}
                <header className="sticky top-0 z-30 bg-[#0a0a0a] border-b border-gray-800">
                    <div className="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-5 md:px-6">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setIsMobileMenuOpen(true)}
                                className="lg:hidden text-white"
                            >
                                <Menu className="w-6 h-6" />
                            </button>
                            <h1 className="text-white">{title}</h1>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-4">
                            {/* Search */}
                            <div className="hidden xl:flex items-center gap-2 bg-[#1a1a1a] rounded-lg px-4 py-2 w-[min(38vw,360px)]">
                                <Search className="w-4 h-4 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="bg-transparent border-none outline-none text-sm text-white placeholder:text-gray-500 w-full"
                                />
                            </div>

                            {/* Notifications */}
                            <button className="relative p-2 hover:bg-gray-800 rounded-lg transition-colors">
                                <Bell className="w-5 h-5 text-gray-400" />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                            </button>

                            {/* Profile */}
                            <div className="relative" ref={profileRef}>
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="flex items-center gap-2 p-2 hover:bg-gray-800 rounded-lg transition-colors"
                                >
                                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center">
                                        <span className="text-sm font-semibold text-white">{getUserInitials()}</span>
                                    </div>
                                    <div className="hidden md:flex flex-col items-start">
                                        <span className="text-sm text-white font-medium">{user?.userName || "Admin User"}</span>
                                        <span className="text-xs text-gray-400">{user?.email || "admin@garizetu.com"}</span>
                                    </div>
                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                </button>

                                {isProfileOpen && (
                                    <div className="absolute right-0 mt-2 w-56 bg-[#1a1a1a] border border-gray-800 rounded-lg shadow-lg py-2 z-50">
                                        <div className="px-4 py-2 border-b border-gray-800">
                                            <p className="text-sm font-medium text-white">{user?.userName || "Admin User"}</p>
                                            <p className="text-xs text-gray-400">{user?.email || "admin@garizetu.com"}</p>
                                        </div>
                                        <button className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-800">
                                            Profile
                                        </button>
                                        <button className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-800">
                                            Settings
                                        </button>
                                        <hr className="my-2 border-gray-800" />
                                        <button 
                                            onClick={handleLogout}
                                            className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-gray-800"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 p-4 sm:p-5 md:p-6">
                    {children}
                </main>

                {/* Footer */}
                <footer className="border-t border-gray-800 px-4 py-3 sm:px-5 md:px-6">
                    <p className="text-gray-500 text-sm text-center">© 2025 GariZetu. All rights reserved.</p>
                </footer>
            </div>
        </div>
    );
}
