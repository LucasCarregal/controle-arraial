import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Arraial dos Amigos — 25 de Julho de 2026";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0f1419",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px",
          position: "relative",
        }}
      >
        {/* Bordas douradas */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 10, background: "#FFB81C", display: "flex" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 10, background: "#FFB81C", display: "flex" }} />
        <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 10, background: "#FFB81C", display: "flex" }} />
        <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: 10, background: "#FFB81C", display: "flex" }} />

        <div style={{ fontSize: 90, marginBottom: 16, display: "flex" }}>🌽</div>

        <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: 4, color: "#FFB81C", marginBottom: 20, display: "flex" }}>
          25 DE JULHO DE 2026 · IBIRITÉ - MG
        </div>

        <div style={{ fontSize: 86, fontWeight: 800, color: "#FFD700", marginBottom: 12, textAlign: "center", display: "flex" }}>
          ARRAIAL DOS AMIGOS
        </div>

        <div style={{ fontSize: 34, fontWeight: 600, color: "#ffffff", marginBottom: 44, display: "flex" }}>
          🎉 Festa Entre Amigos 🎉
        </div>

        <div style={{ background: "#FFB81C", color: "#000000", fontSize: 26, fontWeight: 700, padding: "16px 52px", borderRadius: 12, display: "flex" }}>
          Confirme sua presença!
        </div>
      </div>
    ),
    { ...size }
  );
}
