import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { AuthProvider } from "@/lib/auth-context";
import { ToastProvider } from "@/lib/toast";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "Staybnb", template: "%s · Staybnb" },
  description: "Book unique stays in real time, or reserve months ahead. Reviews from real guests.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <ToastProvider>
          <AuthProvider>
            <Suspense fallback={<div className="h-16 border-b border-zinc-200" />}>
              <Header />
            </Suspense>
            <main className="flex-1">{children}</main>
            <Footer />
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
