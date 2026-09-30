// সাইটম্যাপ XML বিল্ডার — sitemapindex + urlset ফ্যাক্টরি
// স্ট্রাকচার:
//   /sitemap.xml                → Sitemap Index
//   /sitemap-posts-N.xml (×১০)  → পোস্ট সাইটম্যাপ (প্রতিটিতে সর্বোচ্চ ১,০০০ URL)
//   /sitemap-categories.xml     → ক্যাটাগরি সাইটম্যাপ
//   /sitemap-pages.xml          → পেজ সাইটম্যাপ

export interface SitemapUrl {
  loc: string;
  lastmod?: Date | string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: number;
  // Google Images-এ পোস্টের ফিচার ইমেজ ইনডেক্স হওয়া দ্রুত করতে (image sitemap
  // extension) — শুধু পোস্ট সাইটম্যাপে ব্যবহৃত, বাকিগুলোয় ঐচ্ছিক/অনুপস্থিত
  image?: { loc: string; title?: string };
}

export function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

const iso = (d: Date | string) =>
  (typeof d === "string" ? new Date(d) : d).toISOString();

export function buildUrlSet(urls: SitemapUrl[]): string {
  const body = urls
    .map((u) => {
      const parts = [`    <loc>${escapeXml(u.loc)}</loc>`];
      if (u.lastmod) parts.push(`    <lastmod>${iso(u.lastmod)}</lastmod>`);
      if (u.changefreq) parts.push(`    <changefreq>${u.changefreq}</changefreq>`);
      if (typeof u.priority === "number")
        parts.push(`    <priority>${u.priority.toFixed(1)}</priority>`);
      if (u.image?.loc) {
        parts.push(
          `    <image:image>\n      <image:loc>${escapeXml(u.image.loc)}</image:loc>${
            u.image.title
              ? `\n      <image:title>${escapeXml(u.image.title)}</image:title>`
              : ""
          }\n    </image:image>`
        );
      }
      return `  <url>\n${parts.join("\n")}\n  </url>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${body}\n</urlset>\n`;
}

export function buildSitemapIndex(
  items: { loc: string; lastmod?: Date | string }[]
): string {
  const body = items
    .map((s) => {
      const parts = [`    <loc>${escapeXml(s.loc)}</loc>`];
      if (s.lastmod) parts.push(`    <lastmod>${iso(s.lastmod)}</lastmod>`);
      return `  <sitemap>\n${parts.join("\n")}\n  </sitemap>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</sitemapindex>\n`;
}

export function xmlResponse(xml: string): Response {
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      // ১ ঘণ্টা ক্যাশ — ট্রাফিক বেশি হলেও DB চাপ কম থাকে
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
