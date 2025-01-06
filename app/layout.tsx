import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import './globals.css';
import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import NProgressHandler from '@/components/NProgressHandler'; // Import the NProgress handler

// Font configurations
const inter = Inter({ subsets: ['latin'] });
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

// Metadata for the application
export const metadata: Metadata = {
  title: 'PriceTrace',
  description: 'Track product prices effortlessly and save money on your online shopping.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Include the NProgress handler to handle route changes */}
        <NProgressHandler />
        <main className="max-w-10xl mx-auto">
          <Navbar />
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
