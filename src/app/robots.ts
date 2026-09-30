import type { MetadataRoute } from "next";

// robots.txt — শুধু ইনডেক্সযোগ্য গুরুত্বপূর্ণ URL গুলো crawl করা যাবে।
// SPA ভিউ (?view=...) এবং /api/* সবসময় ব্লক — কনটেন্টের একটাই canonical URL থাকে।
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://annoor.xyz";

// AI Overview / LLM citation-এর জন্য প্রধান AI crawler-দের স্পষ্টভাবে allow
const AI_CRAWLERS = [
  "GPTBot", // OpenAI
  "OAI-SearchBot", // OpenAI search
  "ChatGPT-User", // ChatGPT user-initiated fetch
  "ClaudeBot", // Anthropic
  "Claude-Web", // Anthropic fetch
  "anthropic-ai",
  "PerplexityBot", // Perplexity
  "Perplexity-User",
  "Google-Extended", // Google Gemini training
  "Applebot-Extended",
  "meta-externalagent",
  "CCBot", // Common Crawl
];

// ক্লিন URL পেজ সিস্টেম — সব indexable
const ALLOWED_PATHS = [
  "/",
  "/blog",
  "/books",
  "/contact",
  "/privacy",
  "/terms",
  "/after-prayer",
  "/rizq",
  "/forgiveness",
  "/daily-duas",
  "/dua/",
  "/ruqyah",
  "/namaz",
  "/names-of-allah",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // সার্চ ইঞ্জিন + সোশ্যাল বট
      {
        userAgent: [
          "Googlebot",
          "Googlebot-Image",
          "Bingbot",
          "DuckDuckBot",
          "YandexBot",
          "Slurp",
          "facebookexternalhit",
          "Twitterbot",
          "LinkedInBot",
          "WhatsApp",
          "TelegramBot",
          ...AI_CRAWLERS,
        ],
        allow: ALLOWED_PATHS,
        disallow: [
          "/api/",
          "/*?page=0",
          // নোট: ?view=... URL আর disallow নয় — middleware এখন 308
          // রিডাইরেক্ট করে; Google রিডাইরেক্ট ফলো করে canonical-এ signal জমায়।
        ],
      },
      // বাকি সব bot — শুধু পাবলিক কনটেন্ট
      {
        userAgent: "*",
        allow: ALLOWED_PATHS,
        disallow: ["/api/"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
