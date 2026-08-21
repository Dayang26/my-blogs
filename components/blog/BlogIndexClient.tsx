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
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
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
      .catch((err) => { console.warn('Search index unavailable:', err); });
    return () => { mounted = false; };
  }, []);

  const resetVisible = () => setVisibleCount(PAGE_SIZE);

  const postsBySlug = useMemo(() => new Map(posts.map((post) => [post.slug, post])), [posts]);

  const filteredItems = useMemo(() => {
    if (!indexReady) return [];
    const normalizedQuery = debouncedQuery.trim().toLowerCase();
    
    const items = indexItems;

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
  }, [activeTag, indexItems, indexReady, debouncedQuery, sortBy]);

  const visiblePosts = useMemo(() => {
    if (!indexReady) return posts.slice(0, visibleCount);
    const slice = filteredItems.slice(0, visibleCount);
    return slice.map((item) => postsBySlug.get(item.slug)).filter(Boolean) as PostListItem[];
  }, [filteredItems, indexReady, posts, postsBySlug, visibleCount]);

  const canLoadMore = indexReady ? filteredItems.length > visibleCount : posts.length > visibleCount;

  return (
    <div className="mx-auto flex w-full max-w-[860px] flex-col px-6 py-10 md:py-16">
      {/* Header with Title and Search/Sort */}
      <header className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-[var(--text-primary)] md:text-4xl">
            所有文章
          </h1>
          <p className="mt-2 font-sans text-sm text-[var(--text-secondary)]">
            关于 Web 前端、交互体验与技术工程的深度探索与实践思考
          </p>
        </div>
        
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center md:w-auto">
          {/* Quick Search in Page */}
          <div className="relative flex-1 sm:w-60">
            <input
              type="search"
              value={query}
              onChange={(e) => { setQuery(e.target.value); }}
              placeholder="快速过滤文章..."
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 font-sans text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none transition-colors focus:border-[var(--accent)]"
            />
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="font-sans text-xs text-[var(--text-secondary)]">排序:</span>
            <CustomSelect
              value={sortBy}
              onChange={(value) => { setSortBy(value as 'latest' | 'oldest' | 'read'); resetVisible(); }}
              options={[
                { value: 'latest', label: '最新发布' },
                { value: 'oldest', label: '最早发布' },
                { value: 'read', label: '阅读时长' },
              ]}
            />
          </div>
        </div>
      </header>

      {/* Tag Filters */}
      <section className="mb-8 flex flex-wrap gap-2 border-b border-[var(--border)] pb-5">
        {tags.map((tag) => {
          const isActive = activeTag === tag;
          return (
            <button
              key={tag}
              type="button"
              onClick={() => { setActiveTag(tag); resetVisible(); }}
              className={`rounded-full px-3 py-1 font-mono text-xs transition-all ${
                isActive
                  ? 'bg-[var(--accent)] text-white font-medium shadow-sm'
                  : 'bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--text-primary)]'
              }`}
            >
              {getTagLabel(tag)}
            </button>
          );
        })}
      </section>

      {/* Articles Cards Stream */}
      <section className="flex flex-col gap-4">
        {visiblePosts.map((post, index) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group flex flex-col gap-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--card-shadow)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--accent)] hover:shadow-[var(--card-shadow-hover)] animate-fade-in"
            style={{ animationDelay: `${index * 30}ms` }}
          >
            <div className="flex items-center justify-between font-mono text-xs text-[var(--text-muted)]">
              <span>{formatBlogDate(post.date)}</span>
              <span>{post.readMinutes} 分钟阅读</span>
            </div>

            <h2 className="font-heading text-lg font-bold text-[var(--text-primary)] transition-colors group-hover:text-[var(--accent)]">
              {post.title}
            </h2>

            <p className="line-clamp-2 font-sans text-sm leading-relaxed text-[var(--text-secondary)]">
              {post.excerpt}
            </p>

            <div className="mt-2 flex items-center justify-between border-t border-[var(--border)]/50 pt-3">
              <div className="flex flex-wrap gap-2 font-mono text-[11px] text-[var(--accent)]">
                {post.tags.map((tag: string) => (
                  <span key={tag} className="rounded bg-[var(--accent-subtle)] px-2 py-0.5 font-medium">
                    #{getTagLabel(tag)}
                  </span>
                ))}
              </div>
              <span className="font-sans text-xs font-semibold text-[var(--text-muted)] transition-transform duration-200 group-hover:translate-x-1 group-hover:text-[var(--accent)]">
                阅读全文 →
              </span>
            </div>
          </Link>
        ))}

        {indexReady && visiblePosts.length === 0 && (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] py-16 text-center font-sans text-sm text-[var(--text-muted)]">
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
            className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-6 py-2.5 font-sans text-sm font-medium text-[var(--accent)] shadow-sm transition-all hover:border-[var(--accent)] hover:shadow-md"
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
