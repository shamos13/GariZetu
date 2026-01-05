import {Link} from "react-router-dom";
import {ChevronDown} from "lucide-react";

export function Navbar() {
    return (
        <nav className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-12">
            <Link to="/" className="relative w-32 h-12">
                <img src="src/assets/logo.png" alt="Garizetu Logo" className="object-contain" />
            </Link>

            <div className="hidden md:flex items-center space-x-8 text-white">
                <button className="flex items-center gap-1 hover:text-gray-300 transition-colors">
                    Vehicles <ChevronDown size={16}/>
                </button>
                <Link to="/rent" className="hover:text-gray-300 transition-colors">
                    Rent
                </Link>
                <Link to="/contact" className="hover:text-gray-300 transition-colors">
                    Contact
                </Link>
                <Link
                    to="/login"
                    className="px-6 py-2 border border-white rounded-full hover:bg-white hover:text-black transition-all"
                >
                    Login / Register
                </Link>
            </div>
        </nav>
    );
}