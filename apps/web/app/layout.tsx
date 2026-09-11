import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { DisableMobileZoom } from "./_components/disable-mobile-zoom";
import { ReduxProvider } from "./redux-provider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Rotaract Club",
  description: "Rotaract Club",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <DisableMobileZoom />
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
}
