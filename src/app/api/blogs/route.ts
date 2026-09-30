import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import {
  generateMetaTitle,
  generateMetaDescription,
  generateExcerpt,
  isBlogLive,
  parseScheduleDate,
} from "@/lib/blog-utils";
import {
  uniqueSlug,
  findOrCreateCategoryByName,
  invalidateBlogPool,
} from "@/lib/blog-server";
import { formatBlogContent } from "@/lib/blog-content-formatter";

const PER_PAGE = 20;

/* GET /api/blogs?page=1&category=slug&q=text&all=true (all=admin) */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  // page: NaN/অসীম/বিশাল মান হলে Prisma skip এরর (500) দিত — ১..১০০০ এ আটকানো
  const rawPage = Math.floor(Number(searchParams.get("page") || "1"));
  const page = Number.isFinite(rawPage) ? Math.min(1000, Math.max(1, rawPage)) : 1;
  const categorySlug = searchParams.get("category") || "";
  // সার্চ টার্ম সর্বোচ্চ ১০০ অক্ষর — অতিদীর্ঘ স্ট্রিং দিয়ে ILIKE স্ক্যান ভারী করা ঠেকাতে
  const q = (searchParams.get("q") || "").trim().slice(0, 100);
  const wantAll = searchParams.get("all") === "true";

  // only admins can see unpublished / scheduled-future
  let canSeeUnpublished = false;
  if (wantAll) {
    const session = await getSession();
    canSeeUnpublished = !!session;
  }

  // ⚠️ আগে সার্চের `where.OR = [...]` লাইভ-শিডিউল OR-টাকে ওভাররাইট করত, ফলে
  // ভবিষ্যতে শিডিউল করা (এখনো প্রকাশ হয়নি) পোস্ট পাবলিক সার্চে ফাঁস হতো।
  // এখন সব শর্ত AND[] তালিকায় — একটা আরেকটাকে ওভাররাইট করে না।
  const and: Record<string, unknown>[] = [];
  const where: Record<string, unknown> = canSeeUnpublished
    ? {}
    : { published: true };
  if (!canSeeUnpublished) {
    and.push({
      OR: [{ scheduledAt: null }, { scheduledAt: { lte: new Date() } }],
    });
  }
  if (categorySlug) {
    where.category = { slug: categorySlug };
  }
  if (q) {
    // পারফরম্যান্স: content (পুরো HTML) বাদ — leading-wildcard ILIKE ঐ
    // কলামে কোনো ইনডেক্স ব্যবহার করতে পারে না, প্রতি সার্চে পুরো টেবিলের
    // প্রতিটা পোস্টের পুরো কনটেন্ট স্ক্যান হতো। title+excerpt যথেষ্ট।
    and.push({
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { excerpt: { contains: q, mode: "insensitive" } },
      ],
    });
  }
  if (and.length) where.AND = and;

  const [total, blogs] = await Promise.all([
    db.blog.count({ where }),
    db.blog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      include: { category: true },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  return NextResponse.json({
    blogs: blogs.map((b) => ({
      id: b.id,
      title: b.title,
      slug: b.slug,
      excerpt: b.excerpt,
      featureImage: b.featureImage,
      views: b.views,
      published: b.published,
      scheduledAt: b.scheduledAt,
      live: isBlogLive(b),
      createdAt: b.createdAt,
      category: b.category
        ? { name: b.category.name, slug: b.category.slug }
        : null,
    })),
    page,
    totalPages,
    total,
    perPage: PER_PAGE,
  });
}

/* POST /api/blogs  (admin only) — create a single blog */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "অনুমতি নেই।" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const title = String(body?.title ?? "").trim();
    const content = String(body?.content ?? "").trim();
    const featureImage = String(body?.featureImage ?? "").trim() || null;
    const categoryName = String(body?.category ?? "").trim();
    const published = body?.published !== false;

    // schedule: ISO string or null
    let scheduledAt: Date | null = null;
    if (body?.scheduledAt) {
      const d = new Date(body.scheduledAt);
      if (!isNaN(d.getTime())) scheduledAt = d;
    }

    if (!title || !content) {
      return NextResponse.json(
        { error: "শিরোনাম ও বিষয়বস্তু আবশ্যক।" },
        { status: 400 }
      );
    }

    const slug = await uniqueSlug(title);

    let categoryId: string | null = null;
    if (categoryName) {
      const cat = await findOrCreateCategoryByName(categoryName);
      categoryId = cat?.id ?? null;
    }

    const metaTitle = generateMetaTitle(title);
    const excerptSource = formatBlogContent(content);
    const metaDescription = generateMetaDescription(excerptSource);
    const excerpt = generateExcerpt(excerptSource);

    const blog = await db.blog.create({
      data: {
        title,
        slug,
        content,
        excerpt,
        metaTitle,
        metaDescription,
        featureImage,
        published,
        scheduledAt,
        categoryId,
      },
      include: { category: true },
    });
    invalidateBlogPool();

    return NextResponse.json({ ok: true, blog });
  } catch (e) {
    return NextResponse.json(
      { error: "ব্লগ তৈরিতে সমস্যা হয়েছে।" },
      { status: 500 }
    );
  }
}

// re-export parseScheduleDate for use in bulk route via import if needed
export { parseScheduleDate };
