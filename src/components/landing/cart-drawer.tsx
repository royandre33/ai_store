"use client";

import { useState, useEffect, useRef, useCallback, forwardRef } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { toPng } from "html-to-image";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  ClipboardList,
  CreditCard,
  Download,
  FolderOpen,
  Loader2,
  MessageCircle,
  Receipt,
  Share2,
  Smartphone,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import type { CartItem, BuyerInfo } from "@/store/cart-store";
import { PAYMENT_METHODS } from "@/data/payment-methods";
import type { PaymentMethod } from "@/data/payment-methods";
import type { CmsPaymentMethod } from "@/types/cms";
import { useSettings } from "@/hooks/use-settings";
import toast from "react-hot-toast";

type CombinedPaymentMethod = PaymentMethod & Partial<Omit<CmsPaymentMethod, "steps">> & {
  steps?: Array<string | { text: string }>;
};


function formatRupiah(n: number) {
  return `Rp ${n.toLocaleString("id-ID")}`;
}

function DrawerHeader({ title }: { title: string }) {
  return (
    <div className='flex items-center justify-between border-b border-border px-5 py-4'>
      <p className='text-xs font-bold uppercase tracking-[0.15em] text-foreground'>
        {title}
      </p>
      <DialogPrimitive.Close
        className='p-1 text-muted-foreground transition-colors hover:text-foreground'
        aria-label='Tutup'
      >
        <X className='h-5 w-5' />
      </DialogPrimitive.Close>
    </div>
  );
}

function CartItemRow({ item }: { item: CartItem }) {
  const { removeItem } = useCartStore();
  return (
    <div className='flex items-start justify-between gap-3 border-b border-border py-4'>
      <div className='min-w-0 flex-1'>
        <p className='truncate text-sm font-semibold text-foreground'>
          {item.productName}
        </p>
        <p className='mt-0.5 text-xs font-light text-muted-foreground'>
          {item.variantLabel}
        </p>
        <p className='mt-1 text-xs font-semibold uppercase tracking-wider text-foreground'>
          {formatRupiah(item.price)}
        </p>
      </div>
      <button
        onClick={() => removeItem(item.productId, item.variantLabel)}
        className='shrink-0 p-1 text-muted-foreground transition-colors hover:text-destructive'
        aria-label='Hapus'
      >
        <Trash2 className='h-5 w-5' />
      </button>
    </div>
  );
}

// ── Payment detail components ─────────────────────────────────────────────────

function BankTransferDetail({ method }: { method: CombinedPaymentMethod }) {
  const d = method.bankDetails || method;
  const steps = Array.isArray(method.steps)
    ? method.steps.map((s: string | { text: string }) => typeof s === "string" ? s : s.text)
    : (method.bankDetails?.steps || []);

  return (
    <div className='space-y-4'>
      <div>
        <p className='mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-(--accent)'>
          <CreditCard className='h-4 w-4' /> {method.label}
        </p>
        <div className='space-y-1.5'>
          <div className='flex items-center justify-between'>
            <span className='text-[10px] font-light text-muted-foreground'>
              Bank
            </span>
            <span className='text-xs font-semibold text-foreground'>
              {d.bankFullName}
            </span>
          </div>
          <div className='flex items-center justify-between'>
            <span className='text-[10px] font-light text-muted-foreground'>
              No. Rekening
            </span>
            <span className='font-mono text-xs font-semibold text-foreground'>
              {d.accountNumber}
            </span>
          </div>
          <div className='flex items-center justify-between'>
            <span className='text-[10px] font-light text-muted-foreground'>
              Atas Nama
            </span>
            <span className='text-xs font-semibold text-foreground'>
              {d.accountHolder}
            </span>
          </div>
          <div className='flex items-center justify-between'>
            <span className='text-[10px] font-light text-muted-foreground'>
              Jenis
            </span>
            <span className='text-xs font-light text-foreground'>
              {d.accountType}
            </span>
          </div>
        </div>
      </div>
      {steps.length > 0 && (
        <div>
          <p className='mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-foreground'>
            <ClipboardList className='h-4 w-4' /> Cara Transfer:
          </p>
          <ol className='space-y-1.5'>
            {steps.map((step: string, i: number) => (
              <li
                key={i}
                className='flex gap-2 text-xs font-light text-muted-foreground'
              >
                <span className='shrink-0 font-semibold text-foreground'>
                  {i + 1}.
                </span>
                {step}
              </li>
            ))}
          </ol>
          <p className='mt-3 flex items-start gap-1.5 border-l-2 border-(--accent) pl-3 text-[10px] font-light text-muted-foreground'>
            <AlertTriangle className='mt-px h-4 w-4 shrink-0' />
            Transfer sesuai nominal exact, jangan lebih atau kurang.
          </p>
        </div>
      )}
    </div>
  );
}

function WalletDetail({ method }: { method: CombinedPaymentMethod }) {
  const d = method.walletDetails || method;
  const steps = Array.isArray(method.steps)
    ? method.steps.map((s: string | { text: string }) => typeof s === "string" ? s : s.text)
    : (method.walletDetails?.steps || []);

  return (
    <div className='space-y-4'>
      <div>
        <p className='mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-(--accent)'>
          <Smartphone className='h-4 w-4' /> {method.label}
        </p>
        <div className='space-y-1.5'>
          <div className='flex items-center justify-between'>
            <span className='text-[10px] font-light text-muted-foreground'>
              Nomor
            </span>
            <span className='font-mono text-xs font-semibold text-foreground'>
              {d.phoneNumber}
            </span>
          </div>
          <div className='flex items-center justify-between'>
            <span className='text-[10px] font-light text-muted-foreground'>
              Atas Nama
            </span>
            <span className='text-xs font-semibold text-foreground'>
              {d.accountName}
            </span>
          </div>
        </div>
      </div>
      {steps.length > 0 && (
        <div>
          <p className='mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-foreground'>
            <ClipboardList className='h-4 w-4' /> Cara Transfer:
          </p>
          <ol className='space-y-1.5'>
            {steps.map((step: string, i: number) => (
              <li
                key={i}
                className='flex gap-2 text-xs font-light text-muted-foreground'
              >
                <span className='shrink-0 font-semibold text-foreground'>
                  {i + 1}.
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

function QrisDetail({ qrisImageSrc }: { qrisImageSrc?: string | null }) {
  return (
    <div className='space-y-3 text-center'>
      {qrisImageSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={qrisImageSrc}
          alt='QRIS'
          className='mx-auto h-48 w-48 object-contain'
        />
      ) : (
        <div className='mx-auto flex h-48 w-48 items-center justify-center border border-dashed border-border bg-muted/50'>
          <p className='px-4 text-[10px] font-light text-muted-foreground'>
            QR Code belum tersedia.
            <br />
            Hubungi admin untuk QR terkini.
          </p>
        </div>
      )}
      <p className='text-[10px] font-light text-muted-foreground'>
        Scan menggunakan aplikasi bank atau e-wallet yang mendukung QRIS.
      </p>
    </div>
  );
}

function PaymentDetail({ method }: { method: PaymentMethod }) {
  if (method.type === "bank-transfer")
    return <BankTransferDetail method={method} />;
  if (method.type === "e-wallet") return <WalletDetail method={method} />;
  return <QrisDetail qrisImageSrc={method.qrisImageSrc} />;
}

// ── Form field helper ─────────────────────────────────────────────────────────

function FormField({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className='mb-4'>
      <label className='mb-1.5 block text-[10px] font-bold uppercase tracking-[0.15em] text-foreground'>
        {label} {required && <span className='text-(--accent)'>*</span>}
      </label>
      {children}
      {error && <p className='mt-1 text-[10px] text-destructive'>{error}</p>}
    </div>
  );
}

const INPUT_BASE =
  "h-10 w-full border bg-transparent px-3 text-xs text-foreground placeholder:font-light placeholder:text-muted-foreground focus:outline-none transition-colors";

// ── Checkout form view ────────────────────────────────────────────────────────

function CheckoutFormView() {
  const [name, setName] = useState("");
  const [wa, setWa] = useState("");
  const [email, setEmail] = useState("");
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [paymentMethods, setPaymentMethods] = useState<CombinedPaymentMethod[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(true);

  useEffect(() => {
    fetch("/api/cms/payments")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setPaymentMethods(data);
        } else {
          setPaymentMethods(PAYMENT_METHODS);
        }
        setLoadingPayments(false);
      })
      .catch((err) => {
        console.error("Failed to fetch payments:", err);
        setPaymentMethods(PAYMENT_METHODS);
        setLoadingPayments(false);
      });
  }, []);

  const { goToInvoice, backToCart, items } = useCartStore();
  const total = items.reduce((s, i) => s + i.price, 0);
  const selectedPayment =
    paymentMethods.find((p) => p.id === paymentId) ?? null;

  const handleFileSelect = useCallback((file: File) => {
    const allowed = ["image/jpeg", "image/png", "application/pdf"];
    if (!allowed.includes(file.type)) {
      setErrors((e) => ({
        ...e,
        proof: "Format tidak valid. Gunakan JPG, PNG, atau PDF.",
      }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((e) => ({ ...e, proof: "Ukuran file maksimal 5MB." }));
      return;
    }
    setProofFile(file);
    setErrors((e) => ({ ...e, proof: "" }));
  }, []);

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Nama wajib diisi";
    if (!wa.trim()) newErrors.wa = "Nomor WhatsApp wajib diisi";
    else if (!/^0[0-9]{8,12}$/.test(wa.trim()))
      newErrors.wa = "Nomor tidak valid — gunakan format 08xxxxxxxxxx (9–13 digit)";
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      newErrors.email = "Format email tidak valid";
    if (!paymentId) newErrors.payment = "Pilih metode pembayaran";
    if (errors.proof) {
      newErrors.proof = errors.proof;
    } else if (!proofFile) {
      newErrors.proof = "Bukti pembayaran wajib diupload";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      console.log(newErrors);
      toast.error(Object.values(newErrors)[0]);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const pm = paymentMethods.find((p) => p.id === paymentId)!;
      
      const orderData = {
        invoiceNumber: `INV-${Date.now()}`,
        customerName: name.trim(),
        customerWhatsapp: wa.trim(),
        customerEmail: email.trim(),
        totalAmount: total,
        paymentMethod: `${pm.label} ${pm.typeLabel}`,
        notes: notes.trim(),
        items: items.map(i => ({
          productId: i.productId,
          productName: i.productName,
          variantLabel: i.variantLabel,
          price: i.price,
        }))
      };

      const formData = new FormData();
      formData.append("proofFile", proofFile!);
      formData.append("orderData", JSON.stringify(orderData));

      const response = await fetch("/api/checkout/submit", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Gagal memproses pesanan");
      }

      const buyerInfo: BuyerInfo = {
        name: name.trim(),
        whatsapp: wa.trim(),
        email: email.trim(),
        paymentMethodId: paymentId!,
        paymentMethodLabel: `${pm.label} ${pm.typeLabel}`,
        notes: notes.trim(),
        proofFileName: proofFile!.name,
      };
      
      // Update store state manually with the generated invoice
      useCartStore.setState({ invoiceNumber: orderData.invoiceNumber });
      goToInvoice(buyerInfo);
    } catch (error) {
      console.error(error);
      setErrors({ proof: "Terjadi kesalahan saat memproses pesanan. Coba lagi." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='flex h-full flex-col'>
      <DrawerHeader title='Checkout' />
      <div className='ai-stripe w-full' />

      <div className='flex-1 overflow-y-auto px-5'>
        {/* Mini order summary */}
        <div className='border-b border-border py-4'>
          <p className='mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground'>
            Ringkasan Pesanan
          </p>
          <div className='space-y-1'>
            {items.map((item, i) => (
              <div key={i} className='flex justify-between text-xs'>
                <span className='truncate font-light text-muted-foreground mr-2'>
                  {item.productName}{" "}
                  <span className='text-[10px]'>({item.variantLabel})</span>
                </span>
                <span className='shrink-0 font-semibold text-foreground'>
                  {formatRupiah(item.price)}
                </span>
              </div>
            ))}
          </div>
          <div className='mt-3 flex items-center justify-between border-t border-border pt-3'>
            <span className='text-xs font-bold uppercase tracking-[0.12em] text-foreground'>
              Total
            </span>
            <span className='font-condensed text-lg text-foreground'>
              {formatRupiah(total)}
            </span>
          </div>
        </div>

        {/* Buyer info */}
        <div className='py-4'>
          <p className='mb-4 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground'>
            Informasi Pembeli
          </p>

          <FormField label='Nama Lengkap' required error={errors.name}>
            <input
              type='text'
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((er) => ({ ...er, name: "" }));
              }}
              placeholder='Nama lengkap Anda'
              className={cn(
                INPUT_BASE,
                errors.name
                  ? "border-destructive"
                  : "border-border focus:border-foreground",
              )}
            />
          </FormField>

          <FormField label='Nomor WhatsApp' required error={errors.wa}>
            <input
              type='tel'
              value={wa}
              onChange={(e) => {
                const numericValue = e.target.value.replace(/[^0-9]/g, "");
                setWa(numericValue);
                if (errors.wa) setErrors((er) => ({ ...er, wa: "" }));
              }}
              placeholder='08xxxxxxxxxx'
              className={cn(
                INPUT_BASE,
                errors.wa
                  ? "border-destructive"
                  : "border-border focus:border-foreground",
              )}
            />
            <p className='mt-1 text-[10px] font-light text-muted-foreground'>
              Notifikasi otomatis akan dikirim ke nomor ini
            </p>
          </FormField>

          <FormField label='Email (Opsional)' error={errors.email}>
            <input
              type='email'
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((er) => ({ ...er, email: "" }));
              }}
              placeholder='email@example.com'
              className={cn(
                INPUT_BASE,
                errors.email
                  ? "border-destructive"
                  : "border-border focus:border-foreground",
              )}
            />
          </FormField>
        </div>

        {/* Payment method */}
        <div className='border-t border-border py-4'>
          <p className='mb-1 text-[10px] font-bold uppercase tracking-[0.15em] text-foreground'>
            Metode Pembayaran <span className='text-(--accent)'>*</span>
          </p>
          {errors.payment && (
            <p className='mb-2 text-[10px] text-destructive'>
              {errors.payment}
            </p>
          )}

          <div className='mt-3 grid grid-cols-4 gap-1.5'>
            {loadingPayments ? (
              <div className="col-span-4 py-6 text-center">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
              </div>
            ) : (
              paymentMethods.map((pm) => (
                <button
                  key={pm.id}
                  onClick={() => {
                    setPaymentId(pm.id);
                    if (errors.payment)
                      setErrors((er) => ({ ...er, payment: "" }));
                  }}
                  className={cn(
                    "relative flex flex-col items-center gap-1 border p-2 transition-colors",
                    paymentId === pm.id
                      ? "border-foreground bg-foreground/5"
                      : "border-border hover:border-foreground/50",
                  )}
                >
                  {paymentId === pm.id && (
                    <span className='absolute right-0.5 top-0.5 flex h-3 w-3 items-center justify-center bg-(--accent)'>
                      <Check className='h-2 w-2 text-white' />
                    </span>
                  )}
                  {pm.logoSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={pm.logoSrc}
                      alt={pm.label}
                      className='h-7 w-auto max-w-[48px] object-contain'
                    />
                  ) : (
                    <div className="h-7 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-muted-foreground">{pm.label}</span>
                    </div>
                  )}
                  <span className='text-[9px] font-bold uppercase leading-none text-foreground'>
                    {pm.label}
                  </span>
                  <span className='text-[8px] font-light leading-none text-muted-foreground'>
                    {pm.typeLabel}
                  </span>
                </button>
              ))
            )}
          </div>

          {selectedPayment && (
            <div className='mt-4 border border-border p-4'>
              <PaymentDetail method={selectedPayment} />
            </div>
          )}
        </div>

        {/* Notes */}
        <div className='border-t border-border py-4'>
          <FormField label='Catatan Tambahan (Opsional)'>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder='Ada catatan khusus untuk pesanan ini?'
              rows={3}
              className='w-full resize-none border border-border bg-transparent p-3 text-xs font-light text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none'
            />
          </FormField>
        </div>

        {/* Proof upload */}
        <div className='border-t border-border pb-6 pt-4'>
          <p className='mb-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-foreground'>
            Upload Bukti Pembayaran <span className='text-(--accent)'>*</span>
          </p>
          {errors.proof && (
            <p className='mb-2 text-[10px] text-destructive'>{errors.proof}</p>
          )}

          <input
            ref={fileInputRef}
            type='file'
            accept='.jpg,.jpeg,.png,.pdf'
            className='hidden'
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelect(file);
            }}
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              const file = e.dataTransfer.files[0];
              if (file) handleFileSelect(file);
            }}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center gap-2 border border-dashed p-6 transition-colors",
              isDragOver
                ? "border-foreground bg-foreground/5"
                : proofFile
                  ? "border-(--accent) bg-(--accent)/5"
                  : errors.proof
                    ? "border-destructive"
                    : "border-border hover:border-foreground/50",
            )}
          >
            {proofFile ? (
              <>
                <Check className='h-6 w-6 text-(--accent)' />
                <p className='max-w-full truncate text-center text-xs font-semibold text-foreground'>
                  {proofFile.name}
                </p>
                <p className='text-[10px] font-light text-muted-foreground'>
                  Klik untuk ganti file
                </p>
              </>
            ) : (
              <>
                <Upload className='h-7 w-7 text-muted-foreground' />
                <p className='flex items-center gap-1.5 text-center text-xs font-semibold text-foreground'>
                  <FolderOpen className='h-4 w-4 shrink-0' />
                  Klik atau drag bukti pembayaran ke sini
                </p>
                <p className='text-center text-[10px] font-light text-muted-foreground'>
                  Format: JPG, PNG, PDF (Max: 5MB) — wajib upload
                  <br />
                  agar notifikasi masuk ke admin
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      <div className='border-t border-border px-5 py-5 space-y-2'>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className='flex w-full items-center justify-center gap-2 border border-primary bg-primary py-3 text-xs font-bold uppercase tracking-[0.15em] text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50'
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Memproses...
            </>
          ) : (
            "Buat Invoice"
          )}
        </button>
        <button
          onClick={backToCart}
          className='flex w-full items-center justify-center gap-2 bg-transparent py-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:text-foreground'
        >
          <ArrowLeft className='h-5 w-5' />
          Kembali ke Keranjang
        </button>
      </div>
    </div>
  );
}

// ── Cart view ─────────────────────────────────────────────────────────────────

function CartView() {
  const { items, goToCheckout } = useCartStore();
  const total = items.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className='flex h-full flex-col'>
      <DrawerHeader title='Detail Pesanan' />
      <div className='ai-stripe w-full' />

      <div className='flex-1 overflow-y-auto px-5'>
        {items.length === 0 ? (
          <div className='py-16 text-center'>
            <p className='font-condensed text-2xl uppercase text-muted-foreground'>
              Keranjang Kosong
            </p>
          </div>
        ) : (
          <div>
            <p className='flex items-center gap-1.5 py-3 text-[10px] font-light text-muted-foreground'>
              <Receipt className='h-4 w-4 shrink-0' />
              Checkout → isi form → invoice muncul → konfirmasi ke WhatsApp
              admin
            </p>
            <p className='mb-1 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground'>
              Ringkasan Pesanan
            </p>
            <p className='mb-2 text-[10px] font-light text-muted-foreground'>
              Total Item: {items.length} produk
            </p>
            {items.map((item, i) => (
              <CartItemRow
                key={`${item.productId}-${item.variantLabel}-${i}`}
                item={item}
              />
            ))}
          </div>
        )}
      </div>

      <div className='border-t border-border px-5 py-5'>
        <div className='mb-1 flex items-center justify-between text-xs'>
          <span className='font-light text-muted-foreground'>Subtotal</span>
          <span className='font-semibold text-foreground'>
            {formatRupiah(total)}
          </span>
        </div>
        <div className='mb-5 flex items-center justify-between'>
          <span className='text-xs font-bold uppercase tracking-[0.12em] text-foreground'>
            Total Bayar
          </span>
          <span className='font-condensed text-xl text-foreground'>
            {formatRupiah(total)}
          </span>
        </div>
        <button
          className='w-full border border-primary bg-primary py-3 text-xs font-bold uppercase tracking-[0.15em] text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-30'
          disabled={items.length === 0}
          onClick={goToCheckout}
        >
          Checkout
        </button>
      </div>
    </div>
  );
}

// ── Invoice share image component (hidden, for capture) ───────────────────────

interface InvoiceShareImageProps {
  invoiceNumber: string | null;
  invoiceTime: string | null;
  buyerName: string;
  buyerWhatsapp: string;
  buyerEmail?: string;
  paymentMethodLabel: string;
  items: Array<{
    productName: string;
    variantLabel: string;
    price: number;
  }>;
  total: number;
  siteName: string;
}

const InvoiceShareImage = forwardRef<HTMLDivElement, InvoiceShareImageProps>(
  function InvoiceShareImage(
    {
      invoiceNumber,
      invoiceTime,
      buyerName,
      buyerWhatsapp,
      buyerEmail,
      paymentMethodLabel,
      items,
      total,
      siteName,
    },
    ref,
  ) {
    return (
      <div
        ref={ref}
        className="w-[400px] bg-[#0a0a0a] p-6 text-white"
        style={{ fontFamily: "system-ui, sans-serif" }}
      >
        {/* Header */}
        <div className="mb-6 border-b border-white/20 pb-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">
            {siteName}
          </p>
          <p className="mt-2 text-xs font-light text-white/80">
            Premium AI Tool Subscription Store
          </p>
        </div>

        {/* Invoice Number */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/60">
              Invoice
            </p>
            <p className="font-mono text-sm font-semibold text-white">
              {invoiceNumber}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/60">
              Tanggal
            </p>
            <p className="text-xs font-light text-white">{invoiceTime}</p>
          </div>
        </div>

        {/* Buyer Info */}
        <div className="mb-5 border-y border-white/20 py-4">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-white/60">
            Pembeli
          </p>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-white/60">Nama</span>
              <span className="font-semibold text-white">{buyerName}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-white/60">WhatsApp</span>
              <span className="font-semibold text-white">{buyerWhatsapp}</span>
            </div>
            {buyerEmail && (
              <div className="flex justify-between text-xs">
                <span className="text-white/60">Email</span>
                <span className="font-semibold text-white">{buyerEmail}</span>
              </div>
            )}
            <div className="flex justify-between text-xs">
              <span className="text-white/60">Pembayaran</span>
              <span className="font-semibold text-white">
                {paymentMethodLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="mb-5">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-white/60">
            Detail Pesanan
          </p>
          <div className="space-y-2">
            {items.map((item, i) => (
              <div key={i} className="flex items-start justify-between text-xs">
                <div className="flex-1 pr-2">
                  <p className="font-semibold text-white">{item.productName}</p>
                  <p className="text-white/60">{item.variantLabel}</p>
                </div>
                <span className="shrink-0 font-semibold text-white">
                  {formatRupiah(item.price)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="mb-6 border-t border-white/20 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-white">
              Total Bayar
            </span>
            <span className="text-xl font-bold text-white">
              {formatRupiah(total)}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/20 pt-4 text-center">
          <p className="text-[10px] font-light text-white/50">
            Konfirmasi pembayaran via WhatsApp admin
          </p>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-white/70">
            {siteName} © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    );
  },
);

// ── Invoice view ──────────────────────────────────────────────────────────────

function InvoiceView({ adminWhatsapp, siteName }: { adminWhatsapp: string; siteName: string }) {
  const { items, invoiceNumber, invoiceTime, buyerInfo, backToCart } =
    useCartStore();
  const total = items.reduce((sum, item) => sum + item.price, 0);
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureError, setCaptureError] = useState<string | null>(null);

  const waMessage = encodeURIComponent(
    [
      `Halo Admin ${siteName}, saya sudah melakukan pembayaran dan ingin konfirmasi.`,
      ``,
      `Order ID: ${invoiceNumber}`,
      `Nama: ${buyerInfo?.name ?? "-"}`,
      ...items.flatMap((i) => [
        `Produk: ${i.productName}`,
        `Durasi: ${i.variantLabel}`,
      ]),
      `Total: ${formatRupiah(total)}`,
      `Metode: ${buyerInfo?.paymentMethodLabel ?? "-"}`,
      `Waktu: ${invoiceTime ?? "-"}`,
      ``,
      `Bukti pembayaran telah saya lampirkan via sistem website. Silakan diproses. Terima kasih.`,
    ].join("\n"),
  );

  const captureInvoice = useCallback(async () => {
    if (!invoiceRef.current) return;

    setIsCapturing(true);
    setCaptureError(null);

    try {
      const dataUrl = await toPng(invoiceRef.current, {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: "#0a0a0a",
      });

      // Convert data URL to blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], `invoice-${invoiceNumber}.png`, {
        type: "image/png",
      });

      // Check if Web Share API is available
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `Invoice ${invoiceNumber}`,
          text: `Invoice pembelian ${siteName} - ${invoiceNumber}`,
          files: [file],
        });
      } else {
        // Fallback: download the image
        const link = document.createElement("a");
        link.download = `invoice-${invoiceNumber}.png`;
        link.href = dataUrl;
        link.click();
      }
    } catch (err) {
      console.error("Failed to capture invoice:", err);
      setCaptureError(
        "Gagal menangkap invoice. Coba download sebagai gambar.",
      );
    } finally {
      setIsCapturing(false);
    }
  }, [invoiceNumber, siteName]);

  const downloadInvoice = useCallback(async () => {
    if (!invoiceRef.current) return;

    setIsCapturing(true);
    setCaptureError(null);

    try {
      const dataUrl = await toPng(invoiceRef.current, {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: "#0a0a0a",
      });

      const link = document.createElement("a");
      link.download = `invoice-${invoiceNumber}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to download invoice:", err);
      setCaptureError("Gagal mengunduh invoice. Coba lagi.");
    } finally {
      setIsCapturing(false);
    }
  }, [invoiceNumber]);

  return (
    <div className='flex h-full flex-col'>
      <DrawerHeader title='Invoice' />
      <div className='ai-stripe w-full' />

      <div className='flex-1 overflow-y-auto px-5 py-4'>
        <div className='mb-4 border border-border p-4'>
          <p className='text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground'>
            Nomor Invoice
          </p>
          <p className='mt-1 font-mono text-sm font-semibold text-foreground'>
            {invoiceNumber}
          </p>
        </div>

        {buyerInfo && (
          <div className='mb-4 border border-border p-4'>
            <p className='mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground'>
              Informasi Pembeli
            </p>
            <div className='space-y-1.5'>
              <div className='flex justify-between text-xs'>
                <span className='font-light text-muted-foreground'>Nama</span>
                <span className='font-semibold text-foreground'>
                  {buyerInfo.name}
                </span>
              </div>
              <div className='flex justify-between text-xs'>
                <span className='font-light text-muted-foreground'>
                  WhatsApp
                </span>
                <span className='font-semibold text-foreground'>
                  {buyerInfo.whatsapp}
                </span>
              </div>
              {buyerInfo.email && (
                <div className='flex justify-between text-xs'>
                  <span className='font-light text-muted-foreground'>
                    Email
                  </span>
                  <span className='font-semibold text-foreground'>
                    {buyerInfo.email}
                  </span>
                </div>
              )}
              <div className='flex justify-between text-xs'>
                <span className='font-light text-muted-foreground'>
                  Pembayaran
                </span>
                <span className='font-semibold text-foreground'>
                  {buyerInfo.paymentMethodLabel}
                </span>
              </div>
              {buyerInfo.notes && (
                <div className='flex justify-between gap-4 text-xs'>
                  <span className='shrink-0 font-light text-muted-foreground'>
                    Catatan
                  </span>
                  <span className='text-right font-light text-foreground'>
                    {buyerInfo.notes}
                  </span>
                </div>
              )}
              <div className='flex justify-between text-xs'>
                <span className='font-light text-muted-foreground'>Bukti</span>
                <span className='max-w-[140px] truncate text-right font-semibold text-(--accent)'>
                  {buyerInfo.proofFileName}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className='space-y-3'>
          {items.map((item, i) => (
            <div
              key={i}
              className='flex items-start justify-between gap-3 border-b border-border pb-3 text-sm'
            >
              <div>
                <p className='font-semibold text-foreground'>
                  {item.productName}
                </p>
                <p className='text-xs font-light text-muted-foreground'>
                  {item.variantLabel}
                </p>
              </div>
              <span className='shrink-0 text-xs font-semibold text-foreground'>
                {formatRupiah(item.price)}
              </span>
            </div>
          ))}
        </div>

        <div className='mt-4 flex items-center justify-between pt-2'>
          <span className='text-xs font-bold uppercase tracking-[0.12em] text-foreground'>
            Total Bayar
          </span>
          <span className='font-condensed text-xl text-foreground'>
            {formatRupiah(total)}
          </span>
        </div>

        {/* Capture/Share actions */}
        <div className='mt-6 space-y-3'>
          {captureError && (
            <p className='text-center text-[10px] text-destructive'>
              {captureError}
            </p>
          )}

          <div className='flex gap-2'>
            <button
              onClick={captureInvoice}
              disabled={isCapturing}
              className='flex flex-1 items-center justify-center gap-1.5 border border-(--accent) bg-transparent py-2.5 text-xs font-bold uppercase tracking-[0.12em] text-(--accent) transition-colors hover:bg-(--accent) hover:text-white disabled:cursor-not-allowed disabled:opacity-50'
            >
              {isCapturing ? (
                <Loader2 className='h-4 w-4 animate-spin' />
              ) : (
                <Share2 className='h-4 w-4' />
              )}
              Share
            </button>
            <button
              onClick={downloadInvoice}
              disabled={isCapturing}
              className='flex flex-1 items-center justify-center gap-1.5 border border-border bg-transparent py-2.5 text-xs font-bold uppercase tracking-[0.12em] text-foreground transition-colors hover:border-foreground disabled:cursor-not-allowed disabled:opacity-50'
            >
              {isCapturing ? (
                <Loader2 className='h-4 w-4 animate-spin' />
              ) : (
                <Download className='h-4 w-4' />
              )}
              Download
            </button>
          </div>

          <p className='text-center text-[10px] font-light text-muted-foreground'>
            Share invoice sebagai gambar ke WhatsApp atau simpan ke galeri
          </p>
        </div>
      </div>

      <div className='border-t border-border px-5 py-5 space-y-2'>
        <a
          href={`https://wa.me/${adminWhatsapp}?text=${waMessage}`}
          target='_blank'
          rel='noopener noreferrer'
          className='flex w-full items-center justify-center gap-2 border border-primary bg-primary py-3 text-xs font-bold uppercase tracking-[0.15em] text-primary-foreground transition-colors hover:bg-primary/90'
        >
          <MessageCircle className='h-5 w-5' />
          Konfirmasi via WhatsApp
        </a>
        <button
          className='flex w-full items-center justify-center gap-2 bg-transparent py-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:text-foreground'
          onClick={backToCart}
        >
          <ArrowLeft className='h-5 w-5' />
          Kembali ke Keranjang
        </button>
      </div>

      {/* Hidden invoice image for capture */}
      <div className='fixed left-[-9999px] top-[-9999px] opacity-0 pointer-events-none'>
        {buyerInfo && invoiceTime && (
          <InvoiceShareImage
            ref={invoiceRef}
            invoiceNumber={invoiceNumber}
            invoiceTime={invoiceTime}
            buyerName={buyerInfo.name}
            buyerWhatsapp={buyerInfo.whatsapp}
            buyerEmail={buyerInfo.email}
            paymentMethodLabel={buyerInfo.paymentMethodLabel}
            items={items}
            total={total}
            siteName={siteName}
          />
        )}
      </div>
    </div>
  );
}

// ── Root drawer ───────────────────────────────────────────────────────────────

export function CartDrawer() {
  const { isOpen, view, closeCart } = useCartStore();
  const { settings } = useSettings(isOpen);

  const adminWhatsapp = settings?.adminWhatsapp || "6289530571642";
  const siteName = settings?.siteName || "AI Store";

  return (
    <DialogPrimitive.Root
      open={isOpen}
      onOpenChange={(v) => {
        if (!v) closeCart();
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className='fixed inset-0 z-50 bg-black/70 data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0' />
        <DialogPrimitive.Content
          className='fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col border-l border-border bg-card duration-300 data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right'
          aria-describedby={undefined}
        >
          <DialogPrimitive.Title className='sr-only'>
            Keranjang Belanja
          </DialogPrimitive.Title>
          {view === "invoice" ? (
            <InvoiceView adminWhatsapp={adminWhatsapp} siteName={siteName} />
          ) : view === "checkout" ? (
            <CheckoutFormView />
          ) : (
            <CartView />
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
