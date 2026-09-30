// পোস্ট সাইটম্যাপ ফ্যাক্টরি — /sitemap-posts-{n}.xml (n = ১..১০, প্রতিটিতে ১,০০০ পোস্ট)
// প্রতিটি ফাইল app/sitemap-posts-{n}.xml/route.ts থেকে ব্যবহৃত হয়।
import { db } from "@/lib/db";
import {
  buildUrlSet,
  xmlResponse,
  type SitemapUrl,
} from "@/lib/sitemap-xml";

export const POSTS_PER_FILE = 1000;
export const MAX_POST_FILES = 10;

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://annoor.xyz";

// ⚠️ আগে এটা মডিউল-লেভেল const ছিল — `new Date()` সার্ভার চালু হওয়ার মুহূর্তে একবারই
// নির্ধারিত হতো। ফলে কন্টেইনার চালু হওয়ার পরে যে পোস্টের শিডিউল সময় আসত, সেগুলো
// সাইটম্যাপে কখনো ঢুকত না (রিস্টার্ট না হওয়া পর্যন্ত) → Google ইনডেক্সিং মিস।
// এখন প্রতি রিকোয়েস্টে নতুন করে বানানো হয়।
export function liveWhere() {
  return {
    published: true as const,
    OR: [{ scheduledAt: null }, { scheduledAt: { lte: new Date() } }],
  };
}

export function postSitemapHandler(fileNo: number) {
  return async function GET() {
    let urls: SitemapUrl[] = [];
    try {
      const blogs = await db.blog.findMany({
        where: liveWhere(),
        select: { slug: true, updatedAt: true, title: true, featureImage: true },
        orderBy: { createdAt: "desc" },
        skip: (fileNo - 1) * POSTS_PER_FILE,
        take: POSTS_PER_FILE,
      });
      urls = blogs.map((b) => ({
        loc: `${BASE_URL}/blog/${encodeURIComponent(b.slug)}`,
        lastmod: b.updatedAt,
        changefreq: "weekly" as const,
        priority: 0.8,
        ...(b.featureImage
          ? { image: { loc: b.featureImage, title: b.title } }
          : {}),
      }));
    } catch {
      // DB unreachable — খালি urlset ফেরত (valid XML, GSC এরর হবে না)
    }
    return xmlResponse(buildUrlSet(urls));
  };
}
