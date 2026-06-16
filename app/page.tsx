"use client";

import { useState, useEffect, useRef } from "react";

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

const BUNTING: Array<"flag-red" | "flag-yellow" | "flag-green" | "flag-blue"> =
  [
    "flag-red",
    "flag-yellow",
    "flag-green",
    "flag-blue",
    "flag-red",
    "flag-yellow",
    "flag-green",
  ];

const FEATURES = [
  {
    icon: "🎵",
    title: "Música ao Vivo",
    desc: "As melhores bandas e DJs tocando toda a noite",
  },
  {
    icon: "🔥",
    title: "Fogueira",
    desc: "Aquele clima aconchegante para conversa e resenha",
  },
  {
    icon: "🍖",
    title: "Open de Comidas Típicas",
    desc: "Caldos, canjica, cachorro quente e mesa mineira",
  },
  {
    icon: "🥤",
    title: "Bebidas Não Alcoólicas",
    desc: "Sucos, refrigerantes e água para todos",
  },
  {
    icon: "🎤",
    title: "Karaokê",
    desc: "Solte a voz e divirta-se cantando com os amigos",
  },
  {
    icon: "🎲",
    title: "Bingo com Prêmios",
    desc: "Muita diversão e prêmios incríveis para ganhar",
  },
  { icon: "🎪", title: "Brincadeiras Típicas", desc: "Não pode faltar!" },
  {
    icon: "🎉",
    title: "Muita Resenha",
    desc: "O clima perfeito para zoar e conversar fiado",
  },
];

function Stars() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;
    for (let i = 0; i < 100; i++) {
      const star = document.createElement("div");
      star.className = "star";
      star.style.left = Math.random() * 100 + "%";
      star.style.top = Math.random() * 100 + "%";
      star.style.opacity = String(Math.random() * 0.8 + 0.2);
      star.style.animation = `twinkle ${2 + Math.random() * 3}s infinite`;
      container.appendChild(star);
    }
    return () => {
      container.innerHTML = "";
    };
  }, []);

  return <div ref={ref} className="stars" />;
}

function Divider() {
  return (
    <div className="quadrilha-divider">
      <div className="divider-line" />
      <div className="divider-dot" />
      <div className="divider-dot" />
      <div className="divider-dot" />
      <div className="divider-line" />
    </div>
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
      style={{
        background: "linear-gradient(135deg, #0f1419 0%, #1a1f2e 100%)",
        minHeight: "100vh",
        color: "#fff",
      }}
    >
      <Stars />
      <div className="corner-decoration top-left">🌽</div>
      <div className="corner-decoration top-right">🌽</div>

      {/* Hero */}
      <div className="hero">
        <div className="hero-content">
          <div className="hero-date">25 DE JULHO DE 2026</div>
          <h1 className="hero-title">ARRAIAL DOS AMIGOS</h1>
          <h2 className="hero-subtitle">🎉 Festa Entre Amigos 🎉</h2>
          <p className="hero-cta-intro">Confirme sua presença agora!</p>
        </div>
      </div>

      {/* Formulário */}
      <div className="lp-section">
        <Divider />

        <div className="bunting">
          {BUNTING.map((color, i) => (
            <div key={i} className={`bunting-flag ${color}`} />
          ))}
        </div>

        <div className="form-section checkerboard-accent">
          <h3 className="form-title">Confirme seu interesse!</h3>
          <p className="form-subtitle">
            Deixe seus dados para receber as novidades do evento
          </p>

          {success ? (
            <div className="success-message">
              ✅ Obrigado! Você está na lista! Aguarde as novidades do evento.
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Seu Nome</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="Seu nome completo"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Telefone / WhatsApp</label>
                <input
                  className="form-input"
                  type="tel"
                  placeholder="(31) 99999-9999"
                  required
                  value={form.contact}
                  onChange={(e) =>
                    setForm({ ...form, contact: maskPhone(e.target.value) })
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">Foi convidado por quem?</label>
                <select
                  className="form-input"
                  required
                  value={form.invitedBy}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      invitedBy: e.target.value,
                      otherName: "",
                    })
                  }
                >
                  <option value="">Selecione quem te convidou...</option>
                  {ORGANIZERS.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                  <option value="Outros">Outros</option>
                </select>
              </div>

              {form.invitedBy === "Outros" && (
                <div className="form-group">
                  <label className="form-label">Nome de quem te convidou</label>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="Nome completo"
                    required
                    value={form.otherName}
                    onChange={(e) =>
                      setForm({ ...form, otherName: e.target.value })
                    }
                  />
                </div>
              )}

              {error && <p className="form-error">{error}</p>}

              <button className="form-button" type="submit" disabled={loading}>
                {loading ? "Enviando..." : "Confirmar nome na Lista!"}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Atrações */}
      <div className="lp-section">
        <h2 className="section-title">Por que você não pode faltar?</h2>

        <div className="features-grid">
          {FEATURES.map(({ icon, title, desc }) => (
            <div key={title} className="feature-card">
              <div className="feature-icon">{icon}</div>
              <h3 className="feature-title">{title}</h3>
              <p className="feature-desc">{desc}</p>
            </div>
          ))}
        </div>

        <Divider />
      </div>

      <footer className="lp-footer">
        <p>© 2026 Arraial dos Amigos. Todos os direitos reservados.</p>
      </footer>
    </main>
  );
}
