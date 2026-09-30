// /ruqyah — রুকইয়াহ (সার্ভার-রেন্ডার্ড, indexable)
import type { Metadata } from "next";
import { makeFeaturePage } from "@/lib/feature-page";
import { RuqyahView } from "@/components/app/ruqyah-view";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://annoor.xyz";

const { Page, metadata: pageMetadata } = makeFeaturePage(
  {
    path: "/ruqyah",
    title: "রুকইয়াহ — রিজিক, বদনজর ও যাদু থেকে চিকিৎসা",
    heading: "রুকইয়াহ — কুরআন-সুন্নাহভিত্তিক আত্মিক চিকিৎসা",
    description:
      "রিজিকের বাধা দূর করা, বদনজর, হিংসা ও কালো যাদু থেকে মুক্তির শক্তিশালী রুকইয়াহ — কুরআনের আয়াত, দুআ, গোসলের নিয়ম ও ভিডিও সহ।",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "রুকইয়াহ — রিজিক, বদনজর ও যাদু থেকে চিকিৎসা",
      inLanguage: "bn",
      url: `${BASE_URL}/ruqyah`,
      publisher: { "@type": "Organization", name: "আন-নূর", url: BASE_URL },
    },
  },
  RuqyahView
);

export default Page;
export const metadata: Metadata = pageMetadata;
