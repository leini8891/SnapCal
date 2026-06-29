import type { Metadata } from "next";
import { SnapCalProvider } from "@/components/snapcal-provider";
import { Manrope, Space_Grotesk } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SnapCal | Singapore-first hawker food logging",
  description:
    "Snap, adjust, and stay on budget with a hawker-aware calorie logging PWA built for Singapore meals.",
  applicationName: "SnapCal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col pb-[calc(78px+env(safe-area-inset-bottom))] md:pb-0">
        <SnapCalProvider>{children}</SnapCalProvider>
      </body>
    </html>
  );
}
