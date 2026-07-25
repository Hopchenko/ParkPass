import type { Metadata } from "next";
import { Caprasimo, Figtree } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { VisitedProvider } from "@/lib/visited";
import { TabBar } from "@/components/TabBar";
import "../globals.css";

const caprasimo = Caprasimo({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-caprasimo",
});

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return { title: t("title"), description: t("description") };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html lang={locale} className={`${caprasimo.variable} ${figtree.variable}`}>
      <body className="bg-surface font-body text-ink antialiased">
        <NextIntlClientProvider>
          <VisitedProvider>
            <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-ground shadow-lg">
              <main className="flex-1 pb-[84px]">{children}</main>
            </div>
            <TabBar />
          </VisitedProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
