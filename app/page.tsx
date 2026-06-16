"use client";

import { useState } from "react";

function maskPhone(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

const ORGANIZERS = [
  "Lucas",
  "Aline",
  "Vitor",
  "Joao Lima",
  "JP Carregal",
  "Vanessa",
  "Marcio",
];

function Bandeirolas() {
  const colors = [
    "#c0392b",
    "#f5c518",
    "#27ae60",
    "#2980b9",
    "#e8830a",
    "#8e44ad",
    "#c0392b",
    "#f5c518",
    "#27ae60",
    "#2980b9",
    "#e8830a",
    "#8e44ad",
    "#c0392b",
    "#f5c518",
    "#27ae60",
  ];
  return (
    <svg
      viewBox="0 0 800 80"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full"
      preserveAspectRatio="none"
    >
      {/* strings */}
      <path
        d={`M0,10 ${colors.map((_, i) => `L${(i + 0.5) * (800 / colors.length)},${i % 2 === 0 ? 30 : 20}`).join(" ")} L800,10`}
        fill="none"
        stroke="#7b4f2e"
        strokeWidth="2"
      />
      {colors.map((color, i) => {
        const x = (i + 0.5) * (800 / colors.length);
        const y = i % 2 === 0 ? 30 : 20;
        return (
          <polygon
            key={i}
            points={`${x - 12},${y} ${x + 12},${y} ${x},${y + 28}`}
            fill={color}
            opacity="0.9"
          />
        );
      })}
    </svg>
  );
}

export default function HomePage() {
  const [form, setForm] = useState({
    name: "",
    contact: "",
    invitedBy: "",
    otherName: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const invitedBy =
      form.invitedBy === "Outros"
        ? `Outros: ${form.otherName.trim()}`
        : form.invitedBy;

    if (!form.name.trim() || !form.contact.trim() || !form.invitedBy) {
      setError("Preencha todos os campos.");
      return;
    }
    if (form.invitedBy === "Outros" && !form.otherName.trim()) {
      setError("Informe o nome de quem te convidou.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          contact: form.contact.trim(),
          invitedBy,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao enviar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="min-h-screen"
      style={{
        background: "linear-gradient(180deg, #fef9ec 0%, #fde68a 100%)",
      }}
    >
      {/* Bandeirolas */}
      <div className="w-full overflow-hidden" style={{ lineHeight: 0 }}>
        <Bandeirolas />
      </div>

      {/* Header */}
      <header className="text-center pt-8 pb-4 px-4">
        <div className="text-6xl mb-2">🌽</div>
        <h1
          className="text-5xl font-bold tracking-wide uppercase"
          style={{
            fontFamily: "var(--font-josefin), sans-serif",
            color: "#7b4f2e",
            textShadow: "2px 2px 0 #f5c518, 4px 4px 0 #e8830a",
          }}
        >
          Arraial dos Amigos
        </h1>
        <p className="text-xl mt-2 font-semibold" style={{ color: "#c0392b" }}>
          Uma festa entre amigos 🎉
        </p>
      </header>

      {/* Atrações */}
      <section className="max-w-2xl mx-auto px-4 py-6">
        <div
          className="rounded-2xl p-6 shadow-lg border-4"
          style={{ background: "#fff8e7", borderColor: "#f5c518" }}
        >
          <h2
            className="text-2xl font-bold text-center mb-4 uppercase tracking-wide"
            style={{
              color: "#7b4f2e",
              fontFamily: "var(--font-josefin), sans-serif",
            }}
          >
            ✨ Atrações
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: "🎸", label: "Música ao vivo" },
              { icon: "🎱", label: "Bingo" },
              { icon: "🔥", label: "Fogueira" },
              { icon: "🌽", label: "Comidas típicas" },
              { icon: "🥤", label: "Bebidas não alcoólicas" },
              { icon: "💃", label: "Muita animação" },
            ].map(({ icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 rounded-xl px-3 py-2 font-semibold text-sm"
                style={{ background: "#fde68a", color: "#7b4f2e" }}
              >
                <span className="text-xl">{icon}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Avisos importantes */}
      <section className="max-w-2xl mx-auto px-4 pb-6 flex flex-col gap-3">
        <div
          className="rounded-xl p-4 border-l-4 flex gap-3 items-start"
          style={{ background: "#fff3cd", borderColor: "#e8830a" }}
        >
          <span className="text-2xl">⚠️</span>
          <p className="text-sm font-medium" style={{ color: "#7b4f2e" }}>
            <strong>Bebidas alcoólicas não estão inclusas</strong>, mas teremos
            toda a estrutura para você armazenar e curtir as suas.
          </p>
        </div>
        {/* <div
          className="rounded-xl p-4 border-l-4 flex gap-3 items-start"
          style={{ background: "#e8f5e9", borderColor: "#27ae60" }}
        >
          <span className="text-2xl">🍹</span>
          <p className="text-sm font-medium" style={{ color: "#1a5e34" }}>
            <strong>Bar de drinks à parte</strong> — disponível na festa, com pagamento separado.
          </p>
        </div> */}
        <div
          className="rounded-xl p-4 border-l-4 flex gap-3 items-start"
          style={{ background: "#e3f2fd", borderColor: "#2980b9" }}
        >
          <span className="text-2xl">📲</span>
          <p className="text-sm font-medium" style={{ color: "#1a3a5e" }}>
            <strong>Quer trazer alguém?</strong> Comunique um dos organizadores
            antes de chamar.
          </p>
        </div>
      </section>

      {/* Formulário */}
      <section className="max-w-lg mx-auto px-4 pb-16">
        <div
          className="rounded-2xl p-6 shadow-xl border-4"
          style={{ background: "#ffffff", borderColor: "#c0392b" }}
        >
          <h2
            className="text-2xl font-bold text-center mb-1 uppercase tracking-wide"
            style={{
              color: "#c0392b",
              fontFamily: "var(--font-josefin), sans-serif",
            }}
          >
            🎟️ Quero ir!
          </h2>
          <p className="text-center text-sm mb-5" style={{ color: "#888" }}>
            Confirme seu interesse e entre na lista
          </p>

          {success ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🎉</div>
              <p className="text-2xl font-bold" style={{ color: "#27ae60" }}>
                Oba! Você está na lista!
              </p>
              <p className="text-sm mt-2" style={{ color: "#666" }}>
                Aguarde mais informações dos organizadores.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label
                  className="block text-sm font-bold mb-1"
                  style={{ color: "#7b4f2e" }}
                >
                  Nome completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Seu nome"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-xl border-2 px-4 py-3 text-sm outline-none transition"
                  style={{ borderColor: "#f5c518", background: "#fef9ec" }}
                />
              </div>

              <div>
                <label
                  className="block text-sm font-bold mb-1"
                  style={{ color: "#7b4f2e" }}
                >
                  WhatsApp / Contato *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="(00) 00000-0000"
                  value={form.contact}
                  onChange={(e) =>
                    setForm({ ...form, contact: maskPhone(e.target.value) })
                  }
                  className="w-full rounded-xl border-2 px-4 py-3 text-sm outline-none transition"
                  style={{ borderColor: "#f5c518", background: "#fef9ec" }}
                />
              </div>

              <div>
                <label
                  className="block text-sm font-bold mb-1"
                  style={{ color: "#7b4f2e" }}
                >
                  Quem te convidou? *
                </label>
                <select
                  required
                  value={form.invitedBy}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      invitedBy: e.target.value,
                      otherName: "",
                    })
                  }
                  className="w-full rounded-xl border-2 px-4 py-3 text-sm outline-none transition"
                  style={{
                    borderColor: "#f5c518",
                    background: "#fef9ec",
                    color: form.invitedBy ? "#333" : "#999",
                  }}
                >
                  <option value="" disabled>
                    Selecione...
                  </option>
                  {ORGANIZERS.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                  <option value="Outros">Outros</option>
                </select>
              </div>

              {form.invitedBy === "Outros" && (
                <div>
                  <label
                    className="block text-sm font-bold mb-1"
                    style={{ color: "#7b4f2e" }}
                  >
                    Nome de quem te convidou *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nome completo"
                    value={form.otherName}
                    onChange={(e) =>
                      setForm({ ...form, otherName: e.target.value })
                    }
                    className="w-full rounded-xl border-2 px-4 py-3 text-sm outline-none transition"
                    style={{ borderColor: "#f5c518", background: "#fef9ec" }}
                  />
                </div>
              )}

              {error && (
                <p
                  className="text-sm text-center font-medium"
                  style={{ color: "#c0392b" }}
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl py-4 font-bold text-white text-lg uppercase tracking-wide transition-all"
                style={{
                  background: loading
                    ? "#ccc"
                    : "linear-gradient(135deg, #c0392b, #e8830a)",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontFamily: "var(--font-josefin), sans-serif",
                }}
              >
                {loading ? "Enviando..." : "🎉 Confirmar Interesse"}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Footer bandeirolas */}
      <div
        className="w-full overflow-hidden rotate-180"
        style={{ lineHeight: 0 }}
      >
        <Bandeirolas />
      </div>
    </main>
  );
}
