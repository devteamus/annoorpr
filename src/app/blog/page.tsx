import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { AppHeader } from "@/components/app/header";
import { AppFooter } from "@/components/app/footer";
import { ServerBlogCard } from "@/components/app/server-blog-card";
import { formatBengaliNumber } from "@/lib/blog-utils";
import { BookOpen, Newspaper, Search, X } from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://annoor.xyz";
const PER_PAGE = 9;

// প্রতিবার রিকোয়েস্টে রেন্ডার — নতুন পোস্ট/কাউন্ট সাথে সাথে দেখায়,
// আর Vercel build-এ DB ছাড়াও বিল্ড পাস করে (DB unreachable হলেও ভাঙে না)
export const dynamic = "force-dynamic";

type SearchParams = Promise<{ page?: string; category?: string; q?: string }>;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const { category, q, page: pageParam } = await searchParams;
  const metaPage = Math.min(1000, Math.max(1, Math.floor(Number(pageParam)) || 1));
  // সার্চ রেজাল্ট পেজ ইনডেক্স করার মতো নয় — thin content এড়াতে noindex
  if (q) {
    return {
      title: `“${q}” অনুসন্ধানের ফলাফল`,
      robots: { index: false, follow: true },
    };
  }
  // পেজ ২+ এর canonical নিজেই (self-referencing) — আগে সবগুলো পেজ ১-এর canonical
  // দিত, ফলে Google পেজ ২/৩-কে ডুপ্লিকেট ধরত
  const qs = new URLSearchParams();
  if (category) qs.set("category", category);
  if (metaPage > 1) qs.set("page", String(metaPage));
  const url = `${BASE_URL}/blog${qs.toString() ? `?${qs.toString()}` : ""}`;
  const baseTitle = category
    ? `${category === "all" ? "সব" : category} ক্যাটাগরির ইসলামিক ব্লগ`
    : "ইসলামিক ব্লগ — দোয়া, আমল ও জীবনযাপন";
  const title = metaPage > 1 ? `${baseTitle} — পাতা ${metaPage}` : baseTitle;
  return {
    title,
    description:
      "আন-নূর ইসলামিক ব্লগ — সহিহ দোয়া, যিকির, রুকইয়াহ, নামাজ, রিজিক ও দৈনন্দিন জীবনের আমল নিয়ে কুরআন ও সুন্নাহভিত্তিক আর্টিকেল।",
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "bn_BD",
      url,
      siteName: "আন-নূর",
      title,
      description: "সহিহ দোয়া ও আমল নিয়ে কুরআন-সুন্নাহভিত্তিক ইসলামিক আর্টিকেল।",
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "আন-নূর ইসলামিক ব্লগ" }],
    },
    twitter: { card: "summary_large_image", title, images: ["/og-image.png"] },
  };
}

export default async function BlogListPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { page: pageParam, category, q } = await searchParams;
  // page ১..১০০০ এ আটকানো (NaN/বিশাল মানে Prisma skip এরর হতো); সার্চ ≤ ১০০ অক্ষর
  const page = Math.min(1000, Math.max(1, Math.floor(Number(pageParam)) || 1));
  const query = (q || "").trim().slice(0, 100);

  const liveWhere = {
    published: true as const,
    OR: [{ scheduledAt: null }, { scheduledAt: { lte: new Date() } }],
  };

  // সার্চ + ক্যাটাগরি ফিল্টার — দুটোই একসাথে কাজ করে
  //
  // পারফরম্যান্স নোট: আগে content (ব্লগের পুরো HTML, সবচেয়ে বড় কলাম)
  // পর্যন্ত ILIKE '%...%' দিয়ে স্ক্যান হতো — leading-wildcard search কোনো
  // B-tree ইনডেক্স ব্যবহার করতে পারে না, তাই প্রতিটা সার্চে পুরো টেবিলের
  // প্রতিটা পোস্টের পুরো কনটেন্ট সিকোয়েন্সিয়ালি স্ক্যান হতো — হাই-ট্রাফিকে
  // এটা সবচেয়ে ভারী কোয়েরিগুলোর একটা হতে পারত। এখন শুধু title + excerpt
  // (অনেক ছোট কলাম) স্ক্যান হয়, যা প্রায় সব প্র্যাক্টিক্যাল সার্চেই যথেষ্ট।
  // ভবিষ্যতে পুরো কনটেন্ট সার্চ দরকার হলে pg_trgm GIN ইনডেক্স যোগ করা ভালো
  // সমাধান (এই ইনডেক্স এখনো নেই, তাই আপাতত এড়ানো হলো)।
  // ⚠️ আগে সার্চের `OR` liveWhere-এর শিডিউল-`OR`-কে ওভাররাইট করত → ভবিষ্যতে
  // শিডিউল করা পোস্ট সার্চ রেজাল্টে ফাঁস হতো। এখন দুটোই AND[]-এ, তাই ঠিক।
  const filters = {
    published: true as const,
    AND: [
      { OR: liveWhere.OR },
      ...(query
        ? [
            {
              OR: [
                { title: { contains: query, mode: "insensitive" as const } },
                { excerpt: { contains: query, mode: "insensitive" as const } },
              ],
            },
          ]
        : []),
    ],
    ...(category ? { category: { slug: category } } : {}),
  };

  const [categories, total, blogs] = await Promise.all([
    db.blogCategory.findMany({
      where: { blogs: { some: liveWhere } },
      // শুধু লাইভ পোস্ট গোনা — আগে ড্রাফট/শিডিউলও কাউন্টে ঢুকত
      select: {
        name: true,
        slug: true,
        _count: { select: { blogs: { where: liveWhere } } },
      },
      orderBy: { name: "asc" },
    }),
    db.blog.count({ where: filters }),
    db.blog.findMany({
      where: filters,
      include: { category: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  // সীমার বাইরের পেজ (?page=999) আগে খালি পেজ + 200 দিত (soft-404) — এখন সত্যিকারের 404
  if (page > totalPages) notFound();
  const activeCat = category || "";

  // লিংক বানানোর হেল্পার — q/category সংরক্ষিত থাকে
  const blogHref = (extra: Record<string, string | undefined> = {}) => {
    const params = new URLSearchParams();
    if (activeCat) params.set("category", activeCat);
    if (query) params.set("q", query);
    for (const [k, v] of Object.entries(extra)) {
      if (v) params.set(k, v);
      else params.delete(k);
    }
    const qs = params.toString();
    return `/blog${qs ? `?${qs}` : ""}`;
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "আন-নূর ইসলামিক ব্লগ",
    url: `${BASE_URL}/blog`,
    inLanguage: "bn",
    description: "সহিহ দোয়া ও আমল নিয়ে কুরআন-সুন্নাহভিত্তিক ইসলামিক আর্টিকেল।",
    publisher: { "@type": "Organization", name: "আন-নূর", url: BASE_URL },
    blogPost: blogs.map((b) => ({
      "@type": "BlogPosting",
      headline: b.title,
      url: `${BASE_URL}/blog/${encodeURIComponent(b.slug)}`,
      datePublished: b.createdAt.toISOString(),
      dateModified: b.updatedAt.toISOString(),
    })),
  };

  return (
    <div className="flex min-h-screen flex-col pattern-bg">
      <AppHeader />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-6xl px-3 py-5 sm:px-6 sm:py-7">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 text-xs font-bengali text-muted-foreground">
              <Link href="/" className="hover:text-foreground">
                হোম
              </Link>
              <span aria-hidden="true">›</span>
              <span className="text-foreground">ব্লগ</span>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-emerald-500/15 to-teal-600/15">
                <Newspaper className="h-5 w-5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
              </div>
              <div>
                <h1 className="font-bengali text-2xl font-bold text-foreground sm:text-3xl">
                  ইসলামিক ব্লগ
                </h1>
                <p className="mt-0.5 font-bengali text-xs text-muted-foreground">
                  {query
                    ? `“${query}” অনুসন্ধানে ${formatBengaliNumber(total)} টি ফলাফল`
                    : `মোট ${formatBengaliNumber(total)} টি আর্টিকেল`}
                </p>
              </div>
            </div>
          </div>

          {/* Search box — আসল HTML ফর্ম (GET), JS ছাড়াই কাজ করে */}
          <form
            action="/blog"
            method="GET"
            className="mb-5 flex gap-2"
            role="search"
          >
            {activeCat && (
              <input type="hidden" name="category" value={activeCat} />
            )}
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                type="search"
                name="q"
                defaultValue={query}
                placeholder="আর্টিকেল খুঁজুন — যেমন: দোয়া, রুকইয়াহ, নামাজ…"
                aria-label="ব্লগে অনুসন্ধান"
                className="h-11 w-full rounded-xl border border-input bg-background pl-9 pr-4 font-bengali text-sm shadow-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <button
              type="submit"
              className="inline-flex h-11 shrink-0 cursor-pointer items-center gap-1.5 rounded-xl bg-emerald-600 px-4 font-bengali text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              খুঁজুন
            </button>
            {query && (
              <Link
                href={activeCat ? `/blog?category=${encodeURIComponent(activeCat)}` : "/blog"}
                className="inline-flex h-11 shrink-0 items-center gap-1 rounded-xl border border-input bg-background px-3 font-bengali text-xs text-muted-foreground shadow-sm transition-colors hover:bg-accent"
                aria-label="অনুসন্ধান মুছুন"
              >
                <X className="h-4 w-4" aria-hidden="true" />
                মুছুন
              </Link>
            )}
          </form>

          {/* Category chips — আসল লিংক (indexable) */}
          <div className="mb-6 flex flex-wrap gap-2">
            <Link
              href={query ? `/blog?q=${encodeURIComponent(query)}` : "/blog"}
              className={`inline-flex h-8 items-center rounded-full border px-3.5 font-bengali text-xs transition-colors ${
                activeCat === ""
                  ? "border-emerald-500 bg-emerald-500 text-white"
                  : "border-border/60 bg-card text-muted-foreground hover:border-emerald-500/40 hover:text-foreground"
              }`}
            >
              সব
            </Link>
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/blog?category=${encodeURIComponent(c.slug)}${query ? `&q=${encodeURIComponent(query)}` : ""}`}
                className={`inline-flex h-8 items-center gap-1.5 rounded-full border px-3.5 font-bengali text-xs transition-colors ${
                  activeCat === c.slug
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : "border-border/60 bg-card text-muted-foreground hover:border-emerald-500/40 hover:text-foreground"
                }`}
              >
                {c.name}
                <span className="opacity-70">{formatBengaliNumber(c._count.blogs)}</span>
              </Link>
            ))}
          </div>

          {/* Posts grid */}
          {blogs.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {blogs.map((b) => (
                <ServerBlogCard
                  key={b.id}
                  blog={{
                    id: b.id,
                    title: b.title,
                    slug: b.slug,
                    excerpt: b.excerpt || "",
                    featureImage: b.featureImage || null,
                    views: b.views,
                    createdAt: b.createdAt.toISOString(),
                    category: b.category
                      ? { name: b.category.name, slug: b.category.slug }
                      : null,
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="grid place-items-center rounded-xl border border-border/60 bg-card p-12 text-center">
              <BookOpen className="h-10 w-10 text-muted-foreground/50" aria-hidden="true" />
              <p className="mt-3 font-bengali text-sm text-muted-foreground">
                {query
                  ? "কোনো আর্টিকেল পাওয়া যায়নি। অন্য শব্দ দিয়ে খুঁজে দেখুন।"
                  : "এই ক্যাটাগরিতে এখনও কোনো আর্টিকেল নেই।"}
              </p>
            </div>
          )}

          {/* Pagination — আসল লিংক, q/category সংরক্ষিত */}
          {totalPages > 1 && (
            <nav
              className="mt-8 flex items-center justify-center gap-2"
              aria-label="পেজিনেশন"
            >
              {page > 1 && (
                <Link
                  href={blogHref({ page: page > 2 ? String(page - 1) : undefined })}
                  className="inline-flex h-9 items-center rounded-md border border-input bg-background px-3 font-bengali text-xs shadow-sm hover:bg-accent"
                >
                  আগের পেজ
                </Link>
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={blogHref({ page: p > 1 ? String(p) : undefined })}
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-md border font-bengali text-xs shadow-sm ${
                    p === page
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-input bg-background hover:bg-accent"
                  }`}
                >
                  {formatBengaliNumber(p)}
                </Link>
              ))}
              {page < totalPages && (
                <Link
                  href={blogHref({ page: String(page + 1) })}
                  className="inline-flex h-9 items-center rounded-md border border-input bg-background px-3 font-bengali text-xs shadow-sm hover:bg-accent"
                >
                  পরের পেজ
                </Link>
              )}
            </nav>
          )}
        </div>
      </main>
      <AppFooter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
}
