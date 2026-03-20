'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useBlogLanguage } from '@/hooks/useBlogLanguage';
import type { Lang, PostListItem, SearchIndexItem, SeriesGroup } from '@/types/blog';
import { formatBlogDate, getLanguageLabel, getTagLabel } from '@/lib/blog-shared';

const PAGE_SIZE = 6;

type BlogIndexProps = {
  posts: PostListItem[];
  featured: PostListItem[];
  series: SeriesGroup[];
  changelog: PostListItem[];
  labNotes: PostListItem[];
  tags: string[];
  latestDate: string | null;
  stats: {
    total: number;
    tags: number;
    series: number;
  };
};

const uiText = {
  zh: {
    title: '试验记录与产品日志',
    description: '这里记录 HandTrack 3D 的实验过程、设计策略与产品更新。',
    primaryAction: '查看最新',
    secondaryAction: '订阅更新',
    stats: {
      posts: '文章',
      updated: '最近更新',
      tags: '主题',
      series: '系列',
    },
    control: {
      searchLabel: '搜索',
      search: '搜索标题、摘要或标签',
      sort: '排序',
      latest: '最新',
      oldest: '最早',
      read: '阅读时长',
      results: '条结果',
      clear: '清除',
    },
    section: {
      featured: '精选内容',
      latest: '最新日志',
      series: '系列路线',
      changelog: '更新日志',
      lab: '实验记录',
      subscribe: '订阅更新',
    },
    footer: {
      brand: 'HandTrack 3D Blog · Pixel UI · 2026',
      home: '回到主页',
      lab: '进入试验区',
    },
    misc: {
      loadMore: '加载更多',
      noResults: '没有匹配内容',
      indexLoading: '索引加载中',
      indexFailed: '索引加载失败',
      minutes: '分钟',
    },
  },
  en: {
    title: 'Experiments & Product Logs',
    description: 'Track HandTrack 3D experiments, design strategy, and product updates.',
    primaryAction: 'Latest Posts',
    secondaryAction: 'Subscribe',
    stats: {
      posts: 'Posts',
      updated: 'Last Update',
      tags: 'Topics',
      series: 'Series',
    },
    control: {
      searchLabel: 'Search',
      search: 'Search title, excerpt, or tags',
      sort: 'Sort',
      latest: 'Latest',
      oldest: 'Oldest',
      read: 'Read time',
      results: 'results',
      clear: 'Clear',
    },
    section: {
      featured: 'Featured',
      latest: 'Latest Logs',
      series: 'Series Map',
      changelog: 'Changelog',
      lab: 'Lab Notes',
      subscribe: 'Subscribe',
    },
    footer: {
      brand: 'HandTrack 3D Blog · Pixel UI · 2026',
      home: 'Back Home',
      lab: 'Open Lab',
    },
    misc: {
      loadMore: 'Load More',
      noResults: 'No matching posts',
      indexLoading: 'Loading index',
      indexFailed: 'Failed to load index',
      minutes: 'min',
    },
  },
};

const getI18n = (post: PostListItem, lang: Lang) => post.i18n[lang] ?? post.i18n.zh ?? post.i18n.en;

export default function BlogIndexClient({
  posts,
  featured,
  series,
  changelog,
  labNotes,
  tags,
  latestDate,
  stats,
}: BlogIndexProps) {
  const { lang, setLang } = useBlogLanguage('zh');
  const copy = uiText[lang];
  const [query, setQuery] = useState('');
  const [activeTag, setActiveTag] = useState('All');
  const [sortBy, setSortBy] = useState<'latest' | 'oldest' | 'read'>('latest');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [indexItems, setIndexItems] = useState<SearchIndexItem[]>([]);
  const [indexReady, setIndexReady] = useState(false);
  const [indexError, setIndexError] = useState(false);

  useEffect(() => {
    let mounted = true;
    fetch('/searchIndex.json')
      .then((res) => (res.ok ? res.json() : Promise.reject(res.statusText)))
      .then((data: SearchIndexItem[]) => {
        if (!mounted) return;
        setIndexItems(data);
        setIndexReady(true);
      })
      .catch(() => {
        if (!mounted) return;
        setIndexError(true);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const resetVisible = () => setVisibleCount(PAGE_SIZE);

  const postsBySlug = useMemo(() => new Map(posts.map((post) => [post.slug, post])), [posts]);

  const filteredItems = useMemo(() => {
    if (!indexReady) return [];
    const normalizedQuery = query.trim().toLowerCase();
    const items = indexItems.filter((item) => item.lang === lang);

    const filtered = items.filter((item) => {
      if (activeTag !== 'All' && !item.tags.includes(activeTag)) return false;
      if (normalizedQuery && !item.searchText.includes(normalizedQuery)) return false;
      return true;
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'latest') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      return b.readMinutes - a.readMinutes;
    });
  }, [activeTag, indexItems, indexReady, lang, query, sortBy]);

  const visiblePosts = useMemo(() => {
    if (!indexReady) return posts.slice(0, visibleCount);
    const slice = filteredItems.slice(0, visibleCount);
    return slice.map((item) => postsBySlug.get(item.slug)).filter(Boolean) as PostListItem[];
  }, [filteredItems, indexReady, posts, postsBySlug, visibleCount]);

  const canLoadMore = indexReady
    ? filteredItems.length > visibleCount
    : posts.length > visibleCount;

  const resultsCount = indexReady ? filteredItems.length : posts.length;

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),_rgba(15,23,42,0.92))]" />
        <div className="pixel-grid absolute inset-0 opacity-50" />
        <div className="scanlines absolute inset-0 opacity-40" />
        <div className="absolute -left-24 top-24 h-64 w-64 rounded-full bg-cyan-400/10 blur-[120px]" />
        <div className="absolute right-0 top-1/3 h-80 w-80 rounded-full bg-indigo-400/10 blur-[140px]" />
      </div>

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 pb-24 pt-16">
        <header className="flex flex-col gap-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="pixel-chip inline-flex items-center gap-2 px-4 py-2 text-xs font-mono uppercase tracking-[0.35em]">
              Pixel Blog
            </div>
            <nav className="flex flex-wrap gap-3 text-xs font-mono uppercase tracking-[0.2em]">
              <Link href="/" className="pixel-chip px-3 py-2">
                Home
              </Link>
              <Link href="/hand-3d" className="pixel-button px-3 py-2 text-slate-950">
                Lab
              </Link>
            </nav>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="flex flex-col gap-4">
              <h1 className="text-3xl font-bold uppercase tracking-[0.12em] md:text-5xl">
                {copy.title}
              </h1>
              <p className="max-w-2xl text-sm font-mono leading-relaxed text-slate-200/90 md:text-base">
                {copy.description}
              </p>
              <div className="flex flex-wrap gap-3">
                <a href="#latest" className="pixel-button px-5 py-3 text-xs font-bold uppercase tracking-[0.2em]">
                  {copy.primaryAction}
                </a>
                <a href="#subscribe" className="pixel-chip px-5 py-3 text-xs font-bold uppercase tracking-[0.2em]">
                  {copy.secondaryAction}
                </a>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="pixel-card animate-rise flex flex-col gap-2 px-4 py-3" style={{ animationDelay: '40ms' }}>
                <div className="text-xs font-mono uppercase tracking-[0.2em] text-slate-400">
                  {copy.stats.posts}
                </div>
                <div className="text-2xl font-semibold">{stats.total}</div>
              </div>
              <div className="pixel-card animate-rise flex flex-col gap-2 px-4 py-3" style={{ animationDelay: '80ms' }}>
                <div className="text-xs font-mono uppercase tracking-[0.2em] text-slate-400">
                  {copy.stats.updated}
                </div>
                <div className="text-2xl font-semibold">{formatBlogDate(latestDate ?? undefined)}</div>
              </div>
              <div className="pixel-card animate-rise flex flex-col gap-2 px-4 py-3" style={{ animationDelay: '120ms' }}>
                <div className="text-xs font-mono uppercase tracking-[0.2em] text-slate-400">
                  {copy.stats.tags}
                </div>
                <div className="text-2xl font-semibold">{stats.tags}</div>
              </div>
              <div className="pixel-card animate-rise flex flex-col gap-2 px-4 py-3" style={{ animationDelay: '160ms' }}>
                <div className="text-xs font-mono uppercase tracking-[0.2em] text-slate-400">
                  {copy.stats.series}
                </div>
                <div className="text-2xl font-semibold">{stats.series}</div>
              </div>
            </div>
          </div>
        </header>

        <section className="sticky top-6 z-20 flex flex-col gap-4">
          <div className="pixel-panel flex flex-col gap-4 px-5 py-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <label className="flex w-full flex-1 items-center gap-3">
                <span className="text-xs font-mono uppercase tracking-[0.2em] text-slate-400">
                  {copy.control.searchLabel}
                </span>
                <input
                  type="search"
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    resetVisible();
                  }}
                  placeholder={copy.control.search}
                  className="pixel-input w-full"
                />
              </label>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-slate-400">
                  {copy.control.sort}
                </div>
                <select
                  value={sortBy}
                  onChange={(event) => {
                    setSortBy(event.target.value as 'latest' | 'oldest' | 'read');
                    resetVisible();
                  }}
                  className="pixel-input min-w-[160px] text-sm"
                >
                  <option value="latest">{copy.control.latest}</option>
                  <option value="oldest">{copy.control.oldest}</option>
                  <option value="read">{copy.control.read}</option>
                </select>
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setActiveTag('All');
                    resetVisible();
                  }}
                  className="pixel-chip px-3 py-2 text-xs font-bold uppercase tracking-[0.2em]"
                >
                  {copy.control.clear}
                </button>
                <div className="flex items-center rounded-full border border-slate-200/40 bg-slate-900/70 p-1">
                  {(['zh', 'en'] as Lang[]).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setLang(option);
                        resetVisible();
                      }}
                      className={`px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] transition ${
                        lang === option ? 'bg-cyan-400 text-slate-950' : 'text-slate-300'
                      }`}
                    >
                      {getLanguageLabel(option)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    setActiveTag(tag);
                    resetVisible();
                  }}
                  className={`pixel-chip px-3 py-2 text-xs font-bold uppercase tracking-[0.2em] ${
                    activeTag === tag ? 'border-cyan-200/80 text-cyan-100' : 'text-slate-300'
                  }`}
                >
                  {getTagLabel(tag, lang)}
                </button>
              ))}
            </div>

            <div className="text-xs font-mono text-slate-400">
              {indexError && copy.misc.indexFailed}
              {!indexError && !indexReady && copy.misc.indexLoading}
              {indexReady && `${resultsCount} ${copy.control.results}`}
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {featured.map((post, index) => {
            const content = getI18n(post, lang);
            if (!content) return null;
            return (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="pixel-card animate-rise group flex h-full flex-col gap-4 p-5 transition"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div className="text-xs font-mono uppercase tracking-[0.2em] text-cyan-200">
                  {copy.section.featured} · {getTagLabel(post.tags[0] ?? 'All', lang)}
                </div>
                <h2 className="text-lg font-bold uppercase tracking-[0.12em] group-hover:text-cyan-100">
                  {content.title}
                </h2>
                <p className="text-sm text-slate-200/90">{content.excerpt}</p>
                <div className="mt-auto flex items-center justify-between text-xs font-mono text-slate-300">
                  <span>{formatBlogDate(post.date)}</span>
                  <span>
                    {content.readMinutes} {copy.misc.minutes}
                  </span>
                </div>
              </Link>
            );
          })}
        </section>

        <section id="latest" className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold uppercase tracking-[0.12em]">
              {copy.section.latest}
            </h2>
            <div className="text-xs font-mono uppercase tracking-[0.2em] text-slate-400">
              {getTagLabel(activeTag, lang)}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {visiblePosts.map((post, index) => {
              const content = getI18n(post, lang);
              if (!content) return null;
              return (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="pixel-card animate-rise group flex h-full flex-col gap-3 p-5"
                  style={{ animationDelay: `${index * 40}ms` }}
                >
                  <div className="flex flex-wrap gap-2 text-xs font-mono uppercase tracking-[0.2em] text-slate-300">
                    {post.tags.slice(0, 3).map((tag) => (
                      <span key={tag}>{getTagLabel(tag, lang)}</span>
                    ))}
                  </div>
                  <h3 className="text-base font-bold uppercase tracking-[0.12em] group-hover:text-cyan-100">
                    {content.title}
                  </h3>
                  <p className="text-sm text-slate-200/90">{content.excerpt}</p>
                  <div className="mt-auto flex items-center justify-between text-xs font-mono text-slate-300">
                    <span>{formatBlogDate(post.date)}</span>
                    <span>
                      {content.readMinutes} {copy.misc.minutes}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          {indexReady && visiblePosts.length === 0 && (
            <div className="pixel-card px-5 py-6 text-center text-sm text-slate-300">
              {copy.misc.noResults}
            </div>
          )}

          {canLoadMore && (
            <button
              type="button"
              onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
              className="pixel-button mx-auto px-6 py-3 text-xs font-bold uppercase tracking-[0.2em]"
            >
              {copy.misc.loadMore}
            </button>
          )}
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-bold uppercase tracking-[0.12em]">{copy.section.series}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {series.map((group) => (
              <div key={group.name} className="pixel-card flex flex-col gap-4 p-5">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-mono uppercase tracking-[0.2em] text-cyan-200">
                    {group.name}
                  </div>
                  <div className="text-xs font-mono text-slate-400">{group.posts.length}</div>
                </div>
                <div className="flex flex-col gap-3">
                  {group.posts.slice(0, 3).map((post) => {
                    const content = getI18n(post, lang);
                    if (!content) return null;
                    return (
                      <Link key={post.slug} href={`/blog/${post.slug}`} className="flex flex-col gap-1">
                        <span className="text-sm font-semibold text-slate-100">{content.title}</span>
                        <span className="text-xs font-mono text-slate-400">
                          {formatBlogDate(post.date)} · {content.readMinutes} {copy.misc.minutes}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="pixel-card flex flex-col gap-4 p-5">
            <h3 className="text-lg font-bold uppercase tracking-[0.12em]">{copy.section.changelog}</h3>
            <div className="flex flex-col gap-3">
              {changelog.map((post) => {
                const content = getI18n(post, lang);
                if (!content) return null;
                return (
                  <Link key={post.slug} href={`/blog/${post.slug}`} className="flex flex-col gap-1">
                    <span className="text-sm font-semibold text-slate-100">{content.title}</span>
                    <span className="text-xs font-mono text-slate-400">
                      {formatBlogDate(post.date)} · {content.readMinutes} {copy.misc.minutes}
                    </span>
                    <span className="text-xs text-slate-300">{content.excerpt}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="pixel-card flex flex-col gap-4 p-5">
            <h3 className="text-lg font-bold uppercase tracking-[0.12em]">{copy.section.lab}</h3>
            <div className="flex flex-col gap-3">
              {labNotes.map((post) => {
                const content = getI18n(post, lang);
                if (!content) return null;
                return (
                  <Link key={post.slug} href={`/blog/${post.slug}`} className="flex flex-col gap-1">
                    <span className="text-sm font-semibold text-slate-100">{content.title}</span>
                    <span className="text-xs font-mono text-slate-400">
                      {formatBlogDate(post.date)} · {content.readMinutes} {copy.misc.minutes}
                    </span>
                    <span className="text-xs text-slate-300">{content.excerpt}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section id="subscribe" className="pixel-card flex flex-col gap-4 p-6">
          <div className="text-xs font-mono uppercase tracking-[0.2em] text-slate-300">
            {copy.section.subscribe}
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <input
              type="email"
              placeholder="you@example.com"
              className="pixel-input w-full"
            />
            <button className="pixel-button px-6 py-3 text-sm font-bold uppercase tracking-[0.2em]">
              {copy.secondaryAction}
            </button>
          </div>
        </section>

        <footer className="flex flex-col gap-3 text-xs font-mono text-slate-300">
          <div>{copy.footer.brand}</div>
          <div className="flex flex-wrap gap-4">
            <Link href="/" className="underline">
              {copy.footer.home}
            </Link>
            <Link href="/hand-3d" className="underline">
              {copy.footer.lab}
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
