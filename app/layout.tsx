import type { Metadata, Viewport } from "next";
import { Inter, Patrick_Hand } from "next/font/google";

import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { APP_DESCRIPTION, APP_NAME } from "@/lib/constants";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const patrickHand = Patrick_Hand({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-patrick-hand",
  display: "swap",
  // Only needed once a text label exists, so do not preload it on first paint.
  preload: false,
});

const APP_URL = "https://sketchspace-whiteboard.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: `${APP_NAME} — Infinite Whiteboard`,
    template: `%s · ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
  creator: "Maryam Mumtaz",
  authors: [{ name: "Maryam Mumtaz", url: APP_URL }],
  keywords: [
    "whiteboard",
    "infinite canvas",
    "excalidraw alternative",
    "whiteboard app",
    "sketch",
    "diagram",
    "drawing tool",
    "local-first",
    "next.js",
    "fabric.js",
  ],
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/apple-icon.svg",
  },
  openGraph: {
    title: `${APP_NAME} — Infinite Whiteboard`,
    description: APP_DESCRIPTION,
    siteName: APP_NAME,
    type: "website",
    url: "/",
    images: [
      {
        url: "/icon.svg",
        width: 64,
        height: 64,
        alt: `${APP_NAME} logo`,
      },
    ],
  },
  twitter: {
    card: "summary",
    title: `${APP_NAME} — Infinite Whiteboard`,
    description: APP_DESCRIPTION,
    images: ["/icon.svg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  appleWebApp: {
    capable: true,
    title: APP_NAME,
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#121212" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${patrickHand.variable} font-sans antialiased`}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
