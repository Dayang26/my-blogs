'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { type PostListItem, type SearchIndexItem } from '@/types/blog';
import { formatBlogDate, getTagLabel } from '@/lib/blog-shared';
import { CustomSelect } from '@/components/ui/custom-select';
import { BackToTop } from '@/components/ui/back-to-top';

const PAGE_SIZE = 12;

type BlogIndexProps = {
  posts: PostListItem[];
  tags: string[];
};

export default function BlogIndexClient({ posts, tags }: BlogIndexProps) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [activeTag, setActiveTag] = useState('All');
  const [sortBy, setSortBy] = useState<'latest' | 'oldest' | 'read'>('latest');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [indexItems, setIndexItems] = useState<SearchIndexItem[]>([]);
  const [indexReady, setIndexReady] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query);
      setVisibleCount(PAGE_SIZE);
    }, 200);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  useEffect(() => {
    let mounted = true;

    fetch('/searchIndex.json')
      .then((res) => (res.ok ? res.json() : Promise.reject(res.statusText)))
      .then((data: SearchIndexItem[]) => {
        if (!mounted) return;
        setIndexItems(data);
        setIndexReady(true);
      })
      .catch((err) => {
        console.warn('Search index unavailable:', err);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const resetVisible = () => setVisibleCount(PAGE_SIZE);

  const postsBySlug = useMemo(() => new Map(posts.map((post) => [post.slug, post])), [posts]);

  const filteredItems = useMemo(() => {
    if (!indexReady) return [];
    const normalizedQuery = debouncedQuery.trim().toLowerCase();

    const filtered = indexItems.filter((item) => {
      if (activeTag !== 'All' && !item.tags.includes(activeTag)) return false;
      if (normalizedQuery && !item.searchText.includes(normalizedQuery)) return false;
      return true;
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'latest') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'oldest') return new Date(a.date).getTime() - new Date(b.date).getTime();
      return b.readMinutes - a.readMinutes;
    });
  }, [activeTag, indexItems, indexReady, debouncedQuery, sortBy]);

  const visiblePosts = useMemo(() => {
    if (!indexReady) return posts.slice(0, visibleCount);
    const slice = filteredItems.slice(0, visibleCount);
    return slice.map((item) => postsBySlug.get(item.slug)).filter(Boolean) as PostListItem[];
  }, [filteredItems, indexReady, posts, postsBySlug, visibleCount]);

  const canLoadMore = indexReady ? filteredItems.length > visibleCount : posts.length > visibleCount;

  return (
    <div className="mx-auto flex w-full max-w-[920px] flex-col px-6 py-10 md:py-16">
      {/* Page Header */}
      <header className="mb-8 flex flex-col gap-3 px-1">
        <div className="inline-flex w-fit items-center gap-2 rounded-full glass-pill px-3 py-1 font-mono text-[11px] font-medium text-[var(--accent)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" aria-hidden="true" />
          <span>Archive · {posts.length} 篇文章</span>
        </div>
        <h1 className="font-heading text-3xl font-bold tracking-tight text-balance text-[var(--text-primary)] md:text-4xl">
          所有文章
        </h1>
        <p className="font-sans text-sm md:text-base text-[var(--text-secondary)]">
          关于 Web 前端、交互体验与技术工程的深度探索与实践思考
        </p>
      </header>

      {/* Unified Glass Control Deck: Search + Sort + Tags */}
      <section className="mb-8 flex flex-col gap-4 rounded-3xl glass-card p-4 sm:p-5 z-20">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Quick Search Input */}
          <div className="relative flex-1">
            <svg
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
              }}
              placeholder="快速过滤文章标题或内容..."
              aria-label="快速过滤文章"
              className="w-full rounded-full border border-[var(--border)] bg-[var(--surface)]/70 py-2 pl-10 pr-4 font-sans text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none transition-all focus:border-[var(--accent)]/60 focus:bg-[var(--surface-hover)] focus:ring-2 focus:ring-[var(--accent-subtle)]"
            />
          </div>

          <div className="flex items-center gap-2.5 flex-shrink-0">
            <span className="font-sans text-xs text-[var(--text-muted)]">排序</span>
            <CustomSelect
              value={sortBy}
              onChange={(value) => {
                setSortBy(value as 'latest' | 'oldest' | 'read');
                resetVisible();
              }}
              options={[
                { value: 'latest', label: '最新发布' },
                { value: 'oldest', label: '最早发布' },
                { value: 'read', label: '阅读时长' },
              ]}
            />
          </div>
        </div>

        {/* Tag Filters */}
        <div className="flex flex-wrap gap-2 pt-1" role="group" aria-label="文章分类筛选">
          {tags.map((tag) => {
            const isActive = activeTag === tag;
            return (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  setActiveTag(tag);
                  resetVisible();
                }}
                aria-pressed={isActive}
                className={`rounded-full px-3.5 py-1 font-mono text-xs transition-all duration-200 active:scale-95 ${
                  isActive
                    ? 'bg-[var(--accent)] text-[var(--accent-fg)] font-semibold shadow-[0_4px_14px_-2px_var(--accent-glow),inset_0_1px_0_rgba(255,255,255,0.35)]'
                    : 'border border-[var(--border)] bg-[var(--surface)]/70 text-[var(--text-secondary)] hover:border-[var(--accent)]/40 hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]'
                }`}
              >
                {getTagLabel(tag)}
              </button>
            );
          })}
        </div>
      </section>

      {/* Articles Cards Stream */}
      <section className="flex flex-col gap-4">
        {visiblePosts.map((post, index) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group flex flex-col gap-3 rounded-3xl glass-card glass-card-interactive p-6 animate-fade-in"
            style={{ animationDelay: `${index * 30}ms` }}
          >
            <div className="flex items-center justify-between font-mono text-xs text-[var(--text-muted)]">
              <span>{formatBlogDate(post.date)}</span>
              <span className="rounded-full bg-[var(--surface)]/70 px-2.5 py-0.5">{post.readMinutes} 分钟阅读</span>
            </div>

            <h2 className="font-heading text-lg sm:text-xl font-bold text-balance text-[var(--text-primary)] transition-colors duration-200 group-hover:text-[var(--accent)]">
              {post.title}
            </h2>

            <p className="line-clamp-2 font-sans text-sm leading-relaxed text-[var(--text-secondary)]">
              {post.excerpt}
            </p>

            <div className="mt-1 flex items-center justify-between pt-1">
              <div className="flex flex-wrap gap-1.5 font-mono text-[11px] text-[var(--accent)]">
                {post.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="rounded-full bg-[var(--accent-subtle)] px-2.5 py-0.5 font-medium"
                  >
                    #{getTagLabel(tag)}
                  </span>
                ))}
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--surface)]/70 px-3 py-1 font-sans text-xs font-medium text-[var(--text-secondary)] transition-all duration-200 group-hover:bg-[var(--accent-subtle)] group-hover:text-[var(--accent)]">
                <span>阅读全文</span>
                <span className="transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true">→</span>
              </span>
            </div>
          </Link>
        ))}

        {indexReady && visiblePosts.length === 0 && (
          <div className="rounded-3xl glass-card py-16 text-center font-sans text-sm text-[var(--text-muted)]">
            没有找到与您的筛选条件匹配的文章
          </div>
        )}
      </section>

      {/* Load More */}
      {canLoadMore && (
        <div className="mt-12 flex justify-center">
          <button
            type="button"
            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            className="glass-button rounded-full px-7 py-2.5 font-sans text-sm font-medium text-[var(--accent)]"
          >
            加载更多文章
          </button>
        </div>
      )}

      {/* Back to Top */}
      <BackToTop />
    </div>
  );
}
