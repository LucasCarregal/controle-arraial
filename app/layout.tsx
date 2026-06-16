import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Arraial dos Amigos",
  description: "Confirme seu interesse na maior festa junina entre amigos!",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&family=Fredoka+One&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
