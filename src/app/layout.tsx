import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google"; // Import the fonts
import Navbar from "@/components/Navbar";
import "./globals.css";

// 1. Initialize the fonts
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "My Professional Blog",
  description: "Electrical and Computer Engineering Insights",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {/* 2. Add the Navbar here so it shows up on every page */}
        <Navbar />

        {/* 3. Wrap children in a main tag for better layout control */}
        <main>{children}</main>
      </body>
    </html>
  );
}
