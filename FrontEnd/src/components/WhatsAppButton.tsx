import { MessageCircle } from "lucide-react";

interface WhatsAppButtonProps {
    phoneNumber?: string;
    message?: string;
}

export function WhatsAppButton({ 
    phoneNumber = "254727805351",
    message = "Hello GariZetu, I'd like to inquire about car rental." 
}: WhatsAppButtonProps) {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    return (
        <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 left-6 z-50 group"
            aria-label="Chat on WhatsApp"
        >
            {/* Pulse Animation */}
            <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-25" />
            
            {/* Button */}
            <div className="relative flex items-center gap-3">
                <div className="w-14 h-14 bg-emerald-500 rounded-full shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <MessageCircle className="w-7 h-7 text-white" />
                </div>
                
                {/* Tooltip */}
                <div className="hidden md:block absolute left-full ml-3 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    <div className="bg-black text-white text-sm px-3 py-2 rounded-lg shadow-lg">
                        Chat with us!
                        <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-black rotate-45" />
                    </div>
                </div>
            </div>
        </a>
    );
}

