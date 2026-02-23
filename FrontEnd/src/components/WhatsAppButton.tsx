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
            className="group fixed bottom-4 left-4 z-50 sm:bottom-6 sm:left-6"
            aria-label="Chat on WhatsApp"
        >
            {/* Pulse Animation */}
            <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-25" />
            
            {/* Button */}
            <div className="relative flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 shadow-lg transition-transform group-hover:scale-110 sm:h-14 sm:w-14">
                    <MessageCircle className="h-6 w-6 text-white sm:h-7 sm:w-7" />
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
