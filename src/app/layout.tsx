import type { Metadata, Viewport } from "next";
import { ShellProviders } from "@/components/layout/ShellProviders";
import { absoluteUrl, siteConfig } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — Live Mature & MILF Cams`,
    template: `%s | ${siteConfig.name}`,
  },
  description:
    "Watch live mature, MILF, cougar and mom webcam models in HD. Fast mobile browsing and SEO-friendly model profiles — 18+ only.",
  keywords: siteConfig.defaultTags,
  applicationName: siteConfig.name,
  alternates: {
    canonical: absoluteUrl("/"),
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: absoluteUrl("/"),
    siteName: siteConfig.name,
    title: `${siteConfig.name} — Live Mature & MILF Cams`,
    description:
      "Discover live mature and MILF webcam performers. Mobile-first HD thumbnails and live room previews.",
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — Live Mature & MILF Cams`,
    description:
      "Live mature, MILF and cougar cams — browse models and watch free live rooms. 18+ only.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  category: "adult",
};

export const viewport: Viewport = {
  themeColor: "#08090B",
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="flex min-h-full flex-col bg-background text-foreground antialiased">
        <ShellProviders>{children}</ShellProviders>
      </body>
    </html>
  );
}
