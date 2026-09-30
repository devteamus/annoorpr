import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { safeDecode } from "@/lib/blog-utils";

// /api/blogs/[slug]/share — শেয়ার কাউন্ট ট্র্যাকিং
//   POST { network: "facebook" | "whatsapp" | "chatgpt" | "gemini" | "copy" | "native" }
//        → কাউন্ট বাড়ায়, নতুন মোট কাউন্ট ফেরত দেয়
//   GET  → বর্তমান মোট কাউন্ট

const ALLOWED_NETWORKS = new Set([
  "facebook",
  "whatsapp",
  "chatgpt",
  "gemini",
  "copy",
  "native",
]);

function todayKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

async function getTotalShares(blogId: string): Promise<number> {
  const agg = await db.blogShare.aggregate({
    where: { blogId },
    _sum: { count: true },
  });
  return agg._sum.count ?? 0;
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await ctx.params;
    const body = (await req.json().catch(() => ({}))) as { network?: string };
    const network = String(body.network || "");

    if (!ALLOWED_NETWORKS.has(network)) {
      return NextResponse.json(
        { error: "Invalid network" },
        { status: 400 }
      );
    }

    const blog = await db.blog.findUnique({
      where: { slug: safeDecode(slug) },
      select: { id: true },
    });
    if (!blog) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const date = todayKey();
    await db.blogShare.upsert({
      where: { blogId_network_date: { blogId: blog.id, network, date } },
      create: { blogId: blog.id, network, date, count: 1 },
      update: { count: { increment: 1 } },
    });

    return NextResponse.json({ total: await getTotalShares(blog.id) });
  } catch {
    return NextResponse.json(
      { error: "Share count failed" },
      { status: 500 }
    );
  }
}

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await ctx.params;
    const blog = await db.blog.findUnique({
      where: { slug: safeDecode(slug) },
      select: { id: true },
    });
    if (!blog) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    return NextResponse.json({ total: await getTotalShares(blog.id) });
  } catch {
    return NextResponse.json({ total: 0 });
  }
}
