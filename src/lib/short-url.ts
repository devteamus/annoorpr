// ডিটারমিনিস্টিক শর্ট কোড — slug থেকে সবসময় একই কোড বানায়।
// DB-তে আলাদা কলাম লাগে না, মাইগ্রেশন ছাড়াই পুরনো পোস্টেও কাজ করে।
//
// FNV-1a হ্যাশ দুইবার (সামনে-পেছনে) → 64-bit সংখ্যা → base62 (৬ অক্ষর)
// ৬২^৬ ≈ ৫৬ বিলিয়ন সম্ভাব্য কোড — ১০০০ পোস্টে কলিশনের সম্ভাবনা ~১০ লক্ষ ভাগের ১-এরও কম।

const ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const CODE_LEN = 6;

function fnv1a(str: string, seed: number): number {
  let h = seed >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

export function shortCodeFor(slug: string): string {
  const a = BigInt(fnv1a(slug, 0x811c9dc5));
  const b = BigInt(fnv1a(slug.split("").reverse().join(""), 0x9747b28c));
  let n = a * 4294967296n + b;
  let code = "";
  for (let i = 0; i < CODE_LEN; i++) {
    code = ALPHABET[Number(n % 62n)] + code;
    n = n / 62n;
  }
  return code;
}

// শর্ট URL বানায় — যেমন https://annoor.xyz/s/aB3xZ9
export function shortUrlFor(baseUrl: string, slug: string): string {
  return `${baseUrl.replace(/\/$/, "")}/s/${shortCodeFor(slug)}`;
}
