"use client";

import { VisitorCounter } from "@/components/app/visitor-counter";

export function AppFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border/60 bg-background/80 backdrop-blur-sm">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {/* 4-column layout */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
          {/* Column 1: কপিরাইট */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
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
              <h3 className="font-bengali text-sm font-semibold text-foreground">
                কপিরাইট
              </h3>
            </div>
            <div className="space-y-1">
              <p className="font-bengali text-xs leading-relaxed text-muted-foreground">
                ©{year} An-noor, সর্বস্বত্ব সংরক্ষিত।
              </p>
              <p className="font-bengali text-xs leading-relaxed text-muted-foreground">
                ডেভেলপার:{" "}
                <a
                  href="https://www.facebook.com/iFaisalusa"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block py-1 font-semibold text-emerald-700 underline-offset-2 hover:underline dark:text-emerald-400"
                >
                  Faisal Hossain
                </a>
              </p>
            </div>
          </div>

          {/* Column 2: দুআ ও আমল — ক্লিন URL, SEO ইন্টারলিংকিং */}
          <div className="flex flex-col gap-3">
            <h3 className="font-bengali text-sm font-semibold text-foreground">
              দুআ ও আমল
            </h3>
            <nav
              aria-label="দুআ ও আমল"
              className="flex flex-col items-start gap-2"
            >
              <a
                href="/daily-duas"
                className="font-bengali text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
              >
                প্রতিদিনের গুরুত্বপূর্ণ দোয়া
              </a>
              <a
                href="/after-prayer"
                className="font-bengali text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
              >
                নামাজের পরের আমল
              </a>
              <a
                href="/rizq"
                className="font-bengali text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
              >
                রিজিক বাড়ানোর আমল
              </a>
              <a
                href="/forgiveness"
                className="font-bengali text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
              >
                গুনাহ মাফের আমল
              </a>
              <a
                href="/ruqyah"
                className="font-bengali text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
              >
                রুকইয়াহ
              </a>
              <a
                href="/names-of-allah"
                className="font-bengali text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
              >
                আল্লাহর ৯৯ নাম
              </a>
              <a
                href="/namaz"
                className="font-bengali text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
              >
                নামাজ শিক্ষা
              </a>
            </nav>
          </div>

          {/* Column 3: সাহায্য ও প্রশ্নোত্তর — আলাদা পেজ লিংক */}
          <div className="flex flex-col gap-3">
            <h3 className="font-bengali text-sm font-semibold text-foreground">
              সাহায্য ও প্রশ্নোত্তর
            </h3>
            <nav
              aria-label="সাহায্য ও প্রশ্নোত্তর"
              className="flex flex-col items-start gap-2"
            >
              <a
                href="/blog"
                className="font-bengali text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
              >
                ইসলামিক ব্লগ
              </a>
              <a
                href="/books"
                className="font-bengali text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
              >
                ইসলামিক বই
              </a>
              <a
                href="/contact"
                className="font-bengali text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
              >
                যোগাযোগ
              </a>
              <a
                href="/privacy"
                className="font-bengali text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
              >
                Privacy policy
              </a>
              <a
                href="/terms"
                className="font-bengali text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
              >
                শর্তাবলী
              </a>
            </nav>
          </div>

          {/* Column 4: কিছু কথা */}
          <div className="flex flex-col gap-3 sm:col-span-2 md:col-span-1">
            <h3 className="font-bengali text-sm font-semibold text-foreground">
              কিছু কথা
            </h3>
            <p className="font-bengali text-xs leading-relaxed text-muted-foreground">
              আন-নূর একটি সম্পূর্ণ ব্যক্তিগত উদ্যোগে পরিচালিত দ্বীনভিত্তিক
              প্রজেক্ট। এটি কোনো দল বা সংগঠনের অন্তর্ভুক্ত নয়। আপনাদের
              আন্তরিক সহযোগিতা এই কল্যাণময় কাজকে আরও বেগবান ও বিস্তৃত
              করতে সহায়তা করবে, ইন-শা-আল্লাহ।
            </p>
          </div>
        </div>

        {/* Bottom bar: যোগাযোগ + ভিজিটর কাউন্টার */}
        <div className="mt-6 flex flex-col gap-3 border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
            <h4 className="font-bengali text-xs font-semibold text-foreground">
              যোগাযোগ
            </h4>
            <div className="flex flex-col gap-1 text-[11px] sm:flex-row sm:items-center sm:gap-3">
              <a
                href="mailto:ifaisal.eth@gmail.com"
                className="inline-block py-2 font-bengali text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
              >
                ifaisal.eth@gmail.com
              </a>
              <span className="hidden text-muted-foreground/40 sm:inline">·</span>
              <a
                href="https://www.facebook.com/iFaisalusa"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block py-2 font-bengali text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
              >
                facebook.com/iFaisalusa
              </a>
            </div>
          </div>
          {/* ভিজিটর কাউন্টার — বাংলায় */}
          <VisitorCounter />
        </div>
      </div>
    </footer>
  );
}
