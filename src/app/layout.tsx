import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EasyBusAq",
  description: "Pianificatore autobus L'Aquila",
  manifest: "/manifest.json",
  themeColor: "#0b66c3",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "EasyBusAq",
  },
  icons: {
    icon: [
      { url: "/bus-logo.svg", sizes: "192x192", type: "image/svg+xml" },
      { url: "/bus-logo.svg", sizes: "512x512", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/bus-logo.svg", sizes: "192x192", type: "image/svg+xml" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <head>
  <meta name="theme-color" content="#0b66c3" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
  <meta name="apple-mobile-web-app-title" content="EasyBusAq" />
  <link rel="icon" href="/bus-logo.ico" />
  <link rel="apple-touch-icon" href="/bus-logo.svg" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
