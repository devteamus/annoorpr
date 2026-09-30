import { NextRequest, NextResponse } from "next/server";
import { shortCodeFor } from "@/lib/short-url";
import { getPublishedSlugs } from "@/lib/blog-server";

// /s/{code} — শর্ট শেয়ার লিংক → আসল ব্লগ পোস্টে 301 রিডাইরেক্ট।
// Facebook/WhatsApp-এর ক্রলার রিডাইরেক্ট ফলো করে OG ট্যাগ নিয়ে যায়,
// তাই শেয়ার প্রিভিউ (ছবি, টাইটেল, ডেসক্রিপশন) ঠিকঠাক দেখায়।
export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ code: string }> }
) {
  const { code } = await ctx.params;

  try {
    const slugs = await getPublishedSlugs();
    const match = slugs.find((slug) => shortCodeFor(slug) === code);

    if (match) {
      return NextResponse.redirect(
        new URL(`/blog/${encodeURIComponent(match)}`, req.url),
        301
      );
    }
  } catch {
    // DB unreachable — নীরবে ব্লগে পাঠাই
  }

  // অজানা কোড → ব্লগ লিস্টে
  return NextResponse.redirect(new URL("/blog", req.url), 302);
}
