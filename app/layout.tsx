import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TimeByCity.net - Live World Clock & City Weather",
  description:
    "Check live time, weather, and timezone information for cities worldwide on TimeByCity.net.",
  keywords: [
    "world clock",
    "city time",
    "timezone",
    "weather by city",
    "timebycity"
  ],
  metadataBase: new URL("https://timebycity.net"),
  openGraph: {
    title: "TimeByCity.net",
    description: "Live world clock and weather by city.",
    url: "https://timebycity.net",
    siteName: "TimeByCity.net",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
