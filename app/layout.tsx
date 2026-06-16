import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://arraialdosamigos.vercel.app"
  ),
  title: "Arraial dos Amigos",
  description: "Festa entre amigos — 25 de Julho em Ibirité MG. Confirme sua presença!",
  openGraph: {
    title: "Arraial dos Amigos 🌽",
    description: "Festa entre amigos — 25 de Julho em Ibirité MG. Confirme sua presença!",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Arraial dos Amigos 🌽",
    description: "Festa entre amigos — 25 de Julho em Ibirité MG.",
  },
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
