"use client";

import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import "./globals.css";
import Script from "next/script";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Inter, Space_Grotesk } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

// Google Analytics Tracking ID
const GA_TRACKING_ID = "G-RKDXPTMTWD";

// Google AdSense Publisher ID
const ADSENSE_CLIENT_ID = "ca-pub-6900154269016695";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Google Analytics Script */}
        <Script strategy="afterInteractive" src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`} />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}', { send_page_view: false });
          `}
        </Script>

        {/* Google AdSense Script */}
        <Script
          strategy="afterInteractive"
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
          crossOrigin="anonymous"
        />
      </head>
      <body className={inter.className}>
        <Suspense fallback={<div>Loading...</div>}>
          <LayoutContent>{children}</LayoutContent>
        </Suspense>
      </body>
    </html>
  );
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Ensure window.gtag is available before calling it
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "page_view", {
        page_path: pathname,
        page_location: window.location.href,
      });
    }

    // NProgress loader for navigation
    NProgress.start();
    const timer = setTimeout(() => NProgress.done(), 500);
    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  return (
    <main className="max-w-10xl mx-auto">
      <Navbar />
      {children}
      <Footer />
    </main>
  );
}
