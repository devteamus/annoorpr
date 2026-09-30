// /names-of-allah — আল্লাহর ৯৯ নাম (সার্ভার-রেন্ডার্ড, indexable)
import type { Metadata } from "next";
import { makeFeaturePage } from "@/lib/feature-page";
import { NamesOfAllahView } from "@/components/app/names-of-allah-view";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://annoor.xyz";

const { Page, metadata: pageMetadata } = makeFeaturePage(
  {
    path: "/names-of-allah",
    title: "আল্লাহর ৯৯ নাম (আসমাউল হুসনা) — অর্থ ও অডিও সহ",
    heading: "আল্লাহর ৯৯ নাম — আসমাউল হুসনা",
    description:
      "আল্লাহর সর্বোচ্চ নাম ও ৯৯টি সুন্দর নাম (আসমাউল হুসনা) — প্রতিটি নামের বাংলা অর্থ ও অডিও সহ। শুনে শিখুন ও মুখস্থ করুন।",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "আল্লাহর ৯৯ নাম (আসমাউল হুসনা)",
      inLanguage: "bn",
      url: `${BASE_URL}/names-of-allah`,
      publisher: { "@type": "Organization", name: "আন-নূর", url: BASE_URL },
    },
  },
  NamesOfAllahView
);

export default Page;
export const metadata: Metadata = pageMetadata;
