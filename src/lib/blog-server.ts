// ব্লগের সব DB/cache-নির্ভর হেল্পার — এই ফাইল শুধু Server Component বা
// Route Handler (page.tsx / route.ts) থেকে ইমপোর্ট করুন, কখনো কোনো
// "use client" ফাইল থেকে না — এখানে `next/cache` (unstable_cache,
// revalidateTag) আছে, যেটা ক্লায়েন্ট বান্ডেলে পৌঁছালে Next.js build-এ
// hard error দেয় ("You're importing a component that needs
// 'revalidateTag'... not supported in the pages/ directory")।
//
// পিওর/ক্লায়েন্ট-সেফ ফাংশন (formatBengaliNumber ইত্যাদি) @/lib/blog-utils.ts-এ।
import { db } from "@/lib/db";
import { unstable_cache, revalidateTag } from "next/cache";
import {
  extractKeywords,
  slugify,
  stripHtml,
  type InterlinkTarget,
} from "@/lib/interlinking";
import { categorySlug } from "@/lib/blog-utils";

/* ---------- cached interlink target pool ----------
   আগে প্রতিটা ব্লগ-ভিউ-এ আলাদা করে ১০০টা পোস্টের পুরো content টেনে
   keyword-extraction চালানো হতো (DB I/O + ভারী regex/string প্রসেসিং,
   প্রতি রিকোয়েস্টে) — হাই-ট্রাফিকে এটাই সবচেয়ে বড় বটলনেক ছিল। এখন সাইটের
   সব পোস্টের জন্য এই একটাই পুল শেয়ার হয়, ১৫ মিনিট পরপর রিফ্রেশ হয় (অথবা
   নতুন পোস্ট পাবলিশ/এডিট/ডিলিটে সাথে সাথেই — নিচের invalidateBlogPool দেখুন)।
*/
const getInterlinkPool = unstable_cache(
  async () => {
    const others = await db.blog.findMany({
      where: {
        published: true,
        OR: [{ scheduledAt: null }, { scheduledAt: { lte: new Date() } }],
      },
      select: { id: true, title: true, slug: true, content: true },
      orderBy: { views: "desc" },
      take: 100,
    });
    return others.map((o) => ({
      id: o.id,
      title: o.title,
      slug: o.slug,
      keywords: extractKeywords(o.title, stripHtml(o.content)),
    }));
  },
  ["interlink-target-pool"],
  { revalidate: 900, tags: ["blog-content-pool"] }
);

// ব্লগ create/update/delete হলে এখান থেকে কল করুন।
// Next.js 16-এ revalidateTag-এর ২য় আর্গুমেন্ট বাধ্যতামূলক। "max" =
// stale-while-revalidate: পরের রিকোয়েস্ট পুরোনো পুলই পাবে, আর ব্যাকগ্রাউন্ডে
// নতুন পুল বানানো শুরু হবে (তার পরের রিকোয়েস্ট থেকে নতুন ডেটা) — interlink /
// related posts-এর জন্য এটুকু বিলম্ব ঠিক আছে, আর ১৫ মিনিট অপেক্ষার চেয়ে
// অনেক ভালো। (updateTag শুধু Server Action-এ চলে, Route Handler-এ না।)
export function invalidateBlogPool(): void {
  revalidateTag("blog-content-pool", "max");
}

/* ---------- unique slug ---------- */
export async function uniqueSlug(title: string, excludeId?: string): Promise<string> {
  const base = slugify(title);
  let slug = base;
  let n = 2;
  while (true) {
    const existing = await db.blog.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) break;
    slug = `${base}-${n}`;
    n++;
  }
  return slug;
}

/* ---------- find-or-create category by name (CSV-friendly) ---------- */
export async function findOrCreateCategoryByName(name: string) {
  const clean = name.trim();
  if (!clean) return null;
  const slug = categorySlug(clean);
  return db.blogCategory.upsert({
    where: { slug },
    update: {},
    create: { name: clean, slug },
  });
}

/* ---------- record a view + daily log ----------
   keepUpdatedAt: ভিউ-কাউন্ট বাড়ানো sitemap-এর lastmod নাড়াবে না —
   নাহলে প্রতিটি ভিউতে updatedAt বদলে যায় আর Search Console-এ ফালতু আপডেট দেখায়। */
export async function recordView(
  blogId: string,
  keepUpdatedAt?: Date
): Promise<void> {
  const now = new Date();
  const dateKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  await db.$transaction([
    db.blog.update({
      where: { id: blogId },
      data: {
        views: { increment: 1 },
        ...(keepUpdatedAt ? { updatedAt: keepUpdatedAt } : {}),
      },
    }),
    db.blogViewLog.upsert({
      where: { blogId_date: { blogId, date: dateKey } },
      update: { count: { increment: 1 } },
      create: { blogId, date: dateKey, count: 1 },
    }),
  ]);
}

/* ---------- related content ---------- */
type BlogWithCategory = Awaited<
  ReturnType<typeof db.blog.findMany<{ include: { category: true } }>>
>[number];

// unstable_cache ফলাফল JSON হিসেবে সেভ করে — ক্যাশ হিটে Date ফিল্ডগুলো
// স্ট্রিং হয়ে ফেরে, আর কলার `r.createdAt.toISOString()` চালালে ক্র্যাশ করত।
// তাই ক্যাশ থেকে পাওয়ার পর Date আবার Date বানিয়ে নিই।
function reviveBlog(b: BlogWithCategory): BlogWithCategory {
  return {
    ...b,
    createdAt: new Date(b.createdAt),
    updatedAt: new Date(b.updatedAt),
    scheduledAt: b.scheduledAt ? new Date(b.scheduledAt) : null,
    category: b.category
      ? { ...b.category, createdAt: new Date(b.category.createdAt) }
      : b.category,
  };
}

export async function getRelatedPosts(
  blogId: string,
  categoryId: string | null,
  limit = 4
): Promise<BlogWithCategory[]> {
  const liveWhere = {
    published: true as const,
    OR: [
      { scheduledAt: null },
      { scheduledAt: { lte: new Date() } },
    ],
  };
  // limit-এর চেয়ে কয়েকটা বেশি টেনে রাখি (cache-এ), যাতে কারেন্ট
  // পোস্টটাকে ফিল্টার করে বাদ দেওয়ার পরও যথেষ্ট বাকি থাকে — নাহলে প্রতিটা
  // পোস্টের জন্য আলাদা DB কল লাগত, cache-এর লাভই থাকত না
  const FETCH = limit + 6;
  const related: BlogWithCategory[] = [];

  if (categoryId) {
    const same = await unstable_cache(
      async () =>
        db.blog.findMany({
          where: { ...liveWhere, categoryId },
          orderBy: { createdAt: "desc" },
          take: FETCH,
          include: { category: true },
        }),
      ["related-by-category", categoryId, String(FETCH)],
      { revalidate: 300, tags: ["blog-content-pool"] }
    )();
    related.push(
      ...same.map(reviveBlog).filter((s) => s.id !== blogId).slice(0, limit)
    );
  }

  if (related.length < limit) {
    const fallback = await unstable_cache(
      async () =>
        db.blog.findMany({
          where: liveWhere,
          orderBy: { createdAt: "desc" },
          take: limit + FETCH,
          include: { category: true },
        }),
      ["related-fallback", String(limit + FETCH)],
      { revalidate: 300, tags: ["blog-content-pool"] }
    )();
    const excludeIds = new Set([blogId, ...related.map((r) => r.id)]);
    const more = fallback
      .map(reviveBlog)
      .filter((f) => !excludeIds.has(f.id))
      .slice(0, limit - related.length);
    related.push(...more);
  }

  return related.slice(0, limit);
}

/* ---------- published slugs, cached (for short-URL lookup) ----------
   /s/[code] প্রতিটা ক্লিকে (Facebook/WhatsApp শেয়ার থেকে আসা ভিজিটর —
   ঠিক সবচেয়ে গুরুত্বপূর্ণ ট্রাফিকেই) আগে DB থেকে *সব* পাবলিশড পোস্টের slug
   টেনে O(N) স্ক্যান করত, কোনো cache ছাড়াই। এখন slug লিস্টটা cache হয়
   (১০ মিনিট) — একই "blog-content-pool" ট্যাগে, তাই পাবলিশ/এডিট/ডিলিটে
   অন্য সব ক্যাশের সাথেই রিফ্রেশ হয়। */
export const getPublishedSlugs = unstable_cache(
  async () => {
    const blogs = await db.blog.findMany({
      where: { published: true },
      select: { slug: true },
    });
    return blogs.map((b) => b.slug);
  },
  ["published-slugs"],
  { revalidate: 600, tags: ["blog-content-pool"] }
);

/* ---------- build interlink targets for a given blog ---------- */
export async function buildInterlinkTargets(excludeBlogId: string): Promise<InterlinkTarget[]> {
  const pool = await getInterlinkPool();
  return pool
    .filter((p) => p.id !== excludeBlogId)
    .map(({ title, slug, keywords }) => ({ title, slug, keywords }));
}
