// /sitemap-categories.xml — ক্যাটাগরি সাইটম্যাপ
// ব্লগ ক্যাটাগরি (DB) + দুআ ক্যাটাগরি (কোড-ডিফাইন্ড)
import { db } from "@/lib/db";
import { buildUrlSet, xmlResponse, type SitemapUrl } from "@/lib/sitemap-xml";
import { categories } from "@/lib/dua-data";

export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://annoor.xyz";

export async function GET() {
  const now = new Date();
  const urls: SitemapUrl[] = [];

  // দুআ ক্যাটাগরি — /after-prayer, /rizq, /forgiveness, /daily-duas
  for (const cat of categories) {
    urls.push({
      loc: `${BASE_URL}/${cat.id}`,
      lastmod: now,
      changefreq: "weekly",
      priority: 0.9,
    });
  }

  // ব্লগ ক্যাটাগরি — /blog?category={slug}
  try {
    const blogCats = await db.blogCategory.findMany({
      where: {
        blogs: {
          some: {
            published: true,
            OR: [{ scheduledAt: null }, { scheduledAt: { lte: now } }],
          },
        },
      },
      select: { slug: true },
      orderBy: { name: "asc" },
    });
    for (const c of blogCats) {
      urls.push({
        loc: `${BASE_URL}/blog?category=${encodeURIComponent(c.slug)}`,
        lastmod: now,
        changefreq: "daily",
        priority: 0.7,
      });
    }
  } catch {
    // DB unreachable — দুআ ক্যাটাগরিগুলো অন্তত থাকুক
  }

  return xmlResponse(buildUrlSet(urls));
}
