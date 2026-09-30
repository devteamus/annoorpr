import { NextRequest, NextResponse } from "next/server";

// পুরনো SPA লিংক (?view=...) → স্থায়ী (308) রিডাইরেক্ট ক্লিন canonical URL-এ।
// Search Console-এ প্রতিটি কনটেন্টের একটাই URL থাকবে — duplicate/redirect এরর নেই।
//
// নতুন URL ম্যাপ:
//   ?view=home                        →  /
//   ?view=category&categoryId=X       →  /X
//   ?view=counter&duaId=X             →  /dua/X
//   ?view=names-of-allah              →  /names-of-allah
//   ?view=ruqyah                      →  /ruqyah
//   ?view=namaz                       →  /namaz
//   ?view=history                     →  /history
//   ?view=blog[&page&category]        →  /blog[?page&category]
//   ?view=blog-post&slug=X            →  /blog/X
//   ?view=shop                        →  /books
//   admin-login / admin-dashboard     →  রিডাইরেক্ট হয় না (SPA ভিউ, noindex)

// সাধারণ ভিউ — কোনো প্যারামিটার ছাড়া সরাসরি ম্যাপ
const SIMPLE_VIEW_MAP: Record<string, string> = {
  home: "/",
  "names-of-allah": "/names-of-allah",
  ruqyah: "/ruqyah",
  namaz: "/namaz",
  history: "/history",
  shop: "/books",
};

function redirect308(req: NextRequest, pathname: string, search = "") {
  const url = req.nextUrl.clone();
  url.pathname = pathname;
  url.search = search;
  return NextResponse.redirect(url, 308);
}

export function proxy(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  if (pathname !== "/") return NextResponse.next();

  const view = searchParams.get("view");
  if (!view) return NextResponse.next();

  // ব্লগ পোস্ট — slug সহ
  if (view === "blog-post") {
    const slug = searchParams.get("slug");
    if (slug) return redirect308(req, `/blog/${encodeURIComponent(slug)}`);
    return redirect308(req, "/blog");
  }

  // ব্লগ লিস্ট — page/category প্যারামিটার সংরক্ষিত থাকে
  if (view === "blog") {
    const params = new URLSearchParams();
    const page = searchParams.get("page");
    const category = searchParams.get("category");
    if (page && Number(page) > 1) params.set("page", page);
    if (category) params.set("category", category);
    const qs = params.toString();
    return redirect308(req, "/blog", qs ? `?${qs}` : "");
  }

  // দুআ ক্যাটাগরি — /{categoryId}
  if (view === "category") {
    const categoryId = searchParams.get("categoryId");
    if (categoryId) {
      return redirect308(req, `/${encodeURIComponent(categoryId)}`);
    }
    return redirect308(req, "/");
  }

  // দুআ কাউন্টার — /dua/{duaId}
  if (view === "counter") {
    const duaId = searchParams.get("duaId");
    if (duaId) {
      return redirect308(req, `/dua/${encodeURIComponent(duaId)}`);
    }
    return redirect308(req, "/");
  }

  // বাকি সাধারণ ভিউ
  const mapped = SIMPLE_VIEW_MAP[view];
  if (mapped) return redirect308(req, mapped);

  // admin-login / admin-dashboard — SPA ভিউ, রিডাইরেক্ট নয়
  return NextResponse.next();
}

// শুধু হোম পেজ ("/") রিকোয়েস্টে চলে — স্ট্যাটিক/অ্যাসেট/API/অন্য রুট স্পর্শ হয় না
export const config = {
  matcher: ["/"],
};
