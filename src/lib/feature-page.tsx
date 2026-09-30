// ফিচার পেজ ফ্যাক্টরি — রুকইয়াহ/নামাজ/৯৯ নাম/ইতিহাসের মতো ভিউয়ের জন্য
// সার্ভার-রেন্ডার্ড SEO-complete পেজ বানায়।
import type { Metadata } from "next";
import { ViewShell } from "@/components/app/view-shell";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://annoor.xyz";

export interface FeaturePageConfig {
  path: string; // যেমন "/ruqyah"
  title: string; // মেটা টাইটেল
  heading: string;
  description: string;
  jsonLd?: Record<string, unknown>;
  noindex?: boolean;
}

export function makeFeaturePage(
  config: FeaturePageConfig,
  View: React.ComponentType
) {
  const url = `${BASE_URL}${config.path}`;

  const metadata: Metadata = {
    title: config.title,
    description: config.description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "bn_BD",
      url,
      siteName: "আন-নূর",
      title: config.heading,
      description: config.description,
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: config.heading }],
    },
    twitter: {
      card: "summary_large_image",
      title: config.heading,
      description: config.description,
      images: ["/og-image.png"],
    },
    // ব্যক্তিগত ডেটা-নির্ভর পেজ (যেমন ইতিহাস) ইনডেক্স করার মতো নয়
    ...(config.noindex
      ? { robots: { index: false, follow: true } }
      : { robots: { index: true, follow: true } }),
  };

  function Page() {
    return (
      <ViewShell>
        <View />
        {config.jsonLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(config.jsonLd) }}
          />
        )}
      </ViewShell>
    );
  }

  return { Page, metadata };
}
