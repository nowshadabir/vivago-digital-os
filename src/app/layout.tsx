import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";

import "./globals.css";
import { PwaRegister } from "@/components/pwa-register";

const bodyFont = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
});

const displayFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  applicationName: "Vivago Digital OS",
  title: "Vivago Digital OS",
  description: "Vivago Digital OS is a business operations workspace for clients, projects, invoices, and internal records.",
  themeColor: "#0f172a",
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
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}