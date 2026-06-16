"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

const ORGANIZERS = ["Lucas", "Aline", "Vitor", "Joao Lima", "JP Carregal", "Vanessa", "Marcio"];
const emptyForm = { name: "", contact: "", invitedBy: "", otherName: "" };

function maskPhone(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

interface Registration {
  id: number;
  name: string;
  contact: string;
  invitedBy: string;
  paymentConfirmed: boolean;
  amountPaid: number | null;
  addedByAdmin: boolean;
  createdAt: string;
}

// ─── helpers ────────────────────────────────────────────────────────────────

function fmt(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function paymentStatus(r: Registration, ticketPrice: number): "pending" | "paid" | "partial" {
  if (!r.paymentConfirmed) return "pending";
  if (ticketPrice > 0 && r.amountPaid !== null && r.amountPaid < ticketPrice) return "partial";
  return "paid";
}

// ─── PaymentTag ──────────────────────────────────────────────────────────────

function PaymentTag({ status, amountPaid }: { status: "pending" | "paid" | "partial"; amountPaid: number | null }) {
  const styles = {
    pending: { bg: "#fff3e0", color: "#e65100", border: "#ffcc80", label: "⏳ Pendente" },
    paid:    { bg: "#e8f5e9", color: "#2e7d32", border: "#a5d6a7", label: "✅ Pago" },
    partial: { bg: "#fff8e1", color: "#f57f17", border: "#ffe082", label: "⚠️ Parcial" },
  }[status];

  return (
    <div className="flex flex-col items-start gap-0.5">
      <span
        className="text-xs px-2.5 py-0.5 rounded-full font-bold whitespace-nowrap"
        style={{ background: styles.bg, color: styles.color, border: `1px solid ${styles.border}` }}
      >
        {styles.label}
      </span>
      {amountPaid !== null && status !== "pending" && (
        <span className="text-xs pl-1" style={{ color: "#999" }}>{fmt(amountPaid)}</span>
      )}
    </div>
  );
}

// ─── PaymentModal ────────────────────────────────────────────────────────────

function PaymentModal({ name, ticketPrice, onConfirm, onCancel }: {
  name: string; ticketPrice: number;
  onConfirm: (amount: number) => void; onCancel: () => void;
}) {
  const [value, setValue] = useState(ticketPrice > 0 ? String(ticketPrice) : "");
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = parseFloat(value.replace(",", "."));
    if (!isNaN(n) && n >= 0) onConfirm(n);
  };
  return (
    <Overlay onClose={onCancel} zIndex={60}>
      <h3 className="text-lg font-bold mb-1" style={{ color: "#1a1a2e" }}>Confirmar Pagamento</h3>
      <p className="text-sm mb-4" style={{ color: "#666" }}>{name}</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-xs font-bold mb-1" style={{ color: "#555" }}>Valor recebido (R$)</label>
          <input
            type="number" step="0.01" min="0" required autoFocus
            value={value} onChange={(e) => setValue(e.target.value)}
            className="w-full border-2 rounded-xl px-4 py-3 text-lg font-bold outline-none"
            style={{ borderColor: "#27ae60", color: "#1a1a2e" }} placeholder="0,00"
          />
          {ticketPrice > 0 && (
            <p className="text-xs mt-1" style={{ color: "#888" }}>Valor do ingresso: {fmt(ticketPrice)}</p>
          )}
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={onCancel} className="flex-1 rounded-xl py-3 font-semibold text-sm" style={{ background: "#f0f0f0", color: "#555" }}>Cancelar</button>
          <button type="submit" className="flex-1 rounded-xl py-3 font-bold text-white text-sm" style={{ background: "#27ae60" }}>Confirmar</button>
        </div>
      </form>
    </Overlay>
  );
}

// ─── DeleteModal ─────────────────────────────────────────────────────────────

function DeleteModal({ reg, onConfirm, onCancel }: {
  reg: Registration; onConfirm: () => void; onCancel: () => void;
}) {
  const hasPaid = reg.paymentConfirmed && reg.amountPaid !== null && reg.amountPaid > 0;
  return (
    <Overlay onClose={onCancel} zIndex={60}>
      <h3 className="text-lg font-bold mb-2" style={{ color: "#c0392b" }}>Remover cadastro?</h3>
      <p className="text-sm mb-3" style={{ color: "#555" }}>
        Você está prestes a remover <strong>{reg.name}</strong>. Esta ação não pode ser desfeita.
      </p>
      {hasPaid && (
        <div className="rounded-xl px-4 py-3 mb-4 flex items-center gap-2" style={{ background: "#fff3cd", border: "2px solid #ffc107" }}>
          <span className="text-xl">⚠️</span>
          <p className="text-sm font-bold" style={{ color: "#856404" }}>
            Atenção: esta pessoa pagou {fmt(reg.amountPaid!)}
          </p>
        </div>
      )}
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 rounded-xl py-3 font-semibold text-sm" style={{ background: "#f0f0f0", color: "#555" }}>Cancelar</button>
        <button onClick={onConfirm} className="flex-1 rounded-xl py-3 font-bold text-white text-sm" style={{ background: "#c0392b" }}>Sim, remover</button>
      </div>
    </Overlay>
  );
}

// ─── DetailModal ──────────────────────────────────────────────────────────────

function DetailModal({ reg, ticketPrice, onClose, onTogglePayment, onOpenPayment, onDelete, onSave }: {
  reg: Registration; ticketPrice: number; onClose: () => void;
  onTogglePayment: () => void; onOpenPayment: () => void; onDelete: () => void;
  onSave: (data: { name: string; contact: string; invitedBy: string }) => Promise<void>;
}) {
  const status = paymentStatus(reg, ticketPrice);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: reg.name, contact: reg.contact, invitedBy: reg.invitedBy.startsWith("Outros:") ? "Outros" : reg.invitedBy, otherName: reg.invitedBy.startsWith("Outros:") ? reg.invitedBy.replace(/^Outros:\s*/, "") : "" });
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const waPhone = "55" + reg.contact.replace(/\D/g, "");
  const waUrl = `https://wa.me/${waPhone}`;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError("");
    if (!editForm.name.trim() || !editForm.contact.trim() || !editForm.invitedBy) {
      setEditError("Preencha todos os campos."); return;
    }
    if (editForm.invitedBy === "Outros" && !editForm.otherName.trim()) {
      setEditError("Informe o nome de quem convidou."); return;
    }
    const invitedBy = editForm.invitedBy === "Outros" ? `Outros: ${editForm.otherName.trim()}` : editForm.invitedBy;
    setSaving(true);
    await onSave({ name: editForm.name.trim(), contact: editForm.contact.trim(), invitedBy });
    setSaving(false);
    setEditing(false);
  };

  const inputCls = "w-full border-2 rounded-lg px-3 py-2 text-sm outline-none";
  const inputSty = { borderColor: "#e0e0e0", color: "#333" };

  return (
    <Overlay onClose={onClose} maxWidth="max-w-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold" style={{ color: "#1a1a2e" }}>
          {editing ? "Editar cadastro" : "Detalhes do convidado"}
        </h3>
        <button onClick={onClose} className="text-xl font-bold" style={{ color: "#aaa" }}>✕</button>
      </div>

      {editing ? (
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold mb-1 uppercase tracking-wide" style={{ color: "#aaa" }}>Nome</label>
            <input autoFocus type="text" required className={inputCls} style={inputSty}
              value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1 uppercase tracking-wide" style={{ color: "#aaa" }}>Contato</label>
            <input type="tel" required className={inputCls} style={inputSty} placeholder="(00) 00000-0000"
              value={editForm.contact} onChange={(e) => setEditForm({ ...editForm, contact: maskPhone(e.target.value) })} />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1 uppercase tracking-wide" style={{ color: "#aaa" }}>Quem convidou</label>
            <select required className={inputCls} style={inputSty}
              value={editForm.invitedBy} onChange={(e) => setEditForm({ ...editForm, invitedBy: e.target.value, otherName: "" })}>
              <option value="" disabled>Selecione...</option>
              {ORGANIZERS.map((n) => <option key={n} value={n}>{n}</option>)}
              <option value="Outros">Outros</option>
            </select>
          </div>
          {editForm.invitedBy === "Outros" && (
            <div>
              <label className="block text-xs font-bold mb-1 uppercase tracking-wide" style={{ color: "#aaa" }}>Nome de quem convidou</label>
              <input type="text" required className={inputCls} style={inputSty}
                value={editForm.otherName} onChange={(e) => setEditForm({ ...editForm, otherName: e.target.value })} />
            </div>
          )}
          {editError && <p className="text-sm text-center" style={{ color: "#c0392b" }}>{editError}</p>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => { setEditing(false); setEditError(""); }}
              className="flex-1 rounded-xl py-2.5 font-semibold text-sm" style={{ background: "#f0f0f0", color: "#555" }}>
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 rounded-xl py-2.5 font-bold text-white text-sm"
              style={{ background: saving ? "#ccc" : "#2980b9" }}>
              {saving ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <Row label="Nome" value={reg.name} big />
            </div>
            <button onClick={() => setEditing(true)} title="Editar"
              className="mt-1 flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0"
              style={{ background: "#f0f4f8", color: "#555" }}>
              ✏️ Editar
            </button>
          </div>
          <Row label="Contato" value={
            <div className="flex items-center gap-2">
              <span>{reg.contact}</span>
              <a href={waUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-bold"
                style={{ background: "#e8f5e9", color: "#2e7d32", border: "1px solid #a5d6a7", textDecoration: "none" }}>
                💬 WhatsApp
              </a>
            </div>
          } />
          <Row label="Quem convidou" value={reg.invitedBy} />
          <Row label="Cadastro em" value={formatDate(reg.createdAt)} />
          <Row label="Origem" value={
            <span className="text-xs px-2 py-1 rounded-full font-semibold"
              style={reg.addedByAdmin ? { background: "#e3f2fd", color: "#1565c0" } : { background: "#f3e5f5", color: "#6a1b9a" }}>
              {reg.addedByAdmin ? "Admin" : "Site"}
            </span>
          } />
          <div className="pt-1 border-t" style={{ borderColor: "#f0f0f0" }}>
            <p className="text-xs font-bold mb-2" style={{ color: "#888" }}>PAGAMENTO</p>
            <div className="flex items-center gap-3 flex-wrap">
              <PaymentTag status={status} amountPaid={reg.amountPaid} />
              {status === "pending" ? (
                <button onClick={onOpenPayment} className="text-sm px-4 py-1.5 rounded-lg font-bold text-white" style={{ background: "#27ae60" }}>
                  Confirmar pagamento
                </button>
              ) : (
                <button onClick={onTogglePayment} className="text-sm px-4 py-1.5 rounded-lg font-semibold" style={{ background: "#ffebee", color: "#c62828" }}>
                  Desfazer pagamento
                </button>
              )}
            </div>
          </div>
          <div className="pt-2 border-t" style={{ borderColor: "#f0f0f0" }}>
            <button onClick={onDelete}
              className="w-full rounded-xl py-2.5 font-semibold text-sm flex items-center justify-center gap-2"
              style={{ background: "#ffebee", color: "#c62828", border: "1px solid #ef9a9a" }}>
              🗑️ Remover cadastro
            </button>
          </div>
        </div>
      )}
    </Overlay>
  );
}

function Row({ label, value, big }: { label: string; value: React.ReactNode; big?: boolean }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide mb-0.5" style={{ color: "#aaa" }}>{label}</p>
      {big
        ? <p className="text-lg font-bold" style={{ color: "#1a1a2e" }}>{value}</p>
        : <div className="text-sm" style={{ color: "#444" }}>{value}</div>}
    </div>
  );
}

// ─── Overlay wrapper ─────────────────────────────────────────────────────────

function Overlay({ children, onClose, maxWidth = "max-w-sm", zIndex = 50 }: {
  children: React.ReactNode; onClose: () => void; maxWidth?: string; zIndex?: number;
}) {
  return (
    <div className="fixed inset-0 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.55)", zIndex }} onClick={onClose}>
      <div className={`rounded-2xl shadow-2xl p-6 w-full ${maxWidth}`} style={{ background: "#fff" }} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

// ─── TicketPriceEditor ────────────────────────────────────────────────────────

function TicketPriceEditor({ price, onSave }: { price: number; onSave: (v: number) => Promise<void> }) {
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState("");
  const [saving, setSaving] = useState(false);

  const start = () => { setInput(price > 0 ? String(price) : ""); setEditing(true); };
  const cancel = () => setEditing(false);
  const save = async () => {
    const n = parseFloat(input.replace(",", "."));
    if (isNaN(n) || n < 0) return;
    setSaving(true);
    await onSave(n);
    setSaving(false);
    setEditing(false);
  };

  return (
    <div className="rounded-xl shadow px-5 py-4 flex items-center gap-4 flex-wrap" style={{ background: "#fff" }}>
      <span className="text-2xl">🎟️</span>
      <div className="flex flex-col">
        <span className="text-xs font-bold uppercase tracking-wide" style={{ color: "#aaa" }}>Valor do ingresso</span>
        <span className="text-sm font-semibold" style={{ color: "#888" }}>
          Atual: <strong style={{ color: price > 0 ? "#1a1a2e" : "#ccc" }}>{price > 0 ? fmt(price) : "não definido"}</strong>
        </span>
      </div>
      {!editing ? (
        <button onClick={start} title="Editar valor" className="ml-auto flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-semibold transition"
          style={{ background: "#f0f4f8", color: "#555" }}>
          ✏️ Editar
        </button>
      ) : (
        <div className="ml-auto flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold" style={{ color: "#888" }}>R$</span>
          <input
            type="number" step="0.01" min="0" autoFocus
            value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") cancel(); }}
            className="w-28 border-2 rounded-lg px-3 py-1.5 text-sm font-bold outline-none"
            style={{ borderColor: "#f5c518", color: "#333" }}
            placeholder="0,00"
          />
          <button onClick={save} disabled={saving} className="px-4 py-1.5 rounded-lg text-sm font-bold text-white" style={{ background: saving ? "#ccc" : "#27ae60" }}>
            {saving ? "..." : "Salvar"}
          </button>
          <button onClick={cancel} className="px-3 py-1.5 rounded-lg text-sm font-semibold" style={{ background: "#f0f0f0", color: "#666" }}>
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}

// ─── FilterBar ────────────────────────────────────────────────────────────────

type Filters = { name: string; invitedBy: string; origin: string; payment: string };

function FilterBar({ filters, onChange }: { filters: Filters; onChange: (f: Filters) => void }) {
  const set = (key: keyof Filters) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    onChange({ ...filters, [key]: e.target.value });

  const inputCls = "border rounded-lg px-3 py-2 text-sm outline-none w-full";
  const inputSty = { borderColor: "#ddd", color: "#333" };

  return (
    <div className="rounded-xl shadow p-4 flex flex-col gap-3" style={{ background: "#fff" }}>
      <div>
        <label className="block text-xs font-bold mb-1" style={{ color: "#888" }}>Nome</label>
        <input type="text" className={inputCls} style={inputSty} placeholder="Buscar nome..." value={filters.name} onChange={set("name")} />
      </div>
      <div className="grid grid-cols-3 gap-3">
      <div>
        <label className="block text-xs font-bold mb-1" style={{ color: "#888" }}>Quem convidou</label>
        <select className={inputCls} style={inputSty} value={filters.invitedBy} onChange={set("invitedBy")}>
          <option value="">Todos</option>
          {ORGANIZERS.map((n) => <option key={n} value={n}>{n}</option>)}
          <option value="Outros">Outros</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-bold mb-1" style={{ color: "#888" }}>Origem</label>
        <select className={inputCls} style={inputSty} value={filters.origin} onChange={set("origin")}>
          <option value="">Todas</option>
          <option value="site">Site</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-bold mb-1" style={{ color: "#888" }}>Pagamento</label>
        <select className={inputCls} style={inputSty} value={filters.payment} onChange={set("payment")}>
          <option value="">Todos</option>
          <option value="pending">⏳ Pendente</option>
          <option value="paid">✅ Pago</option>
          <option value="partial">⚠️ Parcial</option>
        </select>
      </div>
      </div>
    </div>
  );
}

// ─── AddForm ──────────────────────────────────────────────────────────────────

function AddForm({ onAdd }: { onAdd: (r: Registration) => void }) {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !form.contact.trim() || !form.invitedBy) { setError("Preencha todos os campos."); return; }
    if (form.invitedBy === "Outros" && !form.otherName.trim()) { setError("Informe o nome de quem convidou."); return; }
    const invitedBy = form.invitedBy === "Outros" ? `Outros: ${form.otherName.trim()}` : form.invitedBy;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/registrations", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name.trim(), contact: form.contact.trim(), invitedBy }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onAdd(data);
      setForm(emptyForm);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao adicionar.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full border rounded-lg px-3 py-2 text-sm outline-none";
  const inputSty = { borderColor: "#ddd" };

  return (
    <details className="rounded-xl shadow overflow-hidden" style={{ background: "#fff" }}>
      <summary className="px-5 py-4 font-bold cursor-pointer select-none" style={{ color: "#7b4f2e", background: "#fff8e7", borderBottom: "2px solid #f5c518" }}>
        ➕ Adicionar pessoa manualmente
      </summary>
      <form onSubmit={handleSubmit} className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold mb-1" style={{ color: "#555" }}>Nome *</label>
          <input type="text" required className={inputCls} style={inputSty} placeholder="Nome completo" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label className="block text-xs font-bold mb-1" style={{ color: "#555" }}>Contato *</label>
          <input type="tel" required className={inputCls} style={inputSty} placeholder="(00) 00000-0000" value={form.contact} onChange={(e) => setForm({ ...form, contact: maskPhone(e.target.value) })} />
        </div>
        <div>
          <label className="block text-xs font-bold mb-1" style={{ color: "#555" }}>Quem convidou *</label>
          <select required className={inputCls} style={inputSty} value={form.invitedBy} onChange={(e) => setForm({ ...form, invitedBy: e.target.value, otherName: "" })}>
            <option value="" disabled>Selecione...</option>
            {ORGANIZERS.map((n) => <option key={n} value={n}>{n}</option>)}
            <option value="Outros">Outros</option>
          </select>
        </div>
        {form.invitedBy === "Outros" && (
          <div>
            <label className="block text-xs font-bold mb-1" style={{ color: "#555" }}>Nome de quem convidou *</label>
            <input type="text" required className={inputCls} style={inputSty} placeholder="Nome completo" value={form.otherName} onChange={(e) => setForm({ ...form, otherName: e.target.value })} />
          </div>
        )}
        {error && <p className="sm:col-span-2 text-sm text-center" style={{ color: "#c0392b" }}>{error}</p>}
        <div className="sm:col-span-2">
          <button type="submit" disabled={loading} className="w-full rounded-lg py-3 font-bold text-white text-sm" style={{ background: loading ? "#ccc" : "#27ae60" }}>
            {loading ? "Adicionando..." : "Adicionar à lista"}
          </button>
        </div>
      </form>
    </details>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [ticketPrice, setTicketPrice] = useState(0);
  const [filters, setFilters] = useState<Filters>({ name: "", invitedBy: "", origin: "", payment: "" });

  // modals
  const [detail, setDetail] = useState<Registration | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Registration | null>(null);
  const [paymentTarget, setPaymentTarget] = useState<Registration | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      const [regRes, settRes] = await Promise.all([
        fetch("/api/admin/registrations"),
        fetch("/api/admin/settings"),
      ]);
      if (regRes.status === 401) { router.push("/admin"); return; }
      const [regs, sett] = await Promise.all([regRes.json(), settRes.json()]);
      setRegistrations(regs);
      setTicketPrice(sett.ticketPrice ?? 0);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // update a single registration in state
  const updateReg = (updated: Registration) => {
    setRegistrations((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    setDetail((d) => (d?.id === updated.id ? updated : d));
  };

  const handleConfirmPayment = async (id: number, amountPaid: number) => {
    setPaymentTarget(null);
    const res = await fetch(`/api/admin/registrations/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amountPaid }),
    });
    if (res.ok) updateReg(await res.json());
  };

  const handleUnconfirm = async (id: number) => {
    const res = await fetch(`/api/admin/registrations/${id}`, { method: "PATCH" });
    if (res.ok) updateReg(await res.json());
  };

  const handleDelete = async (id: number) => {
    setDeleteTarget(null);
    await fetch(`/api/admin/registrations/${id}`, { method: "DELETE" });
    setRegistrations((prev) => prev.filter((r) => r.id !== id));
    setDetail((d) => (d?.id === id ? null : d));
  };

  const handleEdit = async (id: number, data: { name: string; contact: string; invitedBy: string }) => {
    const res = await fetch(`/api/admin/registrations/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) updateReg(await res.json());
  };

  const saveTicketPrice = async (v: number) => {
    const res = await fetch("/api/admin/settings", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticketPrice: v }),
    });
    if (res.ok) setTicketPrice(v);
  };

  // filtered list
  const filtered = registrations.filter((r) => {
    if (filters.name && !r.name.toLowerCase().includes(filters.name.toLowerCase())) return false;
    if (filters.invitedBy) {
      if (filters.invitedBy === "Outros") { if (!r.invitedBy.startsWith("Outros")) return false; }
      else { if (r.invitedBy !== filters.invitedBy) return false; }
    }
    if (filters.origin === "site" && r.addedByAdmin) return false;
    if (filters.origin === "admin" && !r.addedByAdmin) return false;
    if (filters.payment) {
      const s = paymentStatus(r, ticketPrice);
      if (filters.payment !== s) return false;
    }
    return true;
  });

  const totalPaid = registrations.filter((r) => r.paymentConfirmed).length;
  const totalPartial = registrations.filter((r) => paymentStatus(r, ticketPrice) === "partial").length;
  const totalReceived = registrations.reduce((sum, r) => sum + (r.amountPaid ?? 0), 0);

  const formatDateShort = (iso: string) =>
    new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });

  return (
    <>
      {/* Modals */}
      {paymentTarget && (
        <PaymentModal
          name={paymentTarget.name} ticketPrice={ticketPrice}
          onConfirm={(amt) => handleConfirmPayment(paymentTarget.id, amt)}
          onCancel={() => setPaymentTarget(null)}
        />
      )}
      {deleteTarget && (
        <DeleteModal
          reg={deleteTarget}
          onConfirm={() => handleDelete(deleteTarget.id)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
      {detail && (
        <DetailModal
          reg={detail} ticketPrice={ticketPrice}
          onClose={() => setDetail(null)}
          onTogglePayment={() => handleUnconfirm(detail.id)}
          onOpenPayment={() => setPaymentTarget(detail)}
          onDelete={() => setDeleteTarget(detail)}
          onSave={(data) => handleEdit(detail.id, data)}
        />
      )}

      <main className="min-h-screen pb-12" style={{ background: "#f0f4f8" }}>
        {/* Header */}
        <header className="shadow-sm px-6 py-4 flex items-center justify-between" style={{ background: "#1a1a2e" }}>
          <div>
            <h1 className="text-xl font-bold text-white">🎪 Arraial dos Amigos</h1>
            <p className="text-xs" style={{ color: "#aaa" }}>Painel Administrativo</p>
          </div>
          <button onClick={() => { document.cookie = "admin_token=; Max-Age=0; path=/"; router.push("/admin"); }}
            className="text-sm px-4 py-2 rounded-lg font-semibold" style={{ background: "#c0392b", color: "#fff" }}>
            Sair
          </button>
        </header>

        <div className="max-w-4xl mx-auto px-4 pt-8 space-y-5">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Total", value: registrations.length, color: "#2980b9" },
              { label: "Confirmados", value: totalPaid, color: "#27ae60" },
              { label: "Parciais", value: totalPartial, color: "#f57f17" },
              { label: "Total recebido", value: fmt(totalReceived), color: "#8e44ad", text: true },
            ].map(({ label, value, color, text }) => (
              <div key={label} className="rounded-xl p-4 text-center shadow" style={{ background: "#fff" }}>
                <p className={text ? "text-base font-bold" : "text-3xl font-bold"} style={{ color }}>{value}</p>
                <p className="text-xs mt-1" style={{ color: "#888" }}>{label}</p>
              </div>
            ))}
          </div>

          {/* Ticket price */}
          <TicketPriceEditor price={ticketPrice} onSave={saveTicketPrice} />

          {/* Add form */}
          <AddForm onAdd={(r) => setRegistrations((prev) => [r, ...prev])} />

          {/* Filters */}
          <FilterBar filters={filters} onChange={setFilters} />

          {/* Table */}
          <div className="rounded-xl shadow overflow-hidden" style={{ background: "#fff" }}>
            <div className="px-5 py-3 border-b flex items-center justify-between" style={{ borderColor: "#eee" }}>
              <span className="font-bold text-sm" style={{ color: "#333" }}>
                {filtered.length} {filtered.length === 1 ? "pessoa" : "pessoas"}
                {filtered.length !== registrations.length && (
                  <span style={{ color: "#aaa" }}> de {registrations.length}</span>
                )}
              </span>
              {Object.values(filters).some(Boolean) && (
                <button onClick={() => setFilters({ name: "", invitedBy: "", origin: "", payment: "" })}
                  className="text-xs px-3 py-1 rounded-full" style={{ background: "#ffebee", color: "#c62828" }}>
                  Limpar filtros
                </button>
              )}
            </div>

            {loading ? (
              <div className="text-center py-12 text-gray-400">Carregando...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-gray-400">Nenhum cadastro encontrado.</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "#f8f8f8" }}>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "#555" }}>Nome</th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "#555" }}>Convidado por</th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "#555" }}>Data</th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "#555" }}>Pagamento</th>
                    <th className="px-4 py-3 text-center font-semibold" style={{ color: "#555" }}>🗑️</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, i) => {
                    const status = paymentStatus(r, ticketPrice);
                    return (
                      <tr
                        key={r.id}
                        onClick={() => setDetail(r)}
                        className="cursor-pointer transition-colors"
                        style={{ background: i % 2 === 0 ? "#fff" : "#fafafa", borderTop: "1px solid #f0f0f0" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f7ff")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = i % 2 === 0 ? "#fff" : "#fafafa")}
                      >
                        <td className="px-4 py-3 font-semibold" style={{ color: "#222" }}>{r.name}</td>
                        <td className="px-4 py-3 text-sm" style={{ color: "#666" }}>{r.invitedBy}</td>
                        <td className="px-4 py-3 text-xs" style={{ color: "#999" }}>{formatDateShort(r.createdAt)}</td>
                        <td className="px-4 py-3">
                          <PaymentTag status={status} amountPaid={r.amountPaid} />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={(e) => { e.stopPropagation(); setDeleteTarget(r); }}
                            className="text-lg transition-opacity hover:opacity-70"
                            title="Remover"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
