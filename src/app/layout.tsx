import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CustomizerProvider } from "@/context/CustomizerContext";
import { CMSProvider } from "@/context/CMSContext";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import CheckoutModal from "@/components/CheckoutModal";
import SizeGuideModal from "@/components/SizeGuideModal";
import LookbookModal from "@/components/LookbookModal";
import AdminCMSModal from "@/components/AdminCMSModal";
import StealthAdminListener from "@/components/StealthAdminListener";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NEXTSTEP // Bespoke 3D Interactive Footwear Lab",
  description:
    "Design and customize bespoke performance footwear in interactive real-time WebGL 3D. Additive zero-waste manufacturing, nitrogen-infused bio-lattice soles, and Aeroknit micro-weave.",
  keywords: [
    "3d shoe customizer",
    "bespoke sneakers",
    "three.js shoe brand",
    "NextStep",
    "futuristic footwear",
    "3d printed shoes",
    "interactive sneaker design",
  ],
  authors: [{ name: "NextStep Labs" }],
  openGraph: {
    title: "NEXTSTEP // Real-Time 3D Footwear Atelier",
    description:
      "Interactive 3D Sneaker Customizer & High-Performance Footwear Studio.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <AuthProvider>
          <CMSProvider>
            <CustomizerProvider>
              <StealthAdminListener />
              <Navbar />
              <main className="app-main-content">{children}</main>
              <CartDrawer />
              <CheckoutModal />
              <SizeGuideModal />
              <LookbookModal />
              <AdminCMSModal />
              <Footer />
            </CustomizerProvider>
          </CMSProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

