import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Image Vault | Secure Image Encryption",
  description: "Securely encrypt and store your images with AES-256 encryption.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <body
          className={`${geistSans.variable} ${geistMono.variable} flex min-h-full flex-col font-sans`}
        >
          {children}
          <Toaster />
        </body>
      </ThemeProvider>
    </html>
  );
}
