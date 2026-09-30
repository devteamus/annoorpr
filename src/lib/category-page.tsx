// ক্যাটাগরি পেজ ফ্যাক্টরি — প্রতিটি দুআ ক্যাটাগরির জন্য সার্ভার-রেন্ডার্ড,
// SEO-complete পেজ বানায় (metadata + JSON-LD + canonical)।
// ব্যবহার: src/app/after-prayer/page.tsx তে
//   const { Page, metadata } = makeCategoryPage("after-prayer");
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ViewShell } from "@/components/app/view-shell";
import { CategoryView } from "@/components/app/category-view";
import { getCategoryById, getDuasByCategory } from "@/lib/dua-data";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://annoor.xyz";

const toBn = (n: number) => n.toLocaleString("bn-BD");

export function makeCategoryPage(categoryId: string) {
  const category = getCategoryById(categoryId);
  if (!category) throw new Error(`Unknown category: ${categoryId}`);
  const duasList = getDuasByCategory(categoryId);
  const url = `${BASE_URL}/${categoryId}`;

  const title = `${category.name} — আরবি, উচ্চারণ, অর্থ ও ফজিলতসহ`;
  const description = `${category.description}। ${toBn(duasList.length)}টি দুআ — প্রতিটিতে আরবি, বাংলা উচ্চারণ, অর্থ, ফজিলত ও হাদিসের রেফারেন্স সহ অনলাইন কাউন্টার।`;

  const metadata: Metadata = {
    title: category.name,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "bn_BD",
      url,
      siteName: "আন-নূর",
      title,
      description,
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-image.png"],
    },
    robots: { index: true, follow: true },
  };

  // ItemList JSON-LD — Google-তে rich result ও AI Overview-এর জন্য
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: category.name,
    description: category.description,
    inLanguage: "bn",
    numberOfItems: duasList.length,
    itemListElement: duasList.map((d, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: d.title,
      url: `${BASE_URL}/dua/${d.id}`,
    })),
  };

  function Page() {
    return (
      <ViewShell>
        <CategoryView categoryId={categoryId} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </ViewShell>
    );
  }

  return { Page, metadata };
}

// 404 fallback — অজানা slug গুলো নীরবে 404 দেয়
export function CategoryNotFound() {
  notFound();
}
