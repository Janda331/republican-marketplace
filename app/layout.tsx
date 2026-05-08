import type { Metadata, Viewport } from "next";
import "./globals.css";
import AppShell from "./AppShell";

export const metadata: Metadata = {
  metadataBase: new URL("https://therepublicanmarketplace.com"),
  title: "The Republican Marketplace",
  description:
    "The premier marketplace for Republican campaign services and political vendors.",
  icons: {
    icon: "/favicon.ico",
    apple: "/logo.png",
  },
  openGraph: {
    title: "The Republican Marketplace",
    description:
      "The premier marketplace for Republican campaign services and political vendors.",
    url: "https://therepublicanmarketplace.com",
    siteName: "The Republican Marketplace",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 1200,
        alt: "The Republican Marketplace",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Republican Marketplace",
    description:
      "The premier marketplace for Republican campaign services and political vendors.",
    images: ["/logo.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="rm-body">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}