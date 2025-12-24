import { ReactNode, useState, useEffect, useRef } from "react";
import { Search, Bell, ChevronDown, Menu} from "lucide-react";
import { Button } from "../../../components/ui/button.tsx";
import logoImage from "../../../assets/logo.png";

interface AdminLayoutProps {
    children: ReactNode;
    title: string;
    currentPage: string;
    onNavigate: (page: string) => void;
    onBack?: () => void;
}

const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { id: "cars", label: "Cars", icon: "M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" },
    { id: "bookings", label: "Bookings", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
    { id: "users", label: "Users", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
    { id: "payments", label: "Payments", icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" },
    { id: "reports", label: "Reports", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
    { id: "settings", label: "Settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" },
];

export function AdminLayout({ children, title, currentPage, onNavigate, onBack }: AdminLayoutProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);

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

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            {/* Sidebar */}
            <aside className={`fixed top-0 left-0 h-full w-[240px] bg-[#141414] border-r border-gray-800 z-50 transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
                <div className="p-6 h-full flex flex-col">
                    <div className="flex items-center gap-3 mb-8">
                        <img src={logoImage} alt="GariZetu" className="w-8 h-8" />
                        <span className="text-white">GariZetu</span>
                    </div>

                    <nav className="space-y-1 flex-1">
                        {menuItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    onNavigate(item.id);
                                    setIsMobileMenuOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                                    currentPage === item.id
                                        ? "bg-white text-black"
                                        : "text-gray-400 hover:bg-gray-800 hover:text-white"
                                }`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                                </svg>
                                <span>{item.label}</span>
                            </button>
                        ))}
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
                            <h1 className="text-white">{title}</h1>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Search */}
                            <div className="hidden md:flex items-center gap-2 bg-[#1a1a1a] rounded-lg px-4 py-2 min-w-[300px]">
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
                                    <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                                        <span className="text-sm">A</span>
                                    </div>
                                    <span className="hidden md:inline text-sm text-white">Admin</span>
                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                </button>

                                {isProfileOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-[#1a1a1a] border border-gray-800 rounded-lg shadow-lg py-2">
                                        <button className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-800">
                                            Profile
                                        </button>
                                        <button className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-800">
                                            Settings
                                        </button>
                                        <hr className="my-2 border-gray-800" />
                                        <button className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-gray-800">
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