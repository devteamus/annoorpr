// /sitemap.xml — Sitemap Index
// স্ট্রাকচার: পোস্ট সাইটম্যাপ (১০ ফাইল × ১,০০০) → ক্যাটাগরি → পেজ
import { db } from "@/lib/db";
import { buildSitemapIndex, xmlResponse } from "@/lib/sitemap-xml";
import { POSTS_PER_FILE, MAX_POST_FILES, liveWhere } from "@/lib/post-sitemap";

export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://annoor.xyz";

export async function GET() {
  const now = new Date();

  // কতটি পোস্ট সাইটম্যাপ ফাইল দরকার — সর্বোচ্চ ১০টি (১০ × ১,০০০ = ১০,০০০ পোস্ট)
  // lastmod: আগে প্রতিবারই "এখন" দেওয়া হতো (সবসময় বদলায়) — Google তখন lastmod-কে
  // অবিশ্বাসযোগ্য ধরে উপেক্ষা করে। এখন সর্বশেষ পোস্ট-আপডেটের আসল সময়।
  let postCount = 0;
  let lastmod: Date = now;
  try {
    const [count, agg] = await Promise.all([
      db.blog.count({ where: liveWhere() }),
      db.blog.aggregate({ where: liveWhere(), _max: { updatedAt: true } }),
    ]);
    postCount = count;
    if (agg._max.updatedAt) lastmod = agg._max.updatedAt;
  } catch {
    // DB unreachable — অন্তত ১টি ফাইল রাখি (খালি হলেও valid XML)
  }
  const postFiles = Math.min(
    MAX_POST_FILES,
    Math.max(1, Math.ceil(postCount / POSTS_PER_FILE))
  );

  const sitemaps = [
    ...Array.from({ length: postFiles }, (_, i) => ({
      loc: `${BASE_URL}/sitemap-posts-${i + 1}.xml`,
      lastmod,
    })),
    { loc: `${BASE_URL}/sitemap-categories.xml`, lastmod },
    { loc: `${BASE_URL}/sitemap-pages.xml`, lastmod },
  ];

  return xmlResponse(buildSitemapIndex(sitemaps));
}
