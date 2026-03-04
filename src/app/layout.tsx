import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import GlobalHeader from "@/components/GlobalHeader";
import GlobalModals from "@/components/GlobalModals";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "HOMO | Dark Epic Fantasy Writing Engine",
  description: "The ultimate dark epic fantasy writing engine. Craft your manuscript with context-aware AI assistance and immersive focus.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="corporate">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen bg-base-100 overflow-hidden`}>
        <GlobalHeader />
        <main className="flex-grow flex flex-col overflow-hidden">
          {children}
        </main>
        <GlobalModals />
      </body>
    </html>
  );
}
