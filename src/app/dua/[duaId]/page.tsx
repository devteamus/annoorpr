// /dua/[duaId] — প্রতিটি দুআর নিজস্ব indexable পেজ (কাউন্টার + পূর্ণ বিবরণ)
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ViewShell } from "@/components/app/view-shell";
import { CounterView } from "@/components/app/counter-view";
import { duas, getDuaById, getCategoryById } from "@/lib/dua-data";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://annoor.xyz";

// সব দুআ বিল্ড টাইমেই স্ট্যাটিক জেনারেট হয় — দ্রুত ও নির্ভরযোগ্য
export function generateStaticParams() {
  return duas.map((d) => ({ duaId: d.id }));
}
export const dynamicParams = false;

type Props = { params: Promise<{ duaId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { duaId } = await params;
  const dua = getDuaById(duaId);
  if (!dua) return { title: "দুআ পাওয়া যায়নি" };

  const url = `${BASE_URL}/dua/${dua.id}`;
  const description = `${dua.meaning} — বাংলা উচ্চারণ, অর্থ, ফজিলত ও হাদিসের রেফারেন্স সহ অনলাইন দুআ কাউন্টার।`;

  return {
    title: dua.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "bn_BD",
      url,
      siteName: "আন-নূর",
      title: dua.title,
      description,
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: dua.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: dua.title,
      description,
      images: ["/og-image.png"],
    },
    robots: { index: true, follow: true },
  };
}

export default async function DuaPage({ params }: Props) {
  const { duaId } = await params;
  const dua = getDuaById(duaId);
  if (!dua) notFound();

  const category = getCategoryById(dua.categoryId);
  const url = `${BASE_URL}/dua/${dua.id}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: dua.title,
    description: dua.meaning,
    inLanguage: "bn",
    articleSection: category?.name,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    publisher: {
      "@type": "Organization",
      name: "আন-নূর",
      url: BASE_URL,
      logo: { "@type": "ImageObject", url: `${BASE_URL}/icon.svg` },
    },
    ...(dua.reference ? { citation: dua.reference } : {}),
  };

  return (
    <ViewShell>
      <CounterView duaId={duaId} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </ViewShell>
  );
}
