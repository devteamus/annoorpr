import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// /api/visit — সাইট-wide ভিজিটর কাউন্টার (ফুটারে দেখায়)
//   POST → আজকের কাউন্ট +১ (বট বাদ; ক্লায়েন্ট sessionStorage দিয়ে সেশন-প্রতি একবার)
//   GET  → { total, today }

function todayKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const BOT_RE = /bot|crawler|spider|slurp|facebookexternalhit|preview|monitor|headless/i;

export async function POST(req: NextRequest) {
  try {
    const ua = req.headers.get("user-agent") || "";
    if (BOT_RE.test(ua)) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const date = todayKey();
    await db.siteVisit.upsert({
      where: { date },
      create: { date, count: 1 },
      update: { count: { increment: 1 } },
    });
    return NextResponse.json({ ok: true });
  } catch {
    // ফুটার কখনো ভাঙবে না — নীরবে সফল ফেরত
    return NextResponse.json({ ok: false });
  }
}

export async function GET() {
  try {
    const date = todayKey();
    const [todayRow, agg] = await Promise.all([
      db.siteVisit.findUnique({ where: { date } }),
      db.siteVisit.aggregate({ _sum: { count: true } }),
    ]);
    return NextResponse.json({
      today: todayRow?.count ?? 0,
      total: agg._sum.count ?? 0,
    });
  } catch {
    return NextResponse.json({ today: 0, total: 0 });
  }
}
