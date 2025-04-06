
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavBar from "./components/smallComponent/Navbar";
import { RecipeProvider } from "./context/RecipeContext";
import { ShoppingListProvider } from "./context/ShoppinglistContext";
import { SessionProviderWrapper } from "./components/authentication/SessionProviderWrapper";
import ToastProvider from "./components/ToastComponent";
import Script from "next/script";
import OfflineSyncComponent from "./components/OfflineSyncComponent";
import type { Metadata, Viewport } from "next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: "Home Project",
  description: "A home project application with recipe and shopping list management",
  manifest: "/manifest.json",
  themeColor: "#000000", 
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Home Project",
  },
  icons: {
    icon: [
      { url: "/icon/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icon/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="application-name" content="Home Project" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Home Project" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#000000" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
        <meta name="HandheldFriendly" content="true" />
        <link rel="apple-touch-icon" href="/icon/icon-192x192.png" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}>
        <SessionProviderWrapper>
          <RecipeProvider>
            <ShoppingListProvider>
              <NavBar />
              <main className="flex-grow container mx-auto px-4 py-6">{children}</main>
              <ToastProvider />
              <OfflineSyncComponent />
            </ShoppingListProvider>
          </RecipeProvider>
        </SessionProviderWrapper>
        <Script src="/sw-register.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
