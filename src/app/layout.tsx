import type { Metadata } from "next";
import Script from "next/script";
import { Barlow, Barlow_Condensed, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/toaster";
import { AosInit } from "@/components/aos-init";
import { SpeedInsights } from "@vercel/speed-insights/next";

const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const BASE_URL = "https://ai-store.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "AI Store — Premium AI Tools Terpercaya",
    template: "%s | AI Store",
  },
  description:
    "Belanja produk digital AI terbaik. ChatGPT, Claude, Midjourney, dan lainnya. Proses cepat, support ramah.",
  keywords: [
    "AI tools",
    "ChatGPT",
    "Claude AI",
    "Midjourney",
    "produk digital",
    "langganan AI",
    "AI Store Indonesia",
  ],
  authors: [{ name: "AI Store" }],
  creator: "AI Store",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: BASE_URL,
    siteName: "AI Store",
    title: "AI Store — Premium AI Tools Terpercaya",
    description:
      "Belanja produk digital AI terbaik. ChatGPT, Claude, Midjourney, dan lainnya. Proses cepat, support ramah.",
    // OG image is auto-resolved from src/app/opengraph-image.tsx
    // To use a static image instead: add images: [{ url: "/og-image.png", width: 1200, height: 630 }]
    // and place the file in public/og-image.png
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Store — Premium AI Tools Terpercaya",
    description:
      "Belanja produk digital AI terbaik. ChatGPT, Claude, Midjourney, dan lainnya. Proses cepat, support ramah.",
    // Twitter image is auto-resolved from src/app/opengraph-image.tsx (same image)
    // To use a static image: add images: ["/og-image.png"]
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${BASE_URL}/#website`,
      url: BASE_URL,
      name: "AI Store",
      description: "Premium AI Tools Terpercaya",
      inLanguage: "id",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${BASE_URL}/?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      "@id": `${BASE_URL}/#organization`,
      name: "AI Store",
      url: BASE_URL,
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+6289530571642",
        contactType: "customer service",
        availableLanguage: "Indonesian",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${barlow.variable} ${barlowCondensed.variable} ${geistMono.variable} antialiased`}
      >
        {/* JSON-LD structured data */}
        <Script
          id="json-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <AosInit />
        {children}
        <Toaster />
        <SpeedInsights />
      </body>
    </html>
  );
}
