import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter_Tight } from "next/font/google";
import { AppShell } from "@/components/AppShell";
import "./globals.css";

const devFont = Inter_Tight({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-dev",
  display: "swap",
});

export const metadata: Metadata = {
  title: "HEIKI HEIKI Pro — Partner Portal",
  description:
    "For distributors, retail chains, and brand partners. Products, ingredient research, science, and brand assets.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={devFont.variable}>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
