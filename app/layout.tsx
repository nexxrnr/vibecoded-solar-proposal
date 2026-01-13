import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ProposalProvider } from "@/context/proposal-context";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Solar Proposal - Kalkulator solarnih panela",
  description: "Izračunajte ROI i uštede sa solarnim panelima za srpsko tržište",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sr">
      <body className={`${inter.variable} antialiased`}>
        <ProposalProvider>
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50">
            {children}
          </div>
        </ProposalProvider>
      </body>
    </html>
  );
}
