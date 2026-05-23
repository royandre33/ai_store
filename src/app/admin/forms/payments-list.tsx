"use client";

import { useState, useEffect } from "react";
import { Loader2, Edit2, X, Save, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { ImageUpload } from "@/components/admin/image-upload";

type PaymentStep = { text: string; order: number };
type PaymentMethod = {
  id: string;
  label: string;
  type: string;
  typeLabel: string;
  logoSrc: string;
  order: number;
  accountHolder: string | null;
  accountNumber: string | null;
  accountType: string | null;
  bankFullName: string | null;
  phoneNumber: string | null;
  accountName: string | null;
  qrisImageSrc: string | null;
  steps: PaymentStep[];
};

export function PaymentsList() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<PaymentMethod>>({});
  const [steps, setSteps] = useState<string[]>([]);

  const fetchMethods = () => {
    setLoading(true);
    fetch("/api/cms/payments")
      .then((res) => res.json())
      .then((d) => {
        setMethods(d);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchMethods();
  }, []);

  const openEdit = (p: PaymentMethod) => {
    setEditingId(p.id);
    setFormData(p);
    setSteps(p.steps.map(s => s.text));
    setIsModalOpen(true);
  };

  const openCreate = () => {
    setEditingId(null);
    setFormData({
      label: "",
      type: "bank-transfer",
      typeLabel: "Transfer",
      logoSrc: "",
      order: methods.length,
      accountHolder: "",
      accountNumber: "",
      accountType: "",
      bankFullName: "",
      phoneNumber: "",
      accountName: "",
      qrisImageSrc: null,
    });
    setSteps([]);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const body = { ...formData, steps };
    try {
      const url = editingId ? `/api/cms/payments/${editingId}` : "/api/cms/payments";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        toast.success(editingId ? "Metode pembayaran disimpan" : "Metode pembayaran ditambahkan");
        setIsModalOpen(false);
        fetchMethods();
      } else {
        const errData = await res.json();
        toast.error(errData.error || "Gagal menyimpan data");
      }
    } catch {
      toast.error("Kesalahan jaringan");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editingId) return;
    if (!confirm("Apakah Anda yakin ingin menghapus metode pembayaran ini?")) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/cms/payments/${editingId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Metode pembayaran dihapus");
        setIsModalOpen(false);
        fetchMethods();
      } else {
        const errData = await res.json();
        toast.error(errData.error || "Gagal menghapus data");
      }
    } catch {
      toast.error("Kesalahan jaringan");
    } finally {
      setSaving(false);
    }
  };

  if (loading && methods.length === 0) return <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />;

  return (
    <div>
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="font-condensed text-2xl uppercase tracking-widest text-foreground">Metode Bayar</h2>
          <p className="mt-1 text-xs font-light text-muted-foreground uppercase tracking-widest">Ubah rekening & QRIS</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 border border-foreground bg-foreground px-4 py-2 text-xs font-bold uppercase tracking-wider text-background hover:bg-transparent hover:text-foreground transition-colors"
        >
          <Plus className="h-4 w-4" /> Tambah Metode
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {methods.map((p) => (
          <div key={p.id} className="border border-border p-4 flex gap-4 bg-card items-center">
            <div className="w-16 h-10 bg-white shrink-0 flex items-center justify-center p-2 border border-border">
              {p.logoSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.logoSrc} alt={p.label} className="max-w-full max-h-full object-contain" />
              ) : (
                <span className="text-[10px] text-muted-foreground font-bold">{p.label}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm text-foreground truncate">{p.label}</h3>
              <p className="text-xs text-muted-foreground truncate">{p.typeLabel}</p>
            </div>
            <button onClick={() => openEdit(p)} className="p-2 border border-border text-foreground hover:bg-border transition-colors"><Edit2 className="h-4 w-4" /></button>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-2xl bg-card border border-border flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-border p-4">
              <h3 className="font-condensed text-xl uppercase tracking-widest">
                {editingId ? `Edit ${formData.label}` : "Tambah Metode Pembayaran"}
              </h3>
              <button onClick={() => setIsModalOpen(false)}><X className="h-5 w-5" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* General Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.15em] text-foreground">Nama Metode (Label)</label>
                  <input type="text" required value={formData.label || ""} onChange={e => setFormData({...formData, label: e.target.value})} className="h-10 w-full border border-border bg-transparent px-3 text-xs text-foreground focus:border-foreground focus:outline-none" placeholder="Contoh: BCA, DANA, QRIS" />
                </div>
                <div>
                  <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.15em] text-foreground">Tipe Pembayaran</label>
                  <select 
                    value={formData.type || "bank-transfer"} 
                    onChange={e => {
                      const type = e.target.value;
                      let typeLabel = "Transfer";
                      if (type === "e-wallet") typeLabel = "E-Wallet";
                      if (type === "qris") typeLabel = "Scan QR";
                      setFormData({...formData, type, typeLabel});
                    }} 
                    className="h-10 w-full border border-border bg-card px-3 text-xs text-foreground focus:border-foreground focus:outline-none"
                  >
                    <option value="bank-transfer">Transfer Bank (bank-transfer)</option>
                    <option value="e-wallet">E-Wallet / Dompet Digital (e-wallet)</option>
                    <option value="qris">QRIS (qris)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.15em] text-foreground">Tipe Label (Sub-text)</label>
                  <input type="text" value={formData.typeLabel || ""} onChange={e => setFormData({...formData, typeLabel: e.target.value})} className="h-10 w-full border border-border bg-transparent px-3 text-xs text-foreground focus:border-foreground focus:outline-none" placeholder="Contoh: Transfer, E-Wallet, Scan QR" />
                </div>
                <div>
                  <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.15em] text-foreground">Urutan (Order)</label>
                  <input type="number" value={formData.order === undefined ? "" : formData.order} onChange={e => setFormData({...formData, order: Number(e.target.value)})} className="h-10 w-full border border-border bg-transparent px-3 text-xs text-foreground focus:border-foreground focus:outline-none" />
                </div>
              </div>

              {/* Logo Section */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-foreground">Logo Metode Pembayaran</label>
                <ImageUpload
                  label="Upload Logo"
                  currentUrl={formData.logoSrc ?? undefined}
                  onUpload={(url) => setFormData({ ...formData, logoSrc: url })}
                />
                <div>
                  <label className="mb-1 block text-[9px] uppercase tracking-[0.12em] text-muted-foreground">atau masukkan URL logo manual</label>
                  <input type="text" value={formData.logoSrc || ""} onChange={e => setFormData({...formData, logoSrc: e.target.value})} className="h-10 w-full border border-border bg-transparent px-3 text-xs text-foreground focus:border-foreground focus:outline-none" placeholder="https://..." />
                </div>
              </div>

              {/* Conditional Fields based on Type */}
              {formData.type === "bank-transfer" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.15em] text-foreground">Nama Bank Lengkap</label>
                      <input type="text" value={formData.bankFullName || ""} onChange={e => setFormData({...formData, bankFullName: e.target.value})} className="h-10 w-full border border-border bg-transparent px-3 text-xs text-foreground focus:border-foreground focus:outline-none" placeholder="Contoh: Bank Central Asia (BCA)" />
                    </div>
                    <div>
                      <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.15em] text-foreground">Tipe Rekening</label>
                      <input type="text" value={formData.accountType || ""} onChange={e => setFormData({...formData, accountType: e.target.value})} className="h-10 w-full border border-border bg-transparent px-3 text-xs text-foreground focus:border-foreground focus:outline-none" placeholder="Contoh: Tahapan, Tabungan" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.15em] text-foreground">Nomor Rekening</label>
                      <input type="text" value={formData.accountNumber || ""} onChange={e => setFormData({...formData, accountNumber: e.target.value})} className="h-10 w-full border border-border bg-transparent px-3 text-xs text-foreground focus:border-foreground focus:outline-none" />
                    </div>
                    <div>
                      <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.15em] text-foreground">Atas Nama</label>
                      <input type="text" value={formData.accountHolder || ""} onChange={e => setFormData({...formData, accountHolder: e.target.value})} className="h-10 w-full border border-border bg-transparent px-3 text-xs text-foreground focus:border-foreground focus:outline-none" />
                    </div>
                  </div>
                </>
              )}

              {formData.type === "e-wallet" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.15em] text-foreground">Nomor HP</label>
                    <input type="text" value={formData.phoneNumber || ""} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} className="h-10 w-full border border-border bg-transparent px-3 text-xs text-foreground focus:border-foreground focus:outline-none" />
                  </div>
                  <div>
                    <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.15em] text-foreground">Atas Nama</label>
                    <input type="text" value={formData.accountName || ""} onChange={e => setFormData({...formData, accountName: e.target.value})} className="h-10 w-full border border-border bg-transparent px-3 text-xs text-foreground focus:border-foreground focus:outline-none" />
                  </div>
                </div>
              )}

              {formData.type === "qris" && (
                <div className="space-y-3">
                  <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-foreground">
                    Gambar QRIS
                  </label>
                  <ImageUpload
                    label="Upload QRIS Image"
                    currentUrl={formData.qrisImageSrc ?? undefined}
                    onUpload={(url) => setFormData({ ...formData, qrisImageSrc: url })}
                  />
                  <div>
                    <label className="mb-1 block text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
                      atau masukkan URL manual
                    </label>
                    <input
                      type="text"
                      value={formData.qrisImageSrc || ""}
                      onChange={e => setFormData({ ...formData, qrisImageSrc: e.target.value })}
                      className="h-10 w-full border border-border bg-transparent px-3 text-xs text-foreground focus:border-foreground focus:outline-none"
                      placeholder="https://..."
                    />
                  </div>
                </div>
              )}

              {/* Steps */}
              {formData.type !== "qris" && (
                <div className="border border-border p-4">
                  <div className="flex justify-between items-center mb-4">
                    <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-foreground">Langkah Pembayaran</label>
                    <button type="button" onClick={() => setSteps([...steps, ""])} className="text-[10px] text-foreground border border-border px-2 py-1 transition-colors hover:bg-border">+ Tambah</button>
                  </div>
                  <div className="space-y-2">
                    {steps.map((s, i) => (
                      <div key={i} className="flex gap-2">
                        <span className="text-xs pt-2 text-muted-foreground">{i + 1}.</span>
                        <input type="text" value={s} onChange={e => {
                          const ns = [...steps];
                          ns[i] = e.target.value;
                          setSteps(ns);
                        }} className="h-8 flex-1 border border-border bg-transparent px-3 text-xs text-foreground focus:border-foreground focus:outline-none" required />
                        <button type="button" onClick={() => setSteps(steps.filter((_, idx) => idx !== i))} className="px-2 border border-border text-destructive transition-colors hover:bg-destructive/10">X</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-4 border-t border-border">
                {editingId && (
                  <button type="button" onClick={handleDelete} disabled={saving} className="flex-1 flex items-center justify-center gap-2 border border-destructive text-destructive py-3 text-xs font-bold uppercase tracking-widest hover:bg-destructive hover:text-white disabled:opacity-50 transition-colors">
                    <Trash2 className="h-4 w-4" /> Hapus
                  </button>
                )}
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 border border-border text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">Batal</button>
                <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-2 border border-foreground bg-foreground py-3 text-xs font-bold uppercase tracking-widest text-background hover:bg-transparent hover:text-foreground disabled:opacity-50 transition-colors">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
