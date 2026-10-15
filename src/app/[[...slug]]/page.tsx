import { getData } from "@/lib/data";
import Experience from "@/components/experience";
import { notFound } from "next/navigation";
export const dynamic = "force-dynamic";
export default async function Page({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug = [] } = await params;
  if (
    slug.length > 1 ||
    (slug.length === 1 && !["achievements", "profile"].includes(slug[0]))
  )
    notFound();
  return <Experience initial={await getData()} page={slug[0] || "home"} />;
}
