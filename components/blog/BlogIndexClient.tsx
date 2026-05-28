'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { type PostListItem, type SearchIndexItem } from '@/types/blog';
import { formatBlogDate, getTagLabel } from '@/lib/blog-shared';
import { CustomSelect } from '@/components/ui/custom-select';

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
      .catch((err) => { console.warn('Search index unavailable:', err); })
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
    <div className="mx-auto flex w-full max-w-[800px] flex-col px-6 py-12 md:py-20">
      <header className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <h1 className="font-heading text-[32px] font-bold tracking-[0.1em] text-[var(--text-primary)]">
          文章
        </h1>
        
        <div className="flex w-full flex-col gap-4 md:w-auto md:flex-row md:items-end">
          <input
            type="search"
            value={query}
            onChange={(e) => { setQuery(e.target.value); }}
            placeholder="搜索文章..."
            className="w-full border-b border-[var(--border)] bg-transparent py-2 font-sans text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent)] md:w-64 transition-colors"
          />
          
          <div className="flex items-center gap-2">
            <span className="font-sans text-sm text-[var(--text-secondary)]">排序:</span>
            <CustomSelect
              value={sortBy}
              onChange={(value) => { setSortBy(value as 'latest' | 'oldest' | 'read'); resetVisible(); }}
              options={[
                { value: 'latest', label: '最新' },
                { value: 'oldest', label: '最早' },
                { value: 'read', label: '阅读时长' },
              ]}
            />
          </div>
        </div>
      </header>

      <section className="mb-10 flex flex-wrap gap-4 border-b border-[var(--border)] pb-4">
        {tags.map((tag) => {
          const isActive = activeTag === tag;
          return (
            <button
              key={tag}
              type="button"
              onClick={() => { setActiveTag(tag); resetVisible(); }}
              className={`font-sans text-sm transition-colors ${
                isActive
                  ? 'font-medium text-[var(--accent)] underline underline-offset-8'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {getTagLabel(tag)}
            </button>
          );
        })}
      </section>

      <section className="flex flex-col">
        {visiblePosts.map((post, index) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group flex flex-col gap-2 border-b border-[var(--border)] py-6 animate-fade-in"
            style={{ animationDelay: `${index * 30}ms` }}
          >
            <div className="font-sans text-xs text-[var(--text-muted)]">
              {formatBlogDate(post.date)}
            </div>
            <h2 className="font-heading text-lg font-semibold text-[var(--text-primary)] transition-colors group-hover:text-[var(--accent)]">
              {post.title}
            </h2>
            <p className="line-clamp-2 font-sans text-sm text-[var(--text-secondary)]">
              {post.excerpt}
            </p>
            <div className="mt-1 flex gap-2 font-sans text-xs text-[var(--text-muted)]">
              <span>{post.tags.map(getTagLabel).join(' · ')}</span>
              <span>·</span>
              <span>{post.readMinutes} 分钟</span>
            </div>
          </Link>
        ))}

        {indexReady && visiblePosts.length === 0 && (
          <div className="py-12 text-center font-sans text-sm text-[var(--text-secondary)]">
            没有匹配内容
          </div>
        )}
      </section>

      {canLoadMore && (
        <div className="mt-12 flex justify-center">
          <button
            type="button"
            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            className="font-sans text-sm font-medium text-[var(--accent)] transition-colors hover:text-[var(--accent-hover)]"
          >
            加载更多
          </button>
        </div>
      )}
    </div>
  );
}
