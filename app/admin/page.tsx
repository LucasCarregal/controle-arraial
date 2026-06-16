"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push("/admin/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao entrar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4" style={{ background: "#1a1a2e" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🎪</div>
          <h1 className="text-2xl font-bold text-white">Área Administrativa</h1>
          <p className="text-sm mt-1" style={{ color: "#aaa" }}>
            Arraial dos Amigos
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl p-6 shadow-2xl flex flex-col gap-4"
          style={{ background: "#16213e" }}
        >
          <div>
            <label className="block text-sm font-semibold mb-1 text-white">Usuário</label>
            <input
              type="text"
              required
              autoComplete="username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none"
              style={{ background: "#0f3460", color: "#fff", border: "1px solid #e8830a" }}
              placeholder="usuário"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-white">Senha</label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none"
              style={{ background: "#0f3460", color: "#fff", border: "1px solid #e8830a" }}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-center" style={{ color: "#e74c3c" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="rounded-xl py-3 font-bold text-white transition-all"
            style={{
              background: loading ? "#555" : "linear-gradient(135deg, #e8830a, #c0392b)",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </main>
  );
}
