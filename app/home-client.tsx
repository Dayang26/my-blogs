'use client';

import Link from 'next/link';
import { useBlogLanguage } from '@/hooks/useBlogLanguage';
import { LANGS, type PostListItem } from '@/types/blog';
import { formatBlogDate, getI18n, getLanguageLabel, getTagLabel } from '@/lib/blog-shared';

type HomeStats = {
  total: number;
  tags: number;
  series: number;
};

type HomeClientProps = {
  posts: PostListItem[];
  stats: HomeStats;
};

const uiText = {
  zh: {
    site: { name: 'HandTrack 3D', tagline: '探索 · 构建 · 分享' },
    hero: {
      title: '探索 · 构建 · 分享',
      subtitle: '一个关于手势追踪、3D 交互与前端开发的个人博客',
    },
    stats: { posts: '篇文章', tags: '个标签', series: '个系列' },
    section: { recent: '最新文章', viewAll: '查看全部 →', quick: '快捷入口' },
    quickLinks: [], // 移除快速链接
    nav: { blog: '博客' }, // 只保留博客导航
    footer: '版权所有',
  },
  en: {
    site: { name: 'HandTrack 3D', tagline: 'Explore · Build · Share' },
    hero: {
      title: 'Explore · Build · Share',
      subtitle: 'A personal blog about hand tracking, 3D interaction, and frontend development',
    },
    stats: { posts: 'posts', tags: 'tags', series: 'series' },
    section: { recent: 'Recent Posts', viewAll: 'View All →', quick: 'Quick Access' },
    quickLinks: [], // 移除快速链接
    nav: { blog: 'Blog' }, // 只保留博客导航
    footer: 'All rights reserved',
  },
};

function StatCard({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-slate-700/50 bg-slate-900/60 px-6 py-4">
      <span className="text-2xl font-bold text-cyan-300">{value}</span>
      <span className="mt-1 text-xs font-mono uppercase tracking-[0.15em] text-slate-400">{label}</span>
    </div>
  );
}

function PostCard({ post, lang }: { post: PostListItem; lang: 'zh' | 'en' }) {
  const content = getI18n(post, lang);
  if (!content) return null;

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="pixel-card animate-rise group flex h-full flex-col gap-3 p-4"
    >
      <div className="flex flex-wrap gap-2 text-xs font-mono uppercase tracking-[0.2em] text-slate-400">
        {post.tags.slice(0, 2).map((tag: string) => (
          <span key={tag}>{getTagLabel(tag, lang)}</span>
        ))}
      </div>
      <h3 className="text-sm font-bold uppercase tracking-[0.1em] group-hover:text-cyan-100 line-clamp-2">
        {content.title}
      </h3>
      <p className="text-xs text-slate-300 line-clamp-2 flex-1">{content.excerpt}</p>
      <div className="flex items-center justify-between text-xs font-mono text-slate-500">
        <span>{formatBlogDate(post.date)}</span>
        <span>{content.readMinutes} min</span>
      </div>
    </Link>
  );
}

export function HomeClient({ posts, stats }: HomeClientProps) {
  const { lang, setLang } = useBlogLanguage('en');
  const copy = uiText[lang];

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.10),_rgba(15,23,42,0.95))]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col px-6">
        {/* ─── Header ─── */}
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 py-5">
          <Link href="/" className="text-lg font-bold uppercase tracking-[0.2em] text-cyan-300">
            {copy.site.name}
          </Link>
          <nav className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-[0.2em]">
              <Link href="/blog" className="pixel-chip px-3 py-2">{copy.nav.blog}</Link>
            </div>
            <div className="flex items-center rounded-lg border border-slate-700/50 bg-slate-900/50 p-0.5">
              {LANGS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setLang(option)}
                  className={`relative px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] transition-colors ${
                    lang === option ? 'text-cyan-100' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {lang === option && (
                    <span className="absolute inset-0 rounded-md bg-cyan-500/10" />
                  )}
                  {getLanguageLabel(option)}
                </button>
              ))}
            </div>
          </nav>
        </header>

        {/* ─── Hero ─── */}
        <section className="flex flex-col items-center gap-6 py-20 text-center md:py-28">
          <h1 className="text-4xl font-bold uppercase tracking-[0.15em] md:text-5xl">
            {copy.hero.title}
          </h1>
          <p className="max-w-xl text-sm font-mono leading-relaxed text-slate-300 md:text-base">
            {copy.hero.subtitle}
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-4">
            <StatCard value={stats.total} label={copy.stats.posts} />
            <StatCard value={stats.tags} label={copy.stats.tags} />
            <StatCard value={stats.series} label={copy.stats.series} />
          </div>
        </section>

        {/* ─── Recent Posts ─── */}
        <section className="flex flex-col gap-6 pb-12">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold uppercase tracking-[0.15em]">
              {copy.section.recent}
            </h2>
            <Link
              href="/blog"
              className="text-xs font-mono uppercase tracking-[0.2em] text-cyan-300 hover:text-cyan-200"
            >
              {copy.section.viewAll}
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} lang={lang} />
            ))}
          </div>
        </section>

        {/* ─── Footer ─── */}
        <footer className="mt-auto border-t border-white/10 py-8">
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-500">
            <span>
              &copy; {new Date().getFullYear()} {copy.site.name}. {copy.footer}.
            </span>
            <div className="flex gap-4">
              <Link href="/" className="hover:text-slate-300">Home</Link>
              <Link href="/blog" className="hover:text-slate-300">Blog</Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
