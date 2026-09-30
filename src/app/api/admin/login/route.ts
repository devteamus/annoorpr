import { NextRequest, NextResponse } from "next/server";
import { authenticateAdmin, createSessionToken, setSessionCookie } from "@/lib/auth";

/* ---------- লগইন রেট-লিমিট (ব্রুট-ফোর্স ঠেকাতে) ----------
   প্রতি IP সর্বোচ্চ ৫টি ব্যর্থ চেষ্টা / ১৫ মিনিট। সফল লগইন হলে কাউন্টার রিসেট।
   (এক ইনস্ট্যান্সের ইন-মেমরি লিমিট — Vercel-এ প্রতি সার্ভারলেস ইনস্ট্যান্সে আলাদা
   হয়, তাই এটা "best-effort" স্তরের সুরক্ষা; পাসওয়ার্ড শক্ত রাখাই মূল প্রতিরক্ষা।) */
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const attempts = new Map<string, { count: number; first: number }>();

// Cloudflare-এর পেছনে থাকলে আসল IP আসে cf-connecting-ip-তে। ⚠️ আগে সরাসরি
// x-forwarded-for-এর প্রথম মান নেওয়া হতো — সেটা ক্লায়েন্ট নিজে বানিয়ে পাঠাতে
// পারে, ফলে প্রতিবার আলাদা নকল IP দিয়ে ৫-চেষ্টার লিমিট এড়ানো যেত।
function clientIp(req: NextRequest): string {
  return (
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-real-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

// ইন-মেমরি ম্যাপ যেন অসীম না বাড়ে (নকল IP ঘুরিয়ে মেমরি ভরানো ঠেকাতে)
const MAX_TRACKED_IPS = 5000;

function tooManyAttempts(ip: string): boolean {
  const rec = attempts.get(ip);
  if (!rec) return false;
  if (Date.now() - rec.first > WINDOW_MS) {
    attempts.delete(ip);
    return false;
  }
  return rec.count >= MAX_ATTEMPTS;
}

function recordFailure(ip: string) {
  const now = Date.now();
  const rec = attempts.get(ip);
  if (!rec || now - rec.first > WINDOW_MS) {
    if (attempts.size >= MAX_TRACKED_IPS) {
      // সবচেয়ে পুরনো এন্ট্রি বাদ (Map insertion-order)
      const oldest = attempts.keys().next().value;
      if (oldest !== undefined) attempts.delete(oldest);
    }
    attempts.set(ip, { count: 1, first: now });
  } else {
    rec.count += 1;
  }
}

// পুরনো রেকর্ড পরিষ্কার — মেমরি লিক এড়াতে
setInterval(() => {
  const now = Date.now();
  for (const [ip, rec] of attempts) {
    if (now - rec.first > WINDOW_MS) attempts.delete(ip);
  }
}, WINDOW_MS).unref?.();

export async function POST(req: NextRequest) {
  try {
    const ip = clientIp(req);
    if (tooManyAttempts(ip)) {
      return NextResponse.json(
        { error: "অনেকবার ভুল হয়েছে। ১৫ মিনিট পর আবার চেষ্টা করুন।" },
        { status: 429 }
      );
    }

    const body = await req.json();
    const email = String(body?.email ?? "").trim().toLowerCase();
    const password = String(body?.password ?? "");

    if (!email || !password) {
      return NextResponse.json(
        { error: "ইমেইল ও পাসওয়ার্ড দিন।" },
        { status: 400 }
      );
    }

    const admin = await authenticateAdmin(email, password);
    if (!admin) {
      recordFailure(ip);
      return NextResponse.json(
        { error: "ভুল ইমেইল বা পাসওয়ার্ড।" },
        { status: 401 }
      );
    }

    attempts.delete(ip);
    const token = createSessionToken(admin.id, admin.email);
    await setSessionCookie(token);

    return NextResponse.json({
      ok: true,
      admin: { email: admin.email, name: admin.name },
    });
  } catch (e) {
    return NextResponse.json(
      { error: "লগইনে সমস্যা হয়েছে।" },
      { status: 500 }
    );
  }
}
