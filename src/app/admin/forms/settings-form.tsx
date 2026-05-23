"use client";

import { useState, useEffect } from "react";
import { Loader2, Save } from "lucide-react";
import toast from "react-hot-toast";
import { ImageUpload } from "@/components/admin/image-upload";

export function SettingsForm() {
  const [data, setData] = useState({
    siteName: "",
    logoUrl: "",
    footerTagline: "",
    adminWhatsapp: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/cms/settings")
      .then((res) => res.json())
      .then((d) => {
        if (d && !d.error) {
          setData({
            siteName: d.siteName ?? "",
            logoUrl: d.logoUrl ?? "",
            footerTagline: d.footerTagline ?? "",
            adminWhatsapp: d.adminWhatsapp ?? "",
          });
        }
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/cms/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          logoUrl: data.logoUrl || null,
        }),
      });
      if (res.ok) toast.success("Pengaturan berhasil disimpan");
      else toast.error("Gagal menyimpan pengaturan");
    } catch {
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />;

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <div>
        <h2 className="font-condensed text-2xl uppercase tracking-widest text-foreground">Pengaturan Situs</h2>
        <p className="mt-1 text-xs font-light text-muted-foreground uppercase tracking-[0.1em]">Konfigurasi Umum Website</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.15em] text-foreground">
            Nama Situs
          </label>
          <input
            type="text"
            value={data.siteName}
            onChange={(e) => setData({ ...data, siteName: e.target.value })}
            className="h-12 w-full border border-border bg-transparent px-4 text-sm text-foreground focus:border-foreground focus:outline-none"
            required
          />
        </div>

        {/* Logo Upload */}
        <div>
          <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.15em] text-foreground">
            Logo Situs
          </label>
          <p className="mb-3 text-[10px] text-muted-foreground">
            Upload logo untuk ditampilkan di navbar dan footer. Jika kosong, nama situs akan digunakan sebagai teks.
          </p>
          <ImageUpload
            label="Upload Logo"
            currentUrl={data.logoUrl || undefined}
            onUpload={(url) => setData({ ...data, logoUrl: url })}
          />
        </div>

        <div>
          <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.15em] text-foreground">
            Tagline Footer
          </label>
          <input
            type="text"
            value={data.footerTagline}
            onChange={(e) => setData({ ...data, footerTagline: e.target.value })}
            className="h-12 w-full border border-border bg-transparent px-4 text-sm text-foreground focus:border-foreground focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.15em] text-foreground">
            WhatsApp Admin (Mulai dari 62)
          </label>
          <input
            type="text"
            value={data.adminWhatsapp}
            onChange={(e) => setData({ ...data, adminWhatsapp: e.target.value })}
            className="h-12 w-full border border-border bg-transparent px-4 text-sm text-foreground focus:border-foreground focus:outline-none"
            required
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="flex items-center gap-2 border border-foreground bg-foreground px-6 py-3 text-xs font-bold uppercase tracking-[0.15em] text-background transition-colors hover:bg-transparent hover:text-foreground disabled:opacity-50"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Simpan
      </button>
    </form>
  );
}
