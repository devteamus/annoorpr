"use client";

import * as React from "react";
import { Check, Link2, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

/* ---------- ব্র্যান্ড আইকন (ইনলাইন SVG) ---------- */

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  );
}

function ChatGPTIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.8956zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" />
    </svg>
  );
}

function GeminiIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 1.5l2.28 6.54a4 4 0 0 0 2.47 2.47l6.54 2.28a.27.27 0 0 1 0 .51l-6.54 2.28a4 4 0 0 0-2.47 2.47L12 24l-2.28-6.54a4 4 0 0 0-2.47-2.47L1 12.75a.27.27 0 0 1 0-.51l6.54-2.28a4 4 0 0 0 2.47-2.47Z" transform="translate(0 -0.75) scale(1 0.96)" />
    </svg>
  );
}

/* ---------- মূল কম্পোনেন্ট ---------- */

interface ShareButtonsProps {
  slug: string;
  title: string;
  /** পূর্ণ canonical URL (OG প্রিভিউয়ের উৎস) */
  url: string;
  /** শর্ট শেয়ার URL — যেমন https://annoor.xyz/s/aB3xZ9 */
  shortUrl: string;
  initialCount: number;
}

type Network = "facebook" | "whatsapp" | "chatgpt" | "gemini" | "copy" | "native";

export function ShareButtons({
  slug,
  title,
  url,
  shortUrl,
  initialCount,
}: ShareButtonsProps) {
  const [count, setCount] = React.useState(initialCount);
  const [copied, setCopied] = React.useState(false);
  const [geminiHint, setGeminiHint] = React.useState(false);
  const countedRef = React.useRef<string | null>(null);

  // শেয়ার কাউন্ট — প্রতি সেশনে একবারই +১ হয় (অতিরিক্ত ইনফ্লেশন আটকায়)
  const trackShare = React.useCallback(
    (network: Network) => {
      const once = `${slug}:${network}`;
      if (countedRef.current === once) return;
      countedRef.current = once;
      setCount((c) => c + 1); // আশাবাদী আপডেট — UI সাথে সাথে বদলায়
      fetch(`/api/blogs/${encodeURIComponent(slug)}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ network }),
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((d: { total?: number } | null) => {
          if (d && typeof d.total === "number") setCount(d.total);
        })
        .catch(() => {});
    },
    [slug]
  );

  const shareText = `${title} — আন-নূর`;

  const openWindow = (href: string) => {
    window.open(href, "_blank", "noopener,noreferrer,width=680,height=640");
  };

  const onFacebook = () => {
    trackShare("facebook");
    openWindow(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shortUrl)}`
    );
  };

  const onWhatsApp = () => {
    trackShare("whatsapp");
    openWindow(`https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shortUrl}`)}`);
  };

  const onChatGPT = () => {
    trackShare("chatgpt");
    // ChatGPT ?q= প্যারামিটার দিয়ে প্রম্পট প্রি-ফিল হয়
    openWindow(
      `https://chatgpt.com/?q=${encodeURIComponent(
        `এই আর্টিকেলটি পড়ে মূল পয়েন্টগুলো বাংলায় সংক্ষেপে আমাকে জানাও: ${url}`
      )}`
    );
  };

  const onGemini = async () => {
    trackShare("gemini");
    // Gemini-তে প্রি-ফিলের অফিসিয়াল প্যারামিটার নেই —
    // লিংক কপি করে সুন্দর প্রম্পট-সহ খুলে দেই
    try {
      await navigator.clipboard.writeText(
        `এই আর্টিকেলটি পড়ে মূল পয়েন্টগুলো বাংলায় সংক্ষেপে আমাকে জানাও: ${url}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // ক্লিপবোর্ড ব্লক হলেও Gemini খুলবে
    }
    setGeminiHint(true);
    setTimeout(() => setGeminiHint(false), 6000);
    window.open("https://gemini.google.com/app", "_blank", "noopener,noreferrer");
  };

  const onCopy = async () => {
    trackShare("copy");
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // পুরনো ব্রাউজার
      const ta = document.createElement("textarea");
      ta.value = shortUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const onNative = async () => {
    trackShare("native");
    if (navigator.share) {
      try {
        await navigator.share({ title: shareText, text: shareText, url: shortUrl });
      } catch {
        // ব্যবহারকারী বাতিল করলে কিছু করার নেই
      }
    } else {
      onCopy();
    }
  };

  const btn =
    "inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-input bg-background shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      {/* কাউন্ট — কতজন শেয়ার করেছেন */}
      <div className="flex items-center gap-2 font-bengali text-xs text-muted-foreground">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <Share2 className="h-4 w-4" aria-hidden="true" />
        </span>
        <span>
          <span className="font-bold text-foreground">
            {count.toLocaleString("bn-BD")}
          </span>{" "}
          জন শেয়ার করেছেন
        </span>
      </div>

      {/* শেয়ার বাটন */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={onFacebook}
          className={cn(btn, "text-[#1877F2] hover:border-[#1877F2]/50 hover:bg-[#1877F2]/5")}
          aria-label="ফেসবুকে শেয়ার করুন"
          title="ফেসবুকে শেয়ার করুন"
        >
          <FacebookIcon className="h-4.5 w-4.5" />
        </button>
        <button
          onClick={onWhatsApp}
          className={cn(btn, "text-[#25D366] hover:border-[#25D366]/50 hover:bg-[#25D366]/5")}
          aria-label="হোয়াটসঅ্যাপে শেয়ার করুন"
          title="হোয়াটসঅ্যাপে শেয়ার করুন"
        >
          <WhatsAppIcon className="h-4.5 w-4.5" />
        </button>
        <button
          onClick={onChatGPT}
          className={cn(btn, "text-foreground hover:border-emerald-500/50 hover:bg-emerald-500/5")}
          aria-label="ChatGPT-তে জিজ্ঞেস করুন"
          title="ChatGPT-তে জিজ্ঞেস করুন"
        >
          <ChatGPTIcon className="h-4.5 w-4.5" />
        </button>
        <button
          onClick={onGemini}
          className={cn(btn, "text-[#4E86FF] hover:border-[#4E86FF]/50 hover:bg-[#4E86FF]/5")}
          aria-label="Gemini-তে জিজ্ঞেস করুন"
          title="Gemini — প্রম্পট কপি হবে"
        >
          <GeminiIcon className="h-4.5 w-4.5" />
        </button>
        <button
          onClick={onCopy}
          className={cn(
            btn,
            copied
              ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "text-muted-foreground hover:border-emerald-500/40 hover:bg-emerald-500/5"
          )}
          aria-label="শর্ট লিংক কপি করুন"
          title={copied ? "কপি হয়েছে!" : "শর্ট লিংক কপি করুন"}
        >
          {copied ? (
            <Check className="h-4.5 w-4.5" aria-hidden="true" />
          ) : (
            <Link2 className="h-4.5 w-4.5" aria-hidden="true" />
          )}
        </button>
        <button
          onClick={onNative}
          className="inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 font-bengali text-xs font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-md"
          aria-label="শেয়ার করুন"
        >
          <Share2 className="h-4 w-4" aria-hidden="true" />
          শেয়ার
        </button>
      </div>

      {/* Gemini-তে পেস্ট করার রিমাইন্ডার — Gemini-র কোনো অফিসিয়াল prefill নেই */}
      {geminiHint && (
        <p className="w-full font-bengali text-[11px] text-[#4E86FF]" role="status">
          প্রম্পট কপি হয়েছে — Gemini ট্যাবে গিয়ে পেস্ট (Ctrl+V) করে Enter চাপুন।
        </p>
      )}
    </div>
  );
}
