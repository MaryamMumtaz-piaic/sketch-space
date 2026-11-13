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
});

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} — Infinite Whiteboard`,
    template: `%s · ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
  keywords: [
    "whiteboard",
    "infinite canvas",
    "sketch",
    "diagram",
    "excalidraw",
    "next.js",
  ],
  authors: [{ name: "Maryam Mumtaz" }],
  openGraph: {
    title: `${APP_NAME} — Infinite Whiteboard`,
    description: APP_DESCRIPTION,
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
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
