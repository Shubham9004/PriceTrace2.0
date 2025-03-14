"use client";

import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import "./globals.css";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Inter, Space_Grotesk } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"]
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
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