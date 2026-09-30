"use client";

import * as React from "react";
import { Eye, TrendingUp } from "lucide-react";

// সাইট ভিজিটর কাউন্টার — ফুটারে বাংলায় দেখায়।
// প্রতি ব্রাউজার সেশনে একবারই গণনা হয় (sessionStorage দিয়ে ডুপ্লিকেট আটকায়),
// বট কাউন্ট হয় না (API সাইডে UA চেক)।
export function VisitorCounter() {
  const [stats, setStats] = React.useState<{ today: number; total: number } | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        // এই সেশনে আগে গণনা হয়নি → এখন গণনা করি
        if (!sessionStorage.getItem("annoor-visited")) {
          sessionStorage.setItem("annoor-visited", "1");
          await fetch("/api/visit", { method: "POST" }).catch(() => {});
        }
        const res = await fetch("/api/visit", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { today: number; total: number };
        if (!cancelled) setStats(data);
      } catch {
        // API না থাকলে নীরব — ফুটার কখনো ভাঙবে না
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const bn = (n: number) => n.toLocaleString("bn-BD");

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 font-bengali text-[11px] text-muted-foreground">
      <span className="inline-flex items-center gap-1.5">
        <Eye className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
        মোট ভিজিটর:{" "}
        <span className="font-bold text-foreground">
          {stats ? bn(stats.total) : "…"}
        </span>{" "}
        জন
      </span>
      <span className="hidden text-muted-foreground/40 sm:inline">·</span>
      <span className="inline-flex items-center gap-1.5">
        <TrendingUp className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
        আজ:{" "}
        <span className="font-bold text-foreground">
          {stats ? bn(stats.today) : "…"}
        </span>{" "}
        জন
      </span>
    </div>
  );
}
