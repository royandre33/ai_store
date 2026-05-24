"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, Star } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import toast from "react-hot-toast";
import type { Product } from "@/types/product";

interface ProductDetailModalProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductDetailModal({
  product,
  open,
  onOpenChange,
}: ProductDetailModalProps) {
  const [imgIndex, setImgIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState("center center");
  const { addItem, items, openCartToCheckout } = useCartStore();
  const [adminWa, setAdminWa] = useState("6289530571642");

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const touchEndY = useRef<number | null>(null);
  const hasSwiped = useRef<boolean>(false);

  useEffect(() => {
    fetch("/api/cms/settings")
      .then((r) => r.json())
      .then((data) => { if (data?.adminWhatsapp) setAdminWa(data.adminWhatsapp); });
  }, []);

  if (!product) return null;

  const handleClose = (v: boolean) => {
    if (!v) {
      setSelectedVariant(null);
      setImgIndex(0);
      setIsZoomed(false);
    }
    onOpenChange(v);
  };

  const handleAddToCart = () => {
    if (selectedVariant === null) return;
    const variant = product.variants[selectedVariant];
    const alreadyInCart = items.find(
      (i) => i.productId === product.id && i.variantLabel === variant.label,
    );
    if (alreadyInCart) {
      toast("Produk sudah ada di keranjang", { icon: "🛒" });
      return;
    }
    addItem({
      productId: product.id,
      productName: product.name,
      variantLabel: variant.label,
      price: variant.price,
    });
    toast.success(`${product.name} ditambahkan ke keranjang`);
    handleClose(false);
  };

  const handleDirectCheckout = () => {
    if (selectedVariant === null) return;
    const variant = product.variants[selectedVariant];
    const alreadyInCart = items.find(
      (i) => i.productId === product.id && i.variantLabel === variant.label,
    );
    if (!alreadyInCart) {
      addItem({
        productId: product.id,
        productName: product.name,
        variantLabel: variant.label,
        price: variant.price,
      });
    }
    handleClose(false);
    openCartToCheckout();
  };

  const getWhatsAppUrl = () => {
    if (selectedVariant === null) return null;
    const variant = product.variants[selectedVariant];
    const message = `Halo, saya ingin menanyakan produk ${product.name} - variant ${variant.label}.`;
    return `https://wa.me/${adminWa}?text=${encodeURIComponent(message)}`;
  };

  const prevImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsZoomed(false);
    setImgIndex(
      (i) => (i - 1 + product.thumbnails.length) % product.thumbnails.length,
    );
  };
  
  const nextImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsZoomed(false);
    setImgIndex((i) => (i + 1) % product.thumbnails.length);
  };

  const updateZoomOrigin = (
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
  ) => {
    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();

    let clientX = 0;
    let clientY = 0;

    if ("touches" in e) {
      if (e.touches.length === 0) return;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;

    setZoomOrigin(`${x}% ${y}%`);
  };

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (hasSwiped.current) {
      hasSwiped.current = false;
      return;
    }
    if (isZoomed) {
      setIsZoomed(false);
    } else {
      updateZoomOrigin(e);
      setIsZoomed(true);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;
    updateZoomOrigin(e);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (isZoomed || product.thumbnails.length <= 1) return;
    const touch = e.touches[0];
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
    touchEndX.current = touch.clientX;
    touchEndY.current = touch.clientY;
    hasSwiped.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (isZoomed) {
      updateZoomOrigin(e);
      return;
    }
    if (product.thumbnails.length <= 1) return;
    const touch = e.touches[0];
    touchEndX.current = touch.clientX;
    touchEndY.current = touch.clientY;
  };

  const handleTouchEnd = () => {
    if (isZoomed || product.thumbnails.length <= 1) return;
    if (
      touchStartX.current === null ||
      touchStartY.current === null ||
      touchEndX.current === null ||
      touchEndY.current === null
    ) {
      return;
    }

    const diffX = touchStartX.current - touchEndX.current;
    const diffY = touchStartY.current - touchEndY.current;

    // Minimum distance of 50px for swiping and primary horizontal direction
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
      hasSwiped.current = true;
      if (diffX > 0) {
        // Swiped left -> next image
        setImgIndex((i) => (i + 1) % product.thumbnails.length);
      } else {
        // Swiped right -> prev image
        setImgIndex(
          (i) => (i - 1 + product.thumbnails.length) % product.thumbnails.length,
        );
      }
    }

    // Reset touch variables
    touchStartX.current = null;
    touchStartY.current = null;
    touchEndX.current = null;
    touchEndY.current = null;
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={handleClose}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className='fixed inset-0 z-50 bg-black/80 data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0' />
        <DialogPrimitive.Content
          className='fixed left-0 top-0 z-50 w-full h-dvh border-0 bg-card duration-200 data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 translate-x-0 translate-y-0 sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-2xl sm:h-auto sm:max-h-[calc(100dvh-2rem)] sm:border sm:border-border flex flex-col overflow-hidden shadow-2xl'
          aria-describedby={undefined}
        >
          <DialogPrimitive.Title className='sr-only'>
            {product.name}
          </DialogPrimitive.Title>

          {/* AI brand stripe at top */}
          <div className='ai-stripe w-full shrink-0' />

          {/* Close button (sticky, fixed at top-right relative to DialogContent) */}
          <DialogPrimitive.Close className='absolute right-4 top-[calc(1rem+env(safe-area-inset-top))] sm:top-4 z-50 rounded-full bg-black/40 p-2 text-white hover:bg-black/60 backdrop-blur-sm sm:bg-transparent sm:text-muted-foreground sm:hover:text-foreground sm:hover:bg-transparent transition-colors focus:outline-none'>
            <X className='h-4 w-4' />
            <span className='sr-only'>Close</span>
          </DialogPrimitive.Close>

          {/* Scrollable contents */}
          <div className='flex-1 overflow-y-auto min-h-0'>
            <div className='grid sm:grid-cols-2'>
            {/* Left — thumbnail gallery */}
            <div className='flex flex-col gap-2 bg-muted/10'>
              {/* Main Image Slider */}
              <div
                className={cn(
                  "relative aspect-square w-full overflow-hidden bg-muted sm:aspect-auto sm:flex-1 sm:h-0 select-none touch-pan-y",
                  isZoomed ? "cursor-zoom-out" : "cursor-zoom-in",
                )}
                onClick={handleImageClick}
                onMouseMove={handleMouseMove}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div
                  className='flex h-full w-full transition-transform duration-300 ease-out'
                  style={{
                    transform: `translateX(-${imgIndex * 100}%)`,
                  }}
                >
                  {product.thumbnails.map((thumb, idx) => (
                    <div key={idx} className='relative h-full w-full shrink-0'>
                      <Image
                        src={thumb}
                        alt={`${product.name} ${idx + 1}`}
                        fill
                        className='object-contain transition-transform duration-200 pointer-events-none'
                        style={idx === imgIndex ? {
                          transform: isZoomed ? "scale(2.2)" : "scale(1)",
                          transformOrigin: zoomOrigin,
                        } : undefined}
                        sizes='400px'
                      />
                    </div>
                  ))}
                </div>
                {!isZoomed && product.thumbnails.length > 1 && (
                  <>
                    <button
                      onClick={prevImg}
                      className='absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 p-1.5 text-white hover:bg-black/80 z-10'
                      aria-label='Sebelumnya'
                    >
                      <ChevronLeft className='h-4 w-4' />
                    </button>
                    <button
                      onClick={nextImg}
                      className='absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 p-1.5 text-white hover:bg-black/80 z-10'
                      aria-label='Berikutnya'
                    >
                      <ChevronRight className='h-4 w-4' />
                    </button>
                  </>
                )}
                {product.badge && (
                  <div className='absolute left-0 top-0 pointer-events-none z-10'>
                    <span className='bg-(--accent) px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white'>
                      {product.badge}
                    </span>
                  </div>
                )}
              </div>

              {/* Small Thumbnails Row */}
              {product.thumbnails.length > 1 && (
                <div className='flex gap-2 px-6 pb-2 pt-1 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] sm:px-4'>
                  {product.thumbnails.map((thumb, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsZoomed(false);
                        setImgIndex(idx);
                      }}
                      className={cn(
                        "relative h-12 w-12 shrink-0 overflow-hidden border bg-card transition-all sm:h-14 sm:w-14",
                        idx === imgIndex
                          ? "border-primary ring-1 ring-primary"
                          : "border-border hover:border-foreground/50",
                      )}
                    >
                      <Image
                        src={thumb}
                        alt={`${product.name} thumbnail ${idx + 1}`}
                        fill
                        className='object-contain p-1'
                        sizes='60px'
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right — details */}
            <div className='flex flex-col p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:pb-6'>
              <div className='flex items-start justify-between gap-2'>
                <div>
                  <p className='mb-1 text-[10px] font-bold uppercase tracking-[0.15em] text-(--accent)'>
                    {product.category.replace("-", " ")}
                  </p>
                  <h2 className='font-condensed text-2xl uppercase leading-tight text-foreground'>
                    {product.name}
                  </h2>
                  <div className='mt-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground'>
                    <span className='flex items-center gap-1'>
                      <Star className='h-3 w-3 fill-amber-400 text-amber-400' />
                      {product.rating}
                    </span>
                    <span>•</span>
                    <span>{product.sold} Terjual</span>
                  </div>
                </div>
                {/* Spacer to prevent title text from overlapping with the floating close button */}
                <div className='w-8 h-8 shrink-0 sm:block hidden' />
              </div>

              <div className='my-4 h-px bg-border' />

              <p className='text-sm font-light leading-relaxed text-muted-foreground'>
                {product.description}
              </p>

              <div className='my-4 h-px bg-border' />

              {/* Variant selector */}
              <p className='mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-foreground'>
                Pilih Paket
              </p>
              <div className='flex flex-wrap gap-2'>
                {product.variants.map((v, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedVariant(i)}
                    className={cn(
                      "border px-3 py-2 text-left text-xs transition-colors",
                      selectedVariant === i
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-transparent text-foreground hover:border-primary",
                    )}
                  >
                    <span className='block font-semibold uppercase tracking-wider'>
                      {v.label}
                    </span>
                    <span className='font-light text-inherit opacity-70'>
                      Rp {v.price.toLocaleString("id-ID")}
                    </span>
                  </button>
                ))}
              </div>

              {/* CTA buttons */}
              <div className='mt-6 flex flex-col gap-2'>
                <button
                  className='w-full border border-primary bg-primary py-3 text-xs font-bold uppercase tracking-[0.15em] text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-30'
                  disabled={selectedVariant === null}
                  onClick={handleDirectCheckout}
                >
                  Checkout Langsung
                </button>
                <button
                  className='w-full border border-border bg-transparent py-3 text-xs font-bold uppercase tracking-[0.15em] text-foreground transition-colors hover:border-foreground disabled:cursor-not-allowed disabled:opacity-30'
                  disabled={selectedVariant === null}
                  onClick={handleAddToCart}
                >
                  Tambah ke Keranjang
                </button>
                <a
                  href={getWhatsAppUrl() ?? undefined}
                  target='_blank'
                  rel='noopener noreferrer'
                  aria-disabled={selectedVariant === null}
                  className={cn(
                    "block w-full border border-border bg-transparent py-3 text-center text-xs font-bold uppercase tracking-[0.15em] text-foreground transition-colors hover:border-foreground",
                    selectedVariant === null && "pointer-events-none opacity-30",
                  )}
                >
                  Tanya Admin
                </a>
              </div>
            </div>
          </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
