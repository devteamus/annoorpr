// Blog helper utilities — re-exports interlinking + pure/client-safe helpers.
//
// ⚠️ এই ফাইলে কোনো "db" বা "next/cache" import করবেন না — এটা ক্লায়েন্ট
// কম্পোনেন্ট (blog-post-view.tsx, blog-card.tsx ইত্যাদি) থেকেও ইমপোর্ট হয়,
// তাই সার্ভার-অনলি কিছু এখানে থাকলে বিল্ড ভেঙে যায়। DB/cache-নির্ভর সব
// ফাংশন @/lib/blog-server.ts-এ রাখা আছে (শুধু page.tsx/route.ts থেকে ইমপোর্ট
// করুন, কোনো "use client" ফাইল থেকে না)।
import {
  applySmartInterlinking,
  extractKeywords,
  type InterlinkTarget,
  slugify,
  stripHtml,
  generateMetaTitle,
  generateMetaDescription,
  generateExcerpt,
  readingMinutes,
} from "@/lib/interlinking";

export {
  applySmartInterlinking,
  extractKeywords,
  slugify,
  stripHtml,
  generateMetaTitle,
  generateMetaDescription,
  generateExcerpt,
  readingMinutes,
};
export type { InterlinkTarget };
export { MIN_INTERLINKS, MAX_INTERLINKS } from "@/lib/interlinking";

/* ---------- category slug ---------- */
export function categorySlug(name: string): string {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\u0980-\u09ff\w-]/g, "") || name
  );
}

/* ---------- is a blog currently visible? (scheduled logic) ---------- */
export function isBlogLive(b: { published: boolean; scheduledAt: Date | null }): boolean {
  if (!b.published) return false;
  if (!b.scheduledAt) return true;
  return b.scheduledAt.getTime() <= Date.now();
}

/* ---------- formatting ---------- */
export function formatBengaliDate(date: Date): string {
  const months = [
    "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
    "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর",
  ];
  const num = (n: number) => n.toLocaleString("bn-BD");
  return `${num(date.getDate())} ${months[date.getMonth()]}, ${num(date.getFullYear())}`;
}

export function formatBengaliNumber(n: number): string {
  return n.toLocaleString("bn-BD");
}

/* ---------- parse a schedule date from CSV (flexible) ---------- */
export function parseScheduleDate(input: string): Date | null {
  const s = input.trim();
  if (!s) return null;
  // Try ISO first
  const iso = new Date(s);
  if (!isNaN(iso.getTime())) return iso;
  // Try dd/mm/yyyy or dd-mm-yyyy
  const m = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})\s*(\d{1,2}):(\d{2})?$/);
  if (m) {
    const [, d, mo, y, h = "9", min = "0"] = m;
    const dt = new Date(Number(y), Number(mo) - 1, Number(d), Number(h), Number(min));
    if (!isNaN(dt.getTime())) return dt;
  }
  const m2 = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);
  if (m2) {
    const [, d, mo, y] = m2;
    const dt = new Date(Number(y), Number(mo) - 1, Number(d), 9, 0);
    if (!isNaN(dt.getTime())) return dt;
  }
  return null;
}

/* ---------- safe URL decode ----------
   বট/স্ক্যানার প্রায়ই ভাঙা percent-encoding পাঠায় (যেমন /blog/%E0%A4%A) —
   সরাসরি decodeURIComponent() সেখানে URIError ছুঁড়ে দিত → 500 (Search Console-এ
   "Server error 5xx")। এখন ভাঙা হলে মূল স্ট্রিংই ফেরত যায়, DB-তে না পেলে 404। */
export function safeDecode(s: string): string {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}
