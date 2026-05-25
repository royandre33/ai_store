"use client";

import { useEffect, useState } from "react";
import AOS from "aos";
import type { CmsSpecCell } from "@/types/cms";
import { useSettings } from "@/hooks/use-settings";

function InfoSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-3 animate-pulse">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex flex-col justify-between bg-card p-8 min-h-[200px]">
          <div>
            <div className="h-10 w-24 bg-muted" />
            <div className="mt-2 h-3 w-16 bg-muted" />
          </div>

          <div className="mt-8">
            <div className="h-4 w-28 bg-muted" />
            <div className="mt-3 h-3 w-full bg-muted" />
            <div className="mt-2 h-3 w-2/3 bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function InfoSection() {
  const [specs, setSpecs] = useState<CmsSpecCell[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { settings } = useSettings();

  const siteName = settings?.siteName || "";

  useEffect(() => {
    fetch("/api/cms/specs")
      .then((r) => r.json())
      .then((data) => {
        setSpecs(data || []);
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
    <section id="cara-beli" className="bg-background">
      {/* AI brand stripe divider */}
      <div className="ai-stripe w-full" />

      <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
        {/* Section label */}
        <p
          data-aos="fade-up"
          className="mb-10 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground"
        >
          {siteName ? `Mengapa ${siteName}` : "Tentang Kami"}
        </p>

        {/* Spec cells */}
        {isLoading ? (
          <InfoSkeleton />
        ) : (
          <div className="grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-3">
            {specs.map((spec, i) => (
              <div
                key={spec.id}
                data-aos="fade-up"
                data-aos-delay={i * 100}
                className="flex flex-col justify-between bg-card p-8"
              >
                <div>
                  <p className="font-condensed text-[clamp(2rem,4vw,3rem)] leading-none text-foreground">
                    {spec.value}
                  </p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.15em] text-(--accent)">
                    {spec.unit}
                  </p>
                </div>

                <div className="mt-6">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-foreground">
                    {spec.label}
                  </p>
                  <p className="mt-2 text-sm font-light leading-relaxed text-muted-foreground">
                    {spec.note}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="h-px w-full bg-border" />
    </section>
  );
}
