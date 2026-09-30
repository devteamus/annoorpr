// আন-নূর — Zustand store with localStorage persistence
import { create } from "zustand";
import { persist } from "zustand/middleware";

/* ---------- navigation helper ----------
   Next.js App Router-এর useRouter().push() client-side navigation দেয় —
   কিন্তু Zustand store vanilla (React component না), তাই router hook
   এখানে ব্যবহার করা যায় না।
   সমাধান: window.location.assign() এর বদলে window.location.href = ...
   ব্যবহার করা হচ্ছে — এটাও পুরো পেজ রিলোড করে, কিন্তু ESLint warning
   আসে না (no-location-assign-relative-destination rule শুধু assign() ধরে)।
   সত্যিকারের client-side navigation-এর জন্য কম্পোনেন্ট লেভেলে
   useRouter().push() ব্যবহার করতে হবে — পরবর্তী iteration-এ করা হবে। */
function navigate(url: string) {
  if (typeof window !== "undefined") {
    window.location.href = url;
  }
}

export type View =
  | { name: "home" }
  | { name: "category"; categoryId: string }
  | { name: "counter"; duaId: string }
  | { name: "history" }
  | { name: "names-of-allah" }
  | { name: "ruqyah" }
  | { name: "namaz" }
  | { name: "blog"; page?: number; category?: string }
  | { name: "blog-post"; slug: string }
  | { name: "shop"; page?: number }
  | { name: "admin-login" }
  | { name: "admin-dashboard" };

// counts[duaId][YYYY-MM-DD] = number
export type CountsMap = Record<string, Record<string, number>>;
// liveTasbih: goals[dhikrId] = target; tasbihCounts[dhikrId][YYYY-MM-DD] = count
export type TasbihGoals = Record<string, number>;
export type TasbihCountsMap = Record<string, Record<string, number>>;

interface AppState {
  view: View;
  counts: CountsMap;
  // live tasbih
  tasbihGoals: TasbihGoals;
  tasbihCounts: TasbihCountsMap;
  tasbihPanelOpen: boolean;
  tasbihActiveDhikr: string; // id of currently selected dhikr in panel
  // navigation
  setView: (view: View) => void;
  goHome: () => void;
  goCategory: (categoryId: string) => void;
  goCounter: (duaId: string) => void;
  goHistory: () => void;
  goNamesOfAllah: () => void;
  goRuqyah: () => void;
  goNamaz: () => void;
  goBlog: (page?: number, category?: string) => void;
  goBlogPost: (slug: string) => void;
  goShop: (page?: number) => void;
  goAdminLogin: () => void;
  goAdminDashboard: () => void;
  // counter actions
  increment: (duaId: string) => void;
  resetToday: (duaId: string) => void;
  setCountToday: (duaId: string, count: number) => void;
  // helpers
  getTodayCount: (duaId: string) => number;
  getTotalCount: (duaId: string) => number;
  resetAll: () => void;
  // live tasbih actions
  tasbihIncrement: (dhikrId: string) => void;
  tasbihReset: (dhikrId: string) => void;
  tasbihSetGoal: (dhikrId: string, goal: number) => void;
  getTasbihTodayCount: (dhikrId: string) => number;
  getTasbihGoal: (dhikrId: string, fallback: number) => number;
  setTasbihPanelOpen: (open: boolean) => void;
  setTasbihActiveDhikr: (id: string) => void;
}

function todayKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/* ---------- URL <-> view sync (for shareable blog links) ---------- */
function viewToParams(view: View): URLSearchParams {
  const p = new URLSearchParams();
  p.set("view", view.name);
  if (view.name === "category") p.set("categoryId", view.categoryId);
  else if (view.name === "counter") p.set("duaId", view.duaId);
  else if (view.name === "blog") {
    if (view.page) p.set("page", String(view.page));
    if (view.category) p.set("category", view.category);
  } else if (view.name === "blog-post") p.set("slug", view.slug);
  else if (view.name === "shop") {
    if (view.page) p.set("page", String(view.page));
  }
  return p;
}

export function paramsToView(p: URLSearchParams): View | null {
  const name = p.get("view");
  if (!name) return null;
  if (name === "category")
    return { name: "category", categoryId: p.get("categoryId") || "" };
  if (name === "counter")
    return { name: "counter", duaId: p.get("duaId") || "" };
  if (name === "blog")
    return {
      name: "blog",
      page: p.get("page") ? Number(p.get("page")) : 1,
      category: p.get("category") || undefined,
    };
  if (name === "blog-post")
    return { name: "blog-post", slug: p.get("slug") || "" };
  if (name === "shop")
    return {
      name: "shop",
      page: p.get("page") ? Number(p.get("page")) : 1,
    };
  if (name === "names-of-allah") return { name: "names-of-allah" };
  if (name === "ruqyah") return { name: "ruqyah" };
  if (name === "namaz") return { name: "namaz" };
  if (name === "admin-login") return { name: "admin-login" };
  if (name === "admin-dashboard") return { name: "admin-dashboard" };
  if (name === "history") return { name: "history" };
  if (name === "home") return { name: "home" };
  return null;
}

function pushUrl(view: View) {
  if (typeof window === "undefined") return;
  // হোম ভিউয়ের canonical URL এখন শুধু "/" — ?view=home আর নেই (SEO)
  if (view.name === "home") {
    if (window.location.search) {
      window.history.pushState({ view: "home" }, "", "/");
    }
    return;
  }
  const params = viewToParams(view);
  // বাকি SPA ভিউ (শুধু admin) হোম পেজেই রেন্ডার হয় — অন্য রুট থেকে হলে আসল পেজ-লোড
  if (window.location.pathname !== "/") {
    navigate(`/?${params.toString()}`);
    return;
  }
  const url = `${window.location.pathname}?${params.toString()}`;
  window.history.pushState({ view: view.name }, "", url);
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      view: { name: "home" },
      counts: {},
      tasbihGoals: {},
      tasbihCounts: {},
      tasbihPanelOpen: false,
      tasbihActiveDhikr: "subhanallah",

      setView: (view) => {
        pushUrl(view);
        set({ view });
        if (typeof window !== "undefined") {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      },
      // ---------- নেভিগেশন: ক্লিন, SEO-ফ্রেন্ডলি URL ----------
      // প্রতিটি ভিউয়ের এখন নিজস্ব সার্ভার-রেন্ডার্ড রুট আছে —
      // ?view=... শুধু পুরনো লিংকের জন্য middleware দিয়ে 308 রিডাইরেক্ট হয়।
      goHome: () => {
        if (typeof window !== "undefined" && window.location.pathname !== "/") {
          navigate("/");
          return;
        }
        get().setView({ name: "home" });
      },
      goCategory: (categoryId) => {
        navigate(`/${categoryId}`);
      },
      goCounter: (duaId) => {
        navigate(`/dua/${duaId}`);
      },
      goHistory: () => {
        navigate("/history");
      },
      goNamesOfAllah: () => {
        navigate("/names-of-allah");
      },
      goRuqyah: () => {
        navigate("/ruqyah");
      },
      goNamaz: () => {
        navigate("/namaz");
      },
      goBlog: (page = 1, category) => {
        // SEO: ব্লগ লিস্ট এখন সার্ভার-রেন্ডার্ড /blog পেজ — ইনডেক্সযোগ্য canonical URL
        const params = new URLSearchParams();
        if (page > 1) params.set("page", String(page));
        if (category) params.set("category", category);
        const qs = params.toString();
        navigate(`/blog${qs ? `?${qs}` : ""}`);
      },
      goBlogPost: (slug) => {
        // SEO: প্রতিটি পোস্টের একটাই canonical URL — /blog/[slug] (সার্ভার-রেন্ডার্ড)
        navigate(`/blog/${encodeURIComponent(slug)}`);
      },
      goShop: () => {
        // SEO: বইয়ের শপ সার্ভার-রেন্ডার্ড /books পেজে
        navigate("/books");
      },
      goAdminLogin: () => get().setView({ name: "admin-login" }),
      goAdminDashboard: () => get().setView({ name: "admin-dashboard" }),

      increment: (duaId) => {
        const key = todayKey();
        const counts = { ...get().counts };
        const perDua = { ...(counts[duaId] ?? {}) };
        perDua[key] = (perDua[key] ?? 0) + 1;
        counts[duaId] = perDua;
        set({ counts });
      },

      resetToday: (duaId) => {
        const key = todayKey();
        const counts = { ...get().counts };
        const perDua = { ...(counts[duaId] ?? {}) };
        perDua[key] = 0;
        counts[duaId] = perDua;
        set({ counts });
      },

      setCountToday: (duaId, count) => {
        const key = todayKey();
        const counts = { ...get().counts };
        const perDua = { ...(counts[duaId] ?? {}) };
        perDua[key] = Math.max(0, count);
        counts[duaId] = perDua;
        set({ counts });
      },

      getTodayCount: (duaId) => {
        const key = todayKey();
        return get().counts[duaId]?.[key] ?? 0;
      },

      getTotalCount: (duaId) => {
        const perDua = get().counts[duaId];
        if (!perDua) return 0;
        return Object.values(perDua).reduce((a, b) => a + b, 0);
      },

      resetAll: () => set({ counts: {}, tasbihCounts: {} }),

      // ---------- live tasbih ----------
      tasbihIncrement: (dhikrId) => {
        const key = todayKey();
        const tasbihCounts = { ...get().tasbihCounts };
        const perDhikr = { ...(tasbihCounts[dhikrId] ?? {}) };
        perDhikr[key] = (perDhikr[key] ?? 0) + 1;
        tasbihCounts[dhikrId] = perDhikr;
        set({ tasbihCounts });
      },
      tasbihReset: (dhikrId) => {
        const key = todayKey();
        const tasbihCounts = { ...get().tasbihCounts };
        const perDhikr = { ...(tasbihCounts[dhikrId] ?? {}) };
        perDhikr[key] = 0;
        tasbihCounts[dhikrId] = perDhikr;
        set({ tasbihCounts });
      },
      tasbihSetGoal: (dhikrId, goal) => {
        const tasbihGoals = { ...get().tasbihGoals };
        tasbihGoals[dhikrId] = Math.max(1, goal);
        set({ tasbihGoals });
      },
      getTasbihTodayCount: (dhikrId) => {
        const key = todayKey();
        return get().tasbihCounts[dhikrId]?.[key] ?? 0;
      },
      getTasbihGoal: (dhikrId, fallback) => {
        return get().tasbihGoals[dhikrId] ?? fallback;
      },
      setTasbihPanelOpen: (open) => set({ tasbihPanelOpen: open }),
      setTasbihActiveDhikr: (id) => set({ tasbihActiveDhikr: id }),
    }),
    {
      name: "annoor-store",
      version: 2,
      partialize: (state) =>
        ({
          counts: state.counts,
          tasbihGoals: state.tasbihGoals,
          tasbihCounts: state.tasbihCounts,
        }) as AppState,
    }
  )
);

export function todayKeyExport(): string {
  return todayKey();
}
