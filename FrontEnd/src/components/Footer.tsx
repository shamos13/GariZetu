import { Link } from "react-router-dom";
import { 
    Phone, 
    Mail, 
    MapPin, 
    Facebook, 
    Twitter, 
    Instagram, 
    Linkedin,
    ArrowUp,
    MessageCircle
} from "lucide-react";

const FOOTER_LINKS = {
    company: [
        { label: "About Us", href: "/about" },
        { label: "Careers", href: "/careers" },
        { label: "Press", href: "/press" },
        { label: "Blog", href: "/blog" },
    ],
    support: [
        { label: "Contact Us", href: "/contact" },
        { label: "FAQs", href: "/contact#faq" },
        { label: "Help Center", href: "/help" },
        { label: "Report Issue", href: "/report" },
    ],
    legal: [
        { label: "Terms of Service", href: "/terms" },
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Cookie Policy", href: "/cookies" },
        { label: "Refund Policy", href: "/refunds" },
    ],
    vehicles: [
        { label: "All Vehicles", href: "/vehicles" },
        { label: "Sedans", href: "/vehicles?bodyType=Sedan" },
        { label: "SUVs", href: "/vehicles?bodyType=SUV" },
        { label: "Luxury Cars", href: "/vehicles?sort=price-desc" },
    ]
};

const SOCIAL_LINKS = [
    { icon: Facebook, href: "https://facebook.com/garizetu", label: "Facebook" },
    { icon: Twitter, href: "https://twitter.com/garizetu", label: "Twitter" },
    { icon: Instagram, href: "https://instagram.com/garizetu", label: "Instagram" },
    { icon: Linkedin, href: "https://linkedin.com/company/garizetu", label: "LinkedIn" },
];

export function Footer() {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-black text-white">
            {/* Main Footer */}
            <div className="layout-container pt-8 pb-5">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-5 mb-6">
                    {/* Brand Column */}
                    <div className="col-span-2">
                        <Link to="/" className="inline-block mb-2.5">
                            <img 
                                src="/src/assets/logo.png" 
                                alt="GariZetu" 
                                className="h-8 w-auto"
                            />
                        </Link>
                        <p className="text-gray-400 text-sm mb-3 max-w-xs">
                            Kenya's premier car rental service. Quality vehicles, transparent pricing, 
                            and exceptional service since 2016.
                        </p>
                        
                        {/* Contact Info */}
                        <div className="space-y-1.5">
                            <a 
                                href="tel:+254759064318"
                                className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors group"
                            >
                                <Phone className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                <span className="text-sm">+254 727 805 351</span>
                            </a>
                            <a 
                                href="mailto:akwatuha04@gmail.com"
                                className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors group"
                            >
                                <Mail className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                <span className="text-sm">akwatuha04@gmail.com</span>
                            </a>
                            <div className="flex items-center gap-3 text-gray-400">
                                <MapPin className="w-4 h-4" />
                                <span className="text-sm">Westlands, Nairobi</span>
                            </div>
                        </div>
                    </div>

                    {/* Company */}
                    <div>
                        <h3 className="font-semibold text-white mb-2.5">Company</h3>
                        <ul className="space-y-1.5">
                            {FOOTER_LINKS.company.map((link) => (
                                <li key={link.label}>
                                    <Link 
                                        to={link.href}
                                        className="text-sm text-gray-400 hover:text-white transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Vehicles */}
                    <div>
                        <h3 className="font-semibold text-white mb-2.5">Vehicles</h3>
                        <ul className="space-y-1.5">
                            {FOOTER_LINKS.vehicles.map((link) => (
                                <li key={link.label}>
                                    <Link 
                                        to={link.href}
                                        className="text-sm text-gray-400 hover:text-white transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="font-semibold text-white mb-2.5">Support</h3>
                        <ul className="space-y-1.5">
                            {FOOTER_LINKS.support.map((link) => (
                                <li key={link.label}>
                                    <Link 
                                        to={link.href}
                                        className="text-sm text-gray-400 hover:text-white transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="font-semibold text-white mb-2.5">Legal</h3>
                        <ul className="space-y-1.5">
                            {FOOTER_LINKS.legal.map((link) => (
                                <li key={link.label}>
                                    <Link 
                                        to={link.href}
                                        className="text-sm text-gray-400 hover:text-white transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Social & Newsletter */}
                <div className="border-t border-white/10 pt-5 mb-5">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        {/* Social Links */}
                        <div className="flex items-center gap-3">
                            {SOCIAL_LINKS.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-all group"
                                    aria-label={social.label}
                                >
                                    <social.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                </a>
                            ))}
                        </div>

                        {/* WhatsApp CTA */}
                        <a
                            href="https://wa.me/254712345678?text=Hello GariZetu, I'd like to inquire about car rental."
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 rounded-full text-white font-medium transition-all hover:scale-105"
                        >
                            <MessageCircle className="w-4 h-4" />
                            Chat on WhatsApp
                        </a>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-white/10 pt-4 flex flex-col md:flex-row items-center justify-between gap-3">
                    <p className="text-sm text-gray-400">
                        © {currentYear} GariZetu. All rights reserved.
                    </p>
                    
                    <div className="flex items-center gap-6 text-sm text-gray-400">
                        <span>🇰🇪 Made in Kenya</span>
                        <button
                            onClick={scrollToTop}
                            className="flex items-center gap-2 hover:text-white transition-colors group"
                        >
                            Back to top
                            <ArrowUp className="w-4 h-4 group-hover:-translate-y-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    );
}
