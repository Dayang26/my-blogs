'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { type PostEntity, type PostListItem } from '@/types/blog';
import { formatBlogDate, getTagLabel } from '@/lib/blog-shared';
import { MDXContent } from '@/components/mdx-content';
import { TableOfContents } from './TableOfContents';
import { BackToTop } from '@/components/ui/back-to-top';
import { useTheme } from '@/components/theme/ThemeProvider';
import Giscus from '@giscus/react';
import { giscusConfig } from '@/lib/giscus-config';

type BlogPostClientProps = {
  post: PostEntity;
  prev: PostListItem | null;
  next: PostListItem | null;
  related: PostListItem[];
};

export default function BlogPostClient({ post, prev, next, related }: BlogPostClientProps) {
  const [progress, setProgress] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        const current = (window.scrollY / totalScroll) * 100;
        setProgress(Math.min(100, Math.max(0, current)));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-[1120px] justify-center px-6 py-10 md:py-16">
      {/* Top 2px Reading Progress Bar */}
      <div
        className="fixed left-0 top-0 z-50 h-[2px] bg-[var(--accent)] transition-[width] duration-75 ease-out"
        style={{ width: `${progress}%` }}
      />

      <div className="flex w-full max-w-[760px] flex-col">
        {/* Navigation back and quick action */}
        <div className="mb-8 flex items-center justify-between">
          <Link 
            href="/blog" 
            className="group flex items-center gap-1.5 font-sans text-xs font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--accent)]"
          >
            <span className="transition-transform duration-200 group-hover:-translate-x-1">←</span>
            <span>返回文章列表</span>
          </Link>

          <button
            type="button"
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1 font-sans text-xs text-[var(--text-secondary)] transition-all hover:border-[var(--accent)] hover:text-[var(--text-primary)]"
            title="复制本文链接"
          >
            {copiedLink ? (
              <>
                <svg className="h-3.5 w-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-emerald-500">已复制链接</span>
              </>
            ) : (
              <>
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                <span>分享</span>
              </>
            )}
          </button>
        </div>

        {/* Article Container */}
        <article className="flex flex-col">
          {/* Metadata badges */}
          <div className="mb-4 flex flex-wrap items-center gap-2 font-mono text-xs text-[var(--text-muted)]">
            <span className="font-semibold text-[var(--accent)]">
              {post.tags.map(getTagLabel).join(' · ')}
            </span>
            <span>·</span>
            <span>{formatBlogDate(post.date)}</span>
            <span>·</span>
            <span>{post.readMinutes} 分钟阅读</span>
          </div>
          
          <h1 className="mb-6 font-heading text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl md:text-[42px] leading-tight">
            {post.title}
          </h1>
          
          <p className="mb-10 font-sans text-base leading-relaxed text-[var(--text-secondary)] border-l-2 border-[var(--accent)] pl-4 py-1 bg-[var(--surface)] rounded-r-md">
            {post.excerpt}
          </p>

          <div className="h-px w-full bg-[var(--border)] mb-10" />

          {/* Main MDX Content */}
          <div className="mdx-content w-full">
            <MDXContent code={post.code} />
          </div>
        </article>

        {/* Article Footer & Prev / Next */}
        <div className="h-px w-full bg-[var(--border)] mt-16 mb-8" />

        <nav className="grid gap-4 sm:grid-cols-2">
          {prev ? (
            <Link 
              href={`/blog/${prev.slug}`} 
              className="group flex flex-col gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--accent)] hover:shadow-[var(--card-shadow-hover)]"
            >
              <span className="font-mono text-xs text-[var(--text-muted)] flex items-center gap-1">
                <span>←</span> 上一篇
              </span>
              <span className="font-heading text-sm font-semibold text-[var(--text-primary)] transition-colors group-hover:text-[var(--accent)] line-clamp-1">
                {prev.title}
              </span>
            </Link>
          ) : (
            <div className="hidden sm:block" />
          )}

          {next ? (
            <Link 
              href={`/blog/${next.slug}`} 
              className="group flex flex-col gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-right transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--accent)] hover:shadow-[var(--card-shadow-hover)]"
            >
              <span className="font-mono text-xs text-[var(--text-muted)] flex items-center justify-end gap-1">
                下一篇 <span>→</span>
              </span>
              <span className="font-heading text-sm font-semibold text-[var(--text-primary)] transition-colors group-hover:text-[var(--accent)] line-clamp-1">
                {next.title}
              </span>
            </Link>
          ) : null}
        </nav>

        {/* Related Posts */}
        {related.length > 0 && (
          <section className="mt-14">
            <h2 className="mb-6 font-heading text-lg font-bold tracking-wide text-[var(--text-primary)]">
              相关阅读
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {related.map((item) => (
                <Link 
                  key={item.slug} 
                  href={`/blog/${item.slug}`} 
                  className="group flex flex-col gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--accent)] hover:shadow-[var(--card-shadow-hover)]"
                >
                  <div className="font-mono text-[11px] text-[var(--text-muted)]">
                    {formatBlogDate(item.date)}
                  </div>
                  <div className="font-heading text-sm font-medium text-[var(--text-primary)] transition-colors group-hover:text-[var(--accent)] line-clamp-2">
                    {item.title}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Giscus Comments */}
        <section className="mt-16 border-t border-[var(--border)] pt-12">
          <h3 className="mb-6 font-heading text-xl font-bold text-[var(--text-primary)]">
            评论交流
          </h3>
          {giscusConfig.repoId && giscusConfig.categoryId ? (
            <Giscus 
              key={`${post.slug}-${resolvedTheme}`} 
              {...giscusConfig} 
              theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
            />
          ) : (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 text-center text-xs text-[var(--text-muted)]">
              在 GitHub Discussions 中开启互动交流
            </div>
          )}
        </section>
      </div>

      {/* Floating TOC on wide screens */}
      <div className="hidden xl:block xl:w-64 xl:pl-10">
        <TableOfContents />
      </div>

      {/* Back to top with circular progress */}
      <BackToTop />
    </div>
  );
}
