"use client";

import { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/cart-store";

const navLinks = [
  { label: "Beranda", href: "#hero" },
  { label: "Cara Beli", href: "#cara-beli" },
  { label: "Katalog", href: "#katalog" },
];

export function Navbar() {
  const { items, openCart } = useCartStore();
  const [siteName, setSiteName] = useState("AI STORE");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/cms/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data?.siteName) setSiteName(data.siteName);
        if (data?.logoUrl) setLogoUrl(data.logoUrl);
      });
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt={siteName}
            className="h-8 w-auto object-contain"
          />
        ) : (
          <span className="font-condensed text-xl tracking-[0.08em] text-foreground uppercase">
            {siteName}
          </span>
        )}

        {/* Desktop nav links */}
        <nav className="hidden gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <button
            onClick={openCart}
            className="relative flex h-10 items-center gap-2 border border-border bg-transparent px-4 text-xs font-semibold uppercase tracking-[0.12em] text-foreground transition-colors hover:border-foreground"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Keranjang</span>
            {items.length > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center bg-(--accent) text-[10px] font-bold text-white">
                {items.length}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
