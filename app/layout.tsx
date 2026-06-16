import type { Metadata } from "next";
import { Josefin_Sans } from "next/font/google";
import "./globals.css";

const josefin = Josefin_Sans({
  subsets: ["latin"],
  variable: "--font-josefin",
});

export const metadata: Metadata = {
  title: "Arraial dos Amigos",
  description: "Confirme seu interesse na maior festa junina entre amigos!",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${josefin.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}
