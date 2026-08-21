import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { CommandMenu } from "@/components/search/CommandMenu";
import { SITE_URL } from "@/lib/blog-shared";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "SnowLine — Aaron Hu 的个人博客",
    template: "%s | SnowLine",
  },
  description: "关于前端开发、技术探索与个人成长的博客，遵循现代极简与数字工匠美学。",
  alternates: {
    types: {
      "application/rss+xml": `${SITE_URL}/rss.xml`,
    },
  },
  robots: {
    index: true,
    follow: true,
  },
};

const themeScript = `
  (function() {
    try {
      var saved = localStorage.getItem('snowline_theme_preference');
      var mql = window.matchMedia('(prefers-color-scheme: dark)');
      var isDark = saved === 'dark' || (!saved && mql.matches) || (saved === 'system' && mql.matches);
      if (isDark) {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.setAttribute('data-theme', 'light');
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {}
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} antialiased relative min-h-screen bg-[var(--bg)] text-[var(--text-primary)] selection:bg-[var(--accent-subtle)] selection:text-[var(--accent)]`}
      >
        <ThemeProvider>
          {/* Subtle grid background */}
          <div 
            className="pointer-events-none fixed inset-0 z-0 bg-grid-pattern opacity-100" 
            aria-hidden="true" 
          />
          <div className="relative z-10 flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <CommandMenu />
        </ThemeProvider>
      </body>
    </html>
  );
}
