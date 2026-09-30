// /sitemap-pages.xml — পেজ সাইটম্যাপ
// মূল স্ট্যাটিক পেজ + ফিচার পেজ + সব দুআ পেজ (/dua/{id})
import { buildUrlSet, xmlResponse, type SitemapUrl } from "@/lib/sitemap-xml";
import { duas } from "@/lib/dua-data";

export const dynamic = "force-static";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://annoor.xyz";

export function GET() {
  const now = new Date();
  const urls: SitemapUrl[] = [
    { loc: `${BASE_URL}/`, lastmod: now, changefreq: "daily", priority: 1.0 },
    { loc: `${BASE_URL}/blog`, lastmod: now, changefreq: "daily", priority: 0.9 },
    { loc: `${BASE_URL}/ruqyah`, lastmod: now, changefreq: "monthly", priority: 0.8 },
    { loc: `${BASE_URL}/namaz`, lastmod: now, changefreq: "monthly", priority: 0.8 },
    { loc: `${BASE_URL}/names-of-allah`, lastmod: now, changefreq: "monthly", priority: 0.8 },
    { loc: `${BASE_URL}/books`, lastmod: now, changefreq: "weekly", priority: 0.7 },
    { loc: `${BASE_URL}/contact`, lastmod: now, changefreq: "monthly", priority: 0.5 },
    { loc: `${BASE_URL}/privacy`, lastmod: now, changefreq: "yearly", priority: 0.3 },
    { loc: `${BASE_URL}/terms`, lastmod: now, changefreq: "yearly", priority: 0.3 },
  ];

  // প্রতিটি দুআর নিজস্ব পেজ — আরবি, উচ্চারণ, অর্থ, ফজিলতসহ
  for (const d of duas) {
    urls.push({
      loc: `${BASE_URL}/dua/${d.id}`,
      lastmod: now,
      changefreq: "weekly",
      priority: 0.7,
    });
  }

  // নোট: /history ব্যক্তিগত ডেটার পেজ (noindex) — সাইটম্যাপে নেই

  return xmlResponse(buildUrlSet(urls));
}
