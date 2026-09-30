// /sitemap-posts-1.xml — পোস্ট সাইটম্যাপ (ফাইল 1/১০, সর্বোচ্চ ১,০০০ URL)
import { postSitemapHandler } from "@/lib/post-sitemap";

export const dynamic = "force-dynamic";
export const GET = postSitemapHandler(1);
