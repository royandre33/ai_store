"use client";

import { useEffect, useState } from "react";
import { CatalogClient } from "./catalog-client";
import AOS from "aos";
import type { CmsProduct } from "@/types/cms";
import { useSettings } from "@/hooks/use-settings";

function CatalogSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-px bg-border sm:grid-cols-3 animate-pulse">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex flex-col border border-border bg-card p-0">
          {/* Thumbnail skeleton */}
          <div className="relative aspect-video w-full bg-muted overflow-hidden" />
          {/* Content skeleton */}
          <div className="flex flex-1 flex-col p-5">
            {/* Category */}
            <div className="mb-3 h-2 w-20 bg-muted" />
            {/* Name */}
            <div className="mb-2 h-4 w-40 bg-muted" />
            <div className="mb-4 h-4 w-28 bg-muted" />
            {/* Rating */}
            <div className="mt-2 h-2.5 w-24 bg-muted" />
            {/* Price */}
            <div className="mt-auto pt-6">
              <div className="mb-2 h-2 w-16 bg-muted" />
              <div className="h-6 w-32 bg-muted" />
            </div>
            {/* CTA */}
            <div className="mt-4 border-t border-border pt-4 flex items-center gap-2">
              <div className="h-3 w-20 bg-muted" />
              <div className="h-3 w-4 bg-muted" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function CatalogSection() {
  const [products, setProducts] = useState<CmsProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { settings } = useSettings();

  const siteName = settings?.siteName || "";

  useEffect(() => {
    fetch("/api/cms/products")
      .then((r) => r.json())
      .then((data) => {
        setProducts(data || []);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (!isLoading) {
      AOS.refresh();
    }
  }, [isLoading]);

  return (
    <section id="katalog" className="bg-background py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section header */}
        <div
          data-aos="fade-up"
          className="mb-10 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-(--accent)">
              {siteName || "Katalog"}
            </p>
            <h2 className="font-condensed text-4xl uppercase text-primary sm:text-5xl">
              {siteName ? `Katalog ${siteName}` : "Katalog"}
            </h2>
          </div>
          <p className="max-w-xs text-sm font-light text-muted-foreground">
            Pilih produk, cek paket, masukkan ke keranjang, lalu checkout.
          </p>
        </div>

        {isLoading ? <CatalogSkeleton /> : <CatalogClient products={products} />}
      </div>
    </section>
  );
}
