import { setRequestLocale } from "next-intl/server";
import { PinBoard } from "@/components/PinBoard";

export default async function BoardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PinBoard />;
}
