import { setRequestLocale } from "next-intl/server";
import { ParkList } from "@/components/ParkList";

export default async function ParksPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ParkList />;
}
