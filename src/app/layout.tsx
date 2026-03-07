import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import GlobalHeader from "@/components/GlobalHeader";
import GlobalModals from "@/components/GlobalModals";
import AiEngineSync from "@/components/AiEngineSync";
import Footer from "@/components/Layout/Footer";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: {
    template: "%s | HOMO",
    default: "HOMO | The Intelligent Writing Environment",
  },
  description: "A professional, distraction-free writing environment. Craft your manuscripts with context-aware AI assistance, real-time streaming, and absolute focus.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="emerald">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased h-screen flex flex-col overflow-hidden bg-base-200 text-base-content`}>
        <AiEngineSync />
        {/* HEADER: Altezza fissa */}
        <div className="flex-none">
          <GlobalHeader />
        </div>
        
        {/* MAIN: Occupa tutto lo spazio restante e gestisce i suoi scroll interni */}
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
        
        {/* FOOTER: Altezza fissa, bloccato in fondo senza sovrapposizioni */}
        <div className="flex-none">
          <Footer />
        </div>

        <GlobalModals />
      </body>
    </html>
  );
}
