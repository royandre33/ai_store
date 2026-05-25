"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { CmsPaymentMethod } from "@/types/cms";
import { useSettings } from "@/hooks/use-settings";

export function FooterSection() {
  const { settings } = useSettings();
  const [paymentMethods, setPaymentMethods] = useState<CmsPaymentMethod[]>([]);

  useEffect(() => {
    fetch("/api/cms/payments")
      .then((r) => r.json())
      .then(setPaymentMethods);
  }, []);

  const siteName = settings?.siteName ?? "AI Store";
  const footerTagline =
    settings?.footerTagline ??
    "Premium AI Tools Terpercaya · Proses Cepat · Support Ramah";
  const logoUrl = settings?.logoUrl ?? null;

  return (
    <footer className="border-t border-border bg-background px-6 py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt={siteName}
              className="h-6 w-auto object-contain"
            />
          ) : (
            <span className="font-condensed text-sm uppercase tracking-[0.12em] text-foreground">
              {siteName}
            </span>
          )}
          <p className="text-xs font-light text-muted-foreground">
            {footerTagline}
          </p>
          <p className="text-xs font-light text-muted-foreground">
            © {new Date().getFullYear()} {siteName}. All rights reserved.
          </p>
        </div>

        <div
          className="flex flex-wrap items-center justify-center gap-3 text-muted-foreground"
          aria-label="Metode pembayaran"
        >
          {paymentMethods.length === 0 ? (
            <div className="flex gap-3 animate-pulse">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-6 w-12 bg-muted rounded-sm" />
              ))}
            </div>
          ) : (
            paymentMethods.map((pm) => (
              <Image
                key={pm.id}
                alt={pm.label}
                className="h-6 w-auto object-contain"
                height={24}
                src={pm.logoSrc}
                unoptimized
                width={96}
              />
            ))
          )}
        </div>
      </div>
    </footer>
  );
}
