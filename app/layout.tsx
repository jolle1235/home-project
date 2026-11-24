import "./globals.css";
import type { Metadata, Viewport } from "next";
import { ToastContainer } from "react-toastify";

export const metadata: Metadata = {
  title: "Home Project",
  description: "Husstandens opskrifter, madplan og indkøbsliste",
  applicationName: "Home Project",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Home Project",
  },
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: "/icon/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icon/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
  // Next 16 renders appleWebApp.capable as mobile-web-app-capable only; iOS still reads
  // this one for standalone mode.
  other: { "apple-mobile-web-app-capable": "yes" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  // The navigation's background (--cream-100).
  themeColor: "#fcfaee",
  colorScheme: "light",
};

// The app shell (providers, navigation) is in app/features/layout.tsx, so /login
// (app/login) renders without it.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="da" style={{ colorScheme: "light" }}>
      <body className="antialiased min-h-screen flex flex-col">
        {children}
        <ToastContainer position="bottom-center" autoClose={2500} />
      </body>
    </html>
  );
}
