'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useBlogLanguage } from '@/hooks/useBlogLanguage';
import { LANGS, type Lang, type PostListItem, type SearchIndexItem } from '@/types/blog';
import { formatBlogDate, getI18n, getLanguageLabel, getTagLabel } from '@/lib/blog-shared';
import { CustomSelect } from '@/components/ui/custom-select';

const PAGE_SIZE = 12;

type BlogIndexProps = {
  posts: PostListItem[];
  tags: string[];
};

const uiText = {
  zh: {
    control: {
      search: '搜索标题、摘要或标签',
      sort: '排序',
      latest: '最新',
      oldest: '最早',
      read: '阅读时长',
      results: '条结果',
      clear: '清除',
    },
    misc: {
      loadMore: '加载更多',
      noResults: '没有匹配内容',
      indexLoading: '索引加载中',
      minutes: '分钟',
    },
    footer: {
      home: '回到主页',
      lab: '进入试验区',
    },
  },
  en: {
    control: {
      search: 'Search title, excerpt, or tags',
      sort: 'Sort',
      latest: 'Latest',
      oldest: 'Oldest',
      read: 'Read time',
      results: 'results',
      clear: 'Clear',
    },
    misc: {
      loadMore: 'Load More',
      noResults: 'No matching posts',
      indexLoading: 'Loading index',
      minutes: 'min',
    },
    footer: {
      home: 'Back Home',
      lab: 'Open Lab',
    },
  },
};

export default function BlogIndexClient({ posts, tags }: BlogIndexProps) {
  const { lang, setLang } = useBlogLanguage('zh');
  const copy = uiText[lang];
  const [query, setQuery] = useState('');
  const [activeTag, setActiveTag] = useState('All');
  const [sortBy, setSortBy] = useState<'latest' | 'oldest' | 'read'>('latest');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [indexItems, setIndexItems] = useState<SearchIndexItem[]>([]);
  const [indexReady, setIndexReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    fetch('/searchIndex.json')
      .then((res) => (res.ok ? res.json() : Promise.reject(res.statusText)))
      .then((data: SearchIndexItem[]) => {
        if (!mounted) return;
        setIndexItems(data);
        setIndexReady(true);
      })
      .catch(() => {})
    return () => { mounted = false; };
  }, []);

  const resetVisible = () => setVisibleCount(PAGE_SIZE);

  const postsBySlug = useMemo(() => new Map(posts.map((post) => [post.slug, post])), [posts]);

  const filteredItems = useMemo(() => {
    if (!indexReady) return [];
    const normalizedQuery = query.trim().toLowerCase();
    
    let items = indexItems.filter((item) => item.lang === lang);
    
    if (items.length === 0) {
      const fallbackLang = lang === 'zh' ? 'en' : 'zh';
      items = indexItems.filter((item) => item.lang === fallbackLang);
    }

    const filtered = items.filter((item) => {
      if (activeTag !== 'All' && !item.tags.includes(activeTag)) return false;
      if (normalizedQuery && !item.searchText.includes(normalizedQuery)) return false;
      return true;
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'latest') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'oldest') return new Date(a.date).getTime() - new Date(b.date).getTime();
      return b.readMinutes - a.readMinutes;
    });
  }, [activeTag, indexItems, indexReady, lang, query, sortBy]);

  const visiblePosts = useMemo(() => {
    if (!indexReady) return posts.slice(0, visibleCount);
    const slice = filteredItems.slice(0, visibleCount);
    return slice.map((item) => postsBySlug.get(item.slug)).filter(Boolean) as PostListItem[];
  }, [filteredItems, indexReady, posts, postsBySlug, visibleCount]);

  const canLoadMore = indexReady ? filteredItems.length > visibleCount : posts.length > visibleCount;
  const resultsCount = indexReady ? filteredItems.length : posts.length;

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),_rgba(15,23,42,0.92))]" />
        <div className="pixel-grid absolute inset-0 opacity-50" />
        <div className="scanlines absolute inset-0 opacity-40" />
      </div>

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 pb-20 pt-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="pixel-chip inline-flex items-center gap-2 px-4 py-2 text-xs font-mono uppercase tracking-[0.35em]">
            Pixel Blog
          </div>
          <nav className="flex flex-wrap gap-3 text-xs font-mono uppercase tracking-[0.2em]">
            <Link href="/" className="pixel-chip px-3 py-2">Home</Link>
            <Link href="/hand-3d" className="pixel-button px-3 py-2 text-slate-950">Lab</Link>
          </nav>
        </header>

        <section className="sticky top-4 z-20">
          <div className="pixel-panel flex flex-col gap-3 px-4 py-3">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <input
                type="search"
                value={query}
                onChange={(e) => { setQuery(e.target.value); resetVisible(); }}
                placeholder={copy.control.search}
                className="pixel-input w-full md:max-w-xs"
              />
              <div className="flex flex-wrap items-center gap-2">
                <CustomSelect
                  value={sortBy}
                  onChange={(value) => { setSortBy(value as 'latest' | 'oldest' | 'read'); resetVisible(); }}
                  options={[
                    { value: 'latest', label: copy.control.latest },
                    { value: 'oldest', label: copy.control.oldest },
                    { value: 'read', label: copy.control.read },
                  ]}
                />
                <button
                  type="button"
                  onClick={() => { setQuery(''); setActiveTag('All'); resetVisible(); }}
                  className="pixel-chip px-3 py-2 text-xs font-bold uppercase tracking-[0.2em]"
                >
                  {copy.control.clear}
                </button>
                <div className="flex items-center rounded-lg border border-slate-700/50 bg-slate-900/50 p-0.5">
                  {LANGS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => { setLang(option); resetVisible(); }}
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
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => { setActiveTag(tag); resetVisible(); }}
                  className={`pixel-chip px-3 py-2 text-xs font-bold uppercase tracking-[0.2em] ${
                    activeTag === tag ? 'border-cyan-200/80 text-cyan-100' : 'text-slate-300'
                  }`}
                >
                  {getTagLabel(tag, lang)}
                </button>
              ))}
            </div>

            <div className="text-xs font-mono text-slate-400">
              {!indexReady && copy.misc.indexLoading}
              {indexReady && `${resultsCount} ${copy.control.results}`}
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visiblePosts.map((post, index) => {
            const content = getI18n(post, lang);
            if (!content) return null;
            return (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="pixel-card animate-rise group flex h-full flex-col gap-3 p-4"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <div className="flex flex-wrap gap-2 text-xs font-mono uppercase tracking-[0.2em] text-slate-400">
                  {post.tags.slice(0, 2).map((tag) => (
                    <span key={tag}>{getTagLabel(tag, lang)}</span>
                  ))}
                </div>
                <h2 className="text-sm font-bold uppercase tracking-[0.1em] group-hover:text-cyan-100 line-clamp-2">
                  {content.title}
                </h2>
                <p className="text-xs text-slate-300 line-clamp-2 flex-1">{content.excerpt}</p>
                <div className="flex items-center justify-between text-xs font-mono text-slate-500">
                  <span>{formatBlogDate(post.date)}</span>
                  <span>{content.readMinutes} {copy.misc.minutes}</span>
                </div>
              </Link>
            );
          })}
        </section>

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

        <footer className="mt-8 flex flex-col gap-2 text-xs font-mono text-slate-500">
          <div className="flex flex-wrap gap-4">
            <Link href="/" className="hover:text-slate-300">{copy.footer.home}</Link>
            <Link href="/hand-3d" className="hover:text-slate-300">{copy.footer.lab}</Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
