// /namaz — পাঁচ ওয়াক্ত নামাজ (সার্ভার-রেন্ডার্ড, indexable)
import type { Metadata } from "next";
import { makeFeaturePage } from "@/lib/feature-page";
import { NamazView } from "@/components/app/namaz-view";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://annoor.xyz";

const { Page, metadata: pageMetadata } = makeFeaturePage(
  {
    path: "/namaz",
    title: "পাঁচ ওয়াক্ত নামাজ পড়ার নিয়ম — ভিডিও সহ",
    heading: "পাঁচ ওয়াক্ত নামাজ শিক্ষা",
    description:
      "ফজর, যোহর, আসর, মাগরিব ও এশা — পাঁচ ওয়াক্ত ফরজ নামাজ পড়ার সম্পূর্ণ নিয়ম, নিয়ত, সূরা-দুআ ও প্রতিটি ওয়াক্তের আলাদা ভিডিও সহ।",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "পাঁচ ওয়াক্ত নামাজ পড়ার নিয়ম",
      inLanguage: "bn",
      url: `${BASE_URL}/namaz`,
      publisher: { "@type": "Organization", name: "আন-নূর", url: BASE_URL },
    },
  },
  NamazView
);

export default Page;
export const metadata: Metadata = pageMetadata;
