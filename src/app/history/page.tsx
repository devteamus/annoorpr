// /history — আমলের ইতিহাস (ব্যক্তিগত ডেটা, noindex — তাই সাইটম্যাপেও নেই)
import type { Metadata } from "next";
import { makeFeaturePage } from "@/lib/feature-page";
import { HistoryView } from "@/components/app/history-view";

const { Page, metadata: pageMetadata } = makeFeaturePage(
  {
    path: "/history",
    title: "আমলের ইতিহাস — দুআ ও তসবিহের হিসাব",
    heading: "আমলের ইতিহাস",
    description:
      "তারিখ অনুযায়ী আপনার দুআ ও তসবিহের সম্পূর্ণ হিসাব — ব্রাউজারেই নিরাপদে সংরক্ষিত।",
    noindex: true,
  },
  HistoryView
);

export default Page;
export const metadata: Metadata = pageMetadata;
