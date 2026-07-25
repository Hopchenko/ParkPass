import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { PARKS } from "@/data/parks";
import type { Locale } from "@/i18n/routing";
import { ParkDetail } from "@/components/ParkDetail";

type Params = Promise<{ locale: string; slug: string }>;

export function generateStaticParams() {
  return PARKS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const park = PARKS.find((p) => p.slug === slug);
  if (!park) return {};
  const loc: Locale = locale === "en" ? "en" : "sv";
  return {
    title: `${park.name} — Parkpass`,
    description: park.description[loc],
  };
}

export default async function ParkPage({ params }: { params: Params }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const park = PARKS.find((p) => p.slug === slug);
  if (!park) notFound();
  return <ParkDetail park={park} />;
}
