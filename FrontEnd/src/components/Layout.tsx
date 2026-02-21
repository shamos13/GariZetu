import { ReactNode } from 'react';
import { ScrollToTop, FloatingScrollButton } from './ScrollToTop';
import { WhatsAppButton } from './WhatsAppButton';

// Import fonts
import '@fontsource/figtree/300.css';
import '@fontsource/figtree/400.css';
import '@fontsource/figtree/500.css';
import '@fontsource/figtree/600.css';
import '@fontsource/figtree/700.css';
import '@fontsource/playfair-display/400.css';
import '@fontsource/playfair-display/700.css';
import '@fontsource/playball/400.css';

interface LayoutProps {
    children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
    return (
        <div className="font-sans antialiased">
            <ScrollToTop />
            {children}
            <WhatsAppButton />
            <FloatingScrollButton />
        </div>
    );
}
