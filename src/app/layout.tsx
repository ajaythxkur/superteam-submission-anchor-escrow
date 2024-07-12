import type { Metadata } from "next";
import { Poppins } from "next/font/google"
import localFont from "next/font/local"
import "./globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { BootstrapProvider } from "@/context/BootstrapProvider";
import AppWalletProvider from "@/context/AppWalletProvider";
import { AppProvider } from "@/context/AppProvider";
import { Toaster } from "react-hot-toast";

const localFontStyle = localFont({
  src: "./../../public/Cubano.ttf",
  variable: "--font-cubano",
});
const _font = Poppins({ subsets: ["latin"], weight: "400" })

export const metadata: Metadata = {
  title: "Escrow UI + Blink",
  description: "escrow-ui-blink-st-talent-olympics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={localFontStyle.className}>
        <AppWalletProvider>
          <AppProvider>
            {children}
          </AppProvider>
        </AppWalletProvider>
        <BootstrapProvider />
        <Toaster
          position="top-right"
        />
      </body>
    </html>
  );
}
