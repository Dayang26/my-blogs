'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { type PostEntity, type PostListItem } from '@/types/blog';
import { formatBlogDate, getTagLabel } from '@/lib/blog-shared';
import { MDXContent } from '@/components/mdx-content';
import { TableOfContents } from './TableOfContents';
import { BackToTop } from '@/components/ui/back-to-top';
import { useTheme } from '@/components/theme/ThemeProvider';
import { giscusConfig } from '@/lib/giscus-config';

const Giscus = dynamic(() => import('@giscus/react'), { ssr: false });

// 独立的阅读进度条：优先使用原生 CSS Scroll-Driven Animations，不支持时平滑降级到 scaleX JS 监听器
function ReadingProgressBar() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.CSS?.supports?.('animation-timeline', 'scroll()')) return;

    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
        const ratio = totalScroll > 0 ? Math.min(1, Math.max(0, window.scrollY / totalScroll)) : 0;
        if (barRef.current) {
          barRef.current.style.transform = `scaleX(${ratio})`;
        }
      });
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      ref={barRef}
      aria-hidden="true"
      className="reading-progress-bar pointer-events-none fixed left-0 top-0 z-50 h-[2.5px] w-full bg-gradient-to-r from-[var(--accent)] to-sky-400 shadow-[0_0_10px_var(--accent-glow)]"
    />
  );
}

type BlogPostClientProps = {
  post: PostEntity;
  prev: PostListItem | null;
  next: PostListItem | null;
  related: PostListItem[];
};

export default function BlogPostClient({ post, prev, next, related }: BlogPostClientProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const { resolvedTheme } = useTheme();

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
    <div className="mx-auto flex w-full max-w-[1160px] justify-center px-4 sm:px-6 py-8 md:py-14">
      {/* Top Reading Progress Bar */}
      <ReadingProgressBar />

      <div className="flex w-full max-w-[780px] flex-col">
        {/* Top Action Pills */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/blog"
            className="glass-button group inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-sans text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--accent)]"
          >
            <span className="transition-transform duration-200 group-hover:-translate-x-0.5" aria-hidden="true">←</span>
            <span>返回文章列表</span>
          </Link>

          <button
            type="button"
            onClick={handleCopyLink}
            className="glass-button inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-sans text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            title="复制本文链接"
          >
            {copiedLink ? (
              <>
                <svg className="h-3.5 w-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-emerald-500">已复制链接</span>
              </>
            ) : (
              <>
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
                <span>分享链接</span>
              </>
            )}
          </button>
        </div>

        {/* Article Glass Surface */}
        <article className="flex flex-col rounded-3xl glass-card p-6 sm:p-10 md:p-12">
          {/* Metadata badges */}
          <div className="mb-5 flex flex-wrap items-center gap-2.5 font-mono text-xs text-[var(--text-muted)]">
            <div className="flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-[var(--accent-subtle)] px-2.5 py-0.5 font-semibold text-[var(--accent)]"
                >
                  {getTagLabel(tag)}
                </span>
              ))}
            </div>
            <span>·</span>
            <span>{formatBlogDate(post.date)}</span>
            <span>·</span>
            <span>{post.readMinutes} 分钟阅读</span>
          </div>

          <h1 className="mb-6 font-heading text-3xl font-bold tracking-tight text-balance text-[var(--text-primary)] sm:text-4xl md:text-[2.625rem] leading-[1.18]">
            {post.title}
          </h1>

          <p className="mb-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/75 px-5 py-4 font-sans text-sm sm:text-base leading-relaxed text-[var(--text-secondary)] shadow-[inset_0_1px_0_var(--glass-specular-top)]">
            {post.excerpt}
          </p>

          <div
            className="mb-8 h-px w-full bg-gradient-to-r from-transparent via-[var(--border)] to-transparent"
            aria-hidden="true"
          />

          {/* Main MDX Content */}
          <div className="mdx-content w-full max-w-[65ch] mx-auto">
            <MDXContent code={post.code} />
          </div>
        </article>

        {/* Article Footer & Prev / Next */}
        <nav className="mt-8 grid gap-4 sm:grid-cols-2" aria-label="文章上下篇导航">
          {prev ? (
            <Link
              href={`/blog/${prev.slug}`}
              className="group flex flex-col gap-1.5 rounded-3xl glass-card glass-card-interactive p-5"
            >
              <span className="flex items-center gap-1 font-mono text-xs text-[var(--text-muted)]">
                <span aria-hidden="true">←</span> 上一篇
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
              className="group flex flex-col gap-1.5 rounded-3xl glass-card glass-card-interactive p-5 text-right"
            >
              <span className="flex items-center justify-end gap-1 font-mono text-xs text-[var(--text-muted)]">
                下一篇 <span aria-hidden="true">→</span>
              </span>
              <span className="font-heading text-sm font-semibold text-[var(--text-primary)] transition-colors group-hover:text-[var(--accent)] line-clamp-1">
                {next.title}
              </span>
            </Link>
          ) : null}
        </nav>

        {/* Related Posts */}
        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-5 px-1 font-heading text-lg font-bold tracking-tight text-[var(--text-primary)]">
              相关阅读
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {related.map((item) => (
                <Link
                  key={item.slug}
                  href={`/blog/${item.slug}`}
                  className="group flex flex-col gap-2 rounded-3xl glass-card glass-card-interactive p-5"
                >
                  <div className="font-mono text-[11px] text-[var(--text-muted)]">
                    {formatBlogDate(item.date)}
                  </div>
                  <div className="font-heading text-sm font-semibold text-balance text-[var(--text-primary)] transition-colors group-hover:text-[var(--accent)] line-clamp-2">
                    {item.title}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Giscus Comments */}
        <section className="mt-12 rounded-3xl glass-card p-6 sm:p-8">
          <h3 className="mb-6 font-heading text-xl font-bold text-[var(--text-primary)]">
            评论交流
          </h3>
          {giscusConfig.repoId && giscusConfig.categoryId ? (
            <Giscus
              {...giscusConfig}
              theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
            />
          ) : (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-6 text-center text-xs text-[var(--text-muted)]">
              在 GitHub Discussions 中开启互动交流
            </div>
          )}
        </section>
      </div>

      {/* Floating TOC on wide screens */}
      <div className="hidden xl:block xl:w-64 xl:pl-8">
        <TableOfContents />
      </div>

      {/* Back to top with circular progress */}
      <BackToTop />
    </div>
  );
}
