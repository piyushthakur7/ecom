import type { Metadata, Viewport } from 'next';
import { Archivo } from 'next/font/google';
import { siteConfig } from '@/lib/site';
import { AuthProvider } from '@/components/auth-context';
import { CartProvider } from '@/components/cart-context';
import { FavouritesProvider } from '@/components/favourites-context';
import { ToastProvider } from '@/components/toast';
import { Marquee } from '@/components/marquee';
import { Nav } from '@/components/nav';
import './globals.css';

const archivo = Archivo({
  subsets: ['latin'],
  weight: ['400', '600', '800'],
  display: 'optional',
  variable: '--font-archivo',
  preload: true,
  // Metric-adjusted stand-ins, so the text does not reflow when Archivo lands.
  fallback: ['system-ui', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
});

export const metadata: Metadata = {
  title: `${siteConfig.name} — ${siteConfig.tagline}`,
  description: siteConfig.description,
  openGraph: {
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#f3f2f2',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={archivo.variable}>
      <body>
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <FavouritesProvider>
                <Marquee />
                <Nav />
                {children}
              </FavouritesProvider>
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
