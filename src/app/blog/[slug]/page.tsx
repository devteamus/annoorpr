import type { Metadata } from "next";
import { cache } from "react";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import {
  applySmartInterlinking,
  readingMinutes,
  formatBengaliDate,
  formatBengaliNumber,
  isBlogLive,
  safeDecode,
} from "@/lib/blog-utils";
import {
  buildInterlinkTargets,
  getRelatedPosts,
  recordView,
} from "@/lib/blog-server";
import { formatBlogContent } from "@/lib/blog-content-formatter";
import { shortUrlFor } from "@/lib/short-url";
import { AppHeader } from "@/components/app/header";
import { AppFooter } from "@/components/app/footer";
import { Badge } from "@/components/ui/badge";
import { BestSellingBooks } from "@/components/app/best-selling-books";
import { ServerBlogCard } from "@/components/app/server-blog-card";
import { ShareButtons } from "@/components/app/share-buttons";
import { ChevronRight, Eye, Clock, Calendar, Sparkles } from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://annoor.xyz";

/* ---------- JSON-LD helpers ---------- */

// FAQ গুলো ফরম্যাট করা HTML থেকে বের করি (<details class="faq-item">) —
// FAQPage schema AI Overview + rich result-এর জন্য সরাসরি কাজে লাগে।
function extractFaq(html: string): { q: string; a: string }[] {
  const faqs: { q: string; a: string }[] = [];
  const re =
    /<details class="faq-item"><summary>([\s\S]*?)<\/summary>\s*<div class="faq-answer">([\s\S]*?)<\/div><\/details>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const q = stripTags(m[1]);
    const a = stripTags(m[2]);
    if (q && a) faqs.push({ q, a: a.slice(0, 500) });
  }
  return faqs;
}

function stripTags(s: string): string {
  return s
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/* ---------- data ---------- */

// React cache(): generateMetadata + পেজ দুটোই getPost ডাকে — আগে প্রতি ভিউতে
// পুরো পোস্ট (content সহ) দুইবার DB থেকে আসত; এখন এক রিকোয়েস্টে একবারই।
const getPost = cache(async (slug: string) => {
  const blog = await db.blog.findUnique({
    where: { slug },
    include: { category: true },
  });
  if (!blog || !isBlogLive(blog)) return null;
  return blog;
});

/* ---------- metadata (SEO) ---------- */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getPost(safeDecode(slug));
  if (!blog) {
    return { title: "ব্লগ পাওয়া যায়নি", robots: { index: false, follow: false } };
  }
  const url = `${BASE_URL}/blog/${encodeURIComponent(blog.slug)}`;
  const title = blog.metaTitle || blog.title;
  const description =
    blog.metaDescription || blog.excerpt || "ইসলামিক দোয়া ও আমলের সহিহ বিবরণ।";
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      locale: "bn_BD",
      url,
      siteName: "আন-নূর",
      title,
      description,
      publishedTime: blog.createdAt.toISOString(),
      modifiedTime: blog.updatedAt.toISOString(),
      images: [{ url: blog.featureImage || "/og-image.png", width: 1200, height: 630, alt: blog.title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [blog.featureImage || "/og-image.png"],
    },
  };
}

/* ---------- page ---------- */

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const blog = await getPost(safeDecode(slug));
  if (!blog) notFound();

  // বট হিট ভিউ-কাউন্ট বাড়াবে না (অ্যানালিটিক্স পরিষ্কার থাকে)
  const ua = (await headers()).get("user-agent") || "";
  const isBot = /bot|crawler|spider|slurp|facebookexternalhit|preview|monitor/i.test(ua);
  if (!isBot) {
    await recordView(blog.id, blog.updatedAt).catch(() => {});
  }

  // ইন্টারলিংকিং + ফরম্যাটিং — API রুটের মতোই, কিন্তু সার্ভারেই রেন্ডার হয়
  const targets = await buildInterlinkTargets(blog.id);
  const { html: interlinked } = applySmartInterlinking(blog.content, targets);
  const content = formatBlogContent(interlinked);

  const related = await getRelatedPosts(blog.id, blog.categoryId, 4);
  const faqs = extractFaq(content);
  const postUrl = `${BASE_URL}/blog/${encodeURIComponent(blog.slug)}`;

  // শর্ট শেয়ার URL (যেমন https://annoor.xyz/s/aB3xZ9) + মোট শেয়ার কাউন্ট
  const shortUrl = shortUrlFor(BASE_URL, blog.slug);
  let shareCount = 0;
  try {
    const shareAgg = await db.blogShare.aggregate({
      where: { blogId: blog.id },
      _sum: { count: true },
    });
    shareCount = shareAgg._sum.count ?? 0;
  } catch {
    // টেবিল না থাকলে 0 থেকে শুরু — পরের শেয়ারেই তৈরি হয়ে যাবে
  }

  const jsonLd: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: blog.title,
      description: blog.metaDescription || blog.excerpt,
      inLanguage: "bn",
      mainEntityOfPage: { "@type": "WebPage", "@id": postUrl },
      datePublished: blog.createdAt.toISOString(),
      dateModified: blog.updatedAt.toISOString(),
      author: { "@type": "Organization", name: "আন-নূর", url: BASE_URL },
      publisher: {
        "@type": "Organization",
        name: "আন-নূর",
        url: BASE_URL,
        logo: { "@type": "ImageObject", url: `${BASE_URL}/icon.svg` },
      },
      image: blog.featureImage || `${BASE_URL}/og-image.png`,
      ...(blog.category ? { articleSection: blog.category.name } : {}),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "হোম", item: `${BASE_URL}/` },
        { "@type": "ListItem", position: 2, name: "ব্লগ", item: `${BASE_URL}/blog` },
        ...(blog.category
          ? [
              {
                "@type": "ListItem",
                position: 3,
                name: blog.category.name,
                item: `${BASE_URL}/blog?category=${encodeURIComponent(blog.category.slug)}`,
              },
            ]
          : []),
        {
          "@type": "ListItem",
          position: blog.category ? 4 : 3,
          name: blog.title,
          item: postUrl,
        },
      ],
    },
  ];
  if (faqs.length >= 2) {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
  }

  return (
    <div className="flex min-h-screen flex-col pattern-bg">
      <AppHeader />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-6xl px-3 py-5 sm:px-6 sm:py-7">
          <div className="min-w-0 space-y-6">
            {/* Breadcrumb */}
            <nav
              className="flex items-center gap-1.5 text-xs font-bengali text-muted-foreground"
              aria-label="ব্রেডক্রাম্ব"
            >
              <Link href="/" className="hover:text-foreground">
                হোম
              </Link>
              <ChevronRight className="h-3 w-3" aria-hidden="true" />
              <Link href="/blog" className="hover:text-foreground">
                ব্লগ
              </Link>
              {blog.category && (
                <>
                  <ChevronRight className="h-3 w-3" aria-hidden="true" />
                  <Link
                    href={`/blog?category=${encodeURIComponent(blog.category.slug)}`}
                    className="hover:text-foreground"
                  >
                    {blog.category.name}
                  </Link>
                </>
              )}
              <ChevronRight className="h-3 w-3" aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate text-foreground">{blog.title}</span>
            </nav>

            {/* Article header */}
            <div>
              {blog.category && (
                <Badge className="mb-3 border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/15">
                  {blog.category.name}
                </Badge>
              )}
              <h1 className="font-bengali text-2xl font-bold leading-tight text-foreground sm:text-3xl md:text-4xl">
                {blog.title}
              </h1>
              <div className="mt-4 flex flex-wrap items-center gap-4 font-bengali text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                  {formatBengaliDate(blog.createdAt)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  {formatBengaliNumber(readingMinutes(blog.content))} মিনিট পড়ার মতো
                </span>
                <span className="flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                  {formatBengaliNumber(blog.views + (isBot ? 0 : 1))} বার দেখা হয়েছে
                </span>
              </div>
            </div>

            {/* Feature image */}
            {blog.featureImage && (
              <div className="overflow-hidden rounded-2xl border border-border/60">
                <img
                  src={blog.featureImage}
                  alt={blog.title}
                  decoding="async"
                  className="aspect-[16/9] w-full object-cover"
                />
              </div>
            )}

            {/* Content — সার্ভার-রেন্ডার্ড, SEO complete */}
            <article
              className="blog-content"
              dangerouslySetInnerHTML={{ __html: content }}
            />

            {/* Share — শর্ট URL + কাউন্ট + FB/WhatsApp/ChatGPT/Gemini */}
            <div className="space-y-3 border-y border-border/60 py-4">
              <ShareButtons
                slug={blog.slug}
                title={blog.title}
                url={postUrl}
                shortUrl={shortUrl}
                initialCount={shareCount}
              />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Link
                  href="/blog"
                  className="inline-flex h-9 items-center gap-1.5 rounded-md border border-input bg-background px-3 text-sm font-bengali shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  ব্লগে ফিরুন
                </Link>
                <span className="font-bengali text-[11px] text-muted-foreground">
                  শর্ট লিংক: <span className="select-all font-semibold text-foreground">{shortUrl}</span>
                </span>
              </div>
            </div>

            {/* Best Selling Islamic Books */}
            <BestSellingBooks max={4} />

            {/* Related */}
            {related.length > 0 && (
              <section className="pt-2">
                <div className="mb-4 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-500" aria-hidden="true" />
                  <h2 className="font-bengali text-lg font-bold text-foreground">
                    সম্পর্কিত আর্টিকেল
                  </h2>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {related.map((r) => (
                    <ServerBlogCard
                      key={r.id}
                      blog={{
                        id: r.id,
                        title: r.title,
                        slug: r.slug,
                        excerpt: r.excerpt || "",
                        featureImage: r.featureImage || null,
                        views: r.views,
                        createdAt: r.createdAt.toISOString(),
                        category: r.category
                          ? { name: r.category.name, slug: r.category.slug }
                          : null,
                      }}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </main>
      <AppFooter />

      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
}
