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
  title: "Collectif 95:59 — Accompagnement à l'emploi à Madagascar",
  description:
    "Centralisez les offres, optimisez votre CV, et connectez-vous aux meilleures opportunités locales et internationales. La plateforme d'employabilité pour Madagascar.",
  keywords: [
    "emploi Madagascar",
    "CV ATS",
    "offres Canada",
    "coaching carrière",
    "immigration",
    "Collectif 95:59",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
