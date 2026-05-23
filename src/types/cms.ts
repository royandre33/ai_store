// Shared CMS-aware product type (mirrors Prisma shape)
export interface CmsVariant {
  id: number;
  label: string;
  price: number;
  order: number;
  productId: string;
}

export interface CmsThumbnail {
  id: number;
  url: string;
  order: number;
  productId: string;
}

export interface CmsProduct {
  id: string;
  name: string;
  slug: string;
  category: string;
  badge: string | null;
  description: string;
  order: number;
  sold: number;
  rating: number;
  thumbnails: CmsThumbnail[];
  variants: CmsVariant[];
}

export interface CmsPaymentStep {
  id: number;
  order: number;
  text: string;
  paymentMethodId: string;
}

export interface CmsPaymentMethod {
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
  steps: CmsPaymentStep[];
}

export interface CmsSiteSettings {
  id: number;
  siteName: string;
  logoUrl: string | null;
  footerTagline: string;
  adminWhatsapp: string;
}

export interface CmsHeroContent {
  id: number;
  eyebrow: string;
  headline1: string;
  headline2: string;
  headline3: string;
  subcopy: string;
  alurText: string;
  ctaLabel: string;
}

export interface CmsSpecCell {
  id: number;
  order: number;
  value: string;
  unit: string;
  label: string;
  note: string;
}
