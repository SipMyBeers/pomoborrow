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
  title: "PomoBorrow — Borrow Time From Your Future Self",
  description: "A 24-hour ring timer for deep work. Track every second of your day. iOS, Android, and Desktop.",
  openGraph: {
    title: "PomoBorrow — Borrow Time From Your Future Self",
    description: "A 24-hour ring timer for deep work. Track every second of your day.",
    url: "https://pomoborrow.com",
    siteName: "PomoBorrow",
    type: "website",
  },
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
      >
        {children}
      </body>
    </html>
  );
}
