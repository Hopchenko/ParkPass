import { setRequestLocale } from "next-intl/server";
import { SwedenMap } from "@/components/SwedenMap";

export default async function MapPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <SwedenMap />;
}
