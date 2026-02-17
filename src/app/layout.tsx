import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProviders } from "../components/providers/app-providers";
import { Toaster } from "@/components/ui/toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Horizon Quest C",
  description:
    "Fique por dentro de tudo que acontece no mundo de Horizon Quest C",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AppProviders>
          {children}
          <Toaster />
        </AppProviders>
      </body>
    </html>
  );
}
