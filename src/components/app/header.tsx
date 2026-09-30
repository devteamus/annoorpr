"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Home,
  History,
  BookOpen,
  LayoutDashboard,
  Menu,
  Heart,
  Volume2,
  Shield,
  Clock,
  ShoppingBag,
} from "lucide-react";
import { cn } from "@/lib/utils";

// নেভিগেশন এখন আসল লিংক — সার্ভার-রেন্ডার্ড, indexable ক্লিন URL
const NAV_ITEMS = [
  { key: "home", href: "/", label: "হোম", icon: Home },
  { key: "names-of-allah", href: "/names-of-allah", label: "৯৯ নাম", icon: Volume2 },
  { key: "ruqyah", href: "/ruqyah", label: "রুকইয়াহ", icon: Shield },
  { key: "namaz", href: "/namaz", label: "নামাজ", icon: Clock },
  { key: "blog", href: "/blog", label: "ব্লগ", icon: BookOpen },
  { key: "shop", href: "/books", label: "বই", icon: ShoppingBag },
  { key: "history", href: "/history", label: "ইতিহাস", icon: History },
] as const;

export function AppHeader() {
  const pathname = usePathname();
  const view = useAppStore((s) => s.view);
  const goHome = useAppStore((s) => s.goHome);
  const goAdminLogin = useAppStore((s) => s.goAdminLogin);
  const [open, setOpen] = React.useState(false);

  const isActive = (key: string) => {
    if (key === "home") return pathname === "/";
    if (key === "blog") return pathname.startsWith("/blog");
    if (key === "shop") return pathname.startsWith("/books");
    return pathname === `/${key}`;
  };

  const isAdminActive =
    view.name === "admin-login" || view.name === "admin-dashboard";

  const close = () => setOpen(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-3 sm:px-6">
        {/* Logo */}
        <button
          onClick={goHome}
          className="flex items-center gap-2.5 cursor-pointer group"
          aria-label="হোমে যান"
        >
          <span className="relative grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20 transition-transform group-hover:scale-105">
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 21h18" />
              <path d="M5 21V11a7 7 0 0 1 14 0v10" />
              <path d="M12 3v3" />
              <circle cx="12" cy="14" r="1.5" fill="currentColor" />
            </svg>
          </span>
          <span className="flex flex-col items-start leading-none">
            <span className="font-bengali text-base font-bold tracking-tight text-foreground sm:text-lg">
              আন-নূর
            </span>
            <span className="hidden text-[11px] text-muted-foreground sm:block">
              দুআ কাউন্টার ও ইসলামিক ব্লগ
            </span>
          </span>
        </button>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.key);
            return (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  "inline-flex h-9 items-center gap-1.5 rounded-full px-3 font-bengali text-sm font-medium transition-colors",
                  active
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden xl:inline">{item.label}</span>
              </Link>
            );
          })}
          <Button
            variant="ghost"
            size="sm"
            onClick={goAdminLogin}
            className={cn(
              "gap-1.5 cursor-pointer rounded-full font-bengali text-sm font-medium",
              isAdminActive && "bg-accent"
            )}
            aria-label="অ্যাডমিন"
          >
            <LayoutDashboard className="h-4 w-4" />
            অ্যাডমিন
          </Button>
          <div className="ml-1">
            <ThemeToggle />
          </div>
        </nav>

        {/* Mobile: theme toggle + hamburger */}
        <div className="flex items-center gap-1 lg:hidden">
          <ThemeToggle />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full cursor-pointer"
                aria-label="মেনু"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 p-0">
              <SheetHeader className="px-5 pt-5 pb-3">
                <SheetTitle className="font-bengali text-left text-lg">
                  মেনু
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-3">
                <MobileNavItem
                  icon={Home}
                  label="হোম"
                  desc="দুআ কাউন্টার"
                  active={isActive("home")}
                  href="/"
                  onClick={close}
                />
                <MobileNavItem
                  icon={Volume2}
                  label="আল্লাহর ৯৯ নাম"
                  desc="অডিও সহ আসমাউল হুসনা"
                  active={isActive("names-of-allah")}
                  href="/names-of-allah"
                  onClick={close}
                />
                <MobileNavItem
                  icon={Shield}
                  label="রুকইয়াহ"
                  desc="রিজিক, বদনজর, যাদু চিকিৎসা"
                  active={isActive("ruqyah")}
                  href="/ruqyah"
                  onClick={close}
                />
                <MobileNavItem
                  icon={Clock}
                  label="পাঁচ ওয়াক্ত নামাজ"
                  desc="পড়ার নিয়ম — ভিডিও সহ"
                  active={isActive("namaz")}
                  href="/namaz"
                  onClick={close}
                />
                <MobileNavItem
                  icon={BookOpen}
                  label="ব্লগ"
                  desc="ইসলামিক আর্টিকেল"
                  active={isActive("blog")}
                  href="/blog"
                  onClick={close}
                />
                <MobileNavItem
                  icon={ShoppingBag}
                  label="ইসলামিক বই"
                  desc="শপ — রকমারি বই"
                  active={isActive("shop")}
                  href="/books"
                  onClick={close}
                />
                <MobileNavItem
                  icon={History}
                  label="ইতিহাস"
                  desc="আমলের হিসাব"
                  active={isActive("history")}
                  href="/history"
                  onClick={close}
                />
                <div className="my-2 h-px bg-border/60" />
                <MobileNavItem
                  icon={LayoutDashboard}
                  label="অ্যাডমিন"
                  desc="ব্লগ পাবলিশ"
                  active={isAdminActive}
                  onClick={() => {
                    close();
                    goAdminLogin();
                  }}
                />
              </nav>
              <div className="mt-auto px-5 pb-6 pt-4">
                <div className="flex items-center gap-2 rounded-lg bg-emerald-500/5 p-3 text-emerald-700 dark:text-emerald-300">
                  <Heart className="h-4 w-4 shrink-0" />
                  <p className="font-bengali text-xs">
                    আল্লাহ আমাদের আমল করার তৌফিক দিন। আমিন।
                  </p>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

function MobileNavItem({
  icon: Icon,
  label,
  desc,
  active,
  href,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  desc: string;
  active: boolean;
  href?: string;
  onClick: () => void;
}) {
  const content = (
    <span className="flex items-center gap-3">
      <span
        className={cn(
          "grid h-9 w-9 shrink-0 place-items-center rounded-lg",
          active
            ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white"
            : "bg-muted text-muted-foreground"
        )}
      >
        <Icon className="h-5 w-5" />
      </span>
      <span className="flex flex-col">
        <span className="font-bengali text-sm font-semibold">{label}</span>
        <span className="font-bengali text-[11px] text-muted-foreground">
          {desc}
        </span>
      </span>
    </span>
  );

  const cls = cn(
    "rounded-lg px-3 py-2.5 text-left transition-colors",
    active ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
  );

  if (href) {
    return (
      <Link href={href} onClick={onClick} className={cls}>
        {content}
      </Link>
    );
  }
  return (
    <button onClick={onClick} className={cn(cls, "cursor-pointer")}>
      {content}
    </button>
  );
}
