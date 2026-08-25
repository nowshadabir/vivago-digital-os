import type { Metadata, Viewport } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";

import "./globals.css";
import { PwaRegister } from "@/components/pwa-register";
import { SidebarProvider } from "@/components/sidebar-context";

const bodyFont = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
});

const displayFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
});

export const viewport: Viewport = {
  themeColor: "#0f172a",
};

export const metadata: Metadata = {
  applicationName: "Vivago Technologies OS",
  title: "Vivago Technologies OS",
  description: "Vivago Technologies OS is a business operations workspace for clients, projects, invoices, and internal records.",
  icons: {
    icon: [{ url: "/logo/logo.png", sizes: "any", type: "image/png" }],
    apple: [{ url: "/logo/logo.png", sizes: "any", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${bodyFont.variable} ${displayFont.variable} font-sans`}
      >
        <SidebarProvider>
          <PwaRegister />
          {children}
        </SidebarProvider>
      </body>
    </html>
  );
}