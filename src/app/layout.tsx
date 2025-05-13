import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import BotpressEmbed from "@/components/BotpressEmbed";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vottun API Demo",
  description: "Interactive demo for Vottun APIs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/Frame.png" type="image/png" />
        <link href="https://fonts.googleapis.com/css2?family=Kumbh+Sans:wght@100..900&display=swap" rel="stylesheet" />
      </head>
      <body className={`${inter.variable} ${robotoMono.variable} antialiased min-h-screen `}>
        {children}
        <BotpressEmbed />
      </body>
    </html>
  );
}
