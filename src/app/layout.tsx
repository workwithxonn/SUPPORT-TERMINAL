import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "../index.css";
import { cn } from "@/src/lib/utils";
import { Providers } from "@/src/components/Providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" });

export const metadata: Metadata = {
  title: "XONN-SECURE // UPLINK",
  description: "Secure Donation Terminal for Tactical Support",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={cn(
        "min-h-screen bg-hud-dark font-sans antialiased selection:bg-hud-yellow selection:text-black",
        inter.variable,
        jetbrainsMono.variable,
        spaceGrotesk.variable
      )}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
