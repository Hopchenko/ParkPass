import { setRequestLocale } from "next-intl/server";
import { Profile } from "@/components/Profile";

export default async function YouPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <Profile />;
}
