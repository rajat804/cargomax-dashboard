import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ModuleProvider } from "@/contexts/ModuleContext";
import { Toaster } from "react-hot-toast"; 

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cargomax – Shipping & Logistics Admin Dashboard",
  description: "Logistics admin dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={inter.className}
        suppressHydrationWarning={true}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          {/* ✅ Wrap with ModuleProvider */}
          <ModuleProvider>
            {children}
          </ModuleProvider>
          <Toaster position="top-right" /> {/* ✅ Optional: For toast notifications */}
        </ThemeProvider>
      </body>
    </html>
  );
}