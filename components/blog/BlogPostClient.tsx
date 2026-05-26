'use client';

import Link from 'next/link';
import { type PostEntity, type PostListItem } from '@/types/blog';
import { formatBlogDate, getTagLabel } from '@/lib/blog-shared';
import { MDXContent } from '@/components/mdx-content';
import Giscus from '@giscus/react';
import { giscusConfig } from '@/lib/giscus-config';

type BlogPostClientProps = {
  post: PostEntity;
  prev: PostListItem | null;
  next: PostListItem | null;
  related: PostListItem[];
};

export default function BlogPostClient({ post, prev, next, related }: BlogPostClientProps) {
  return (
    <main className="mx-auto flex w-full max-w-[720px] flex-col px-6 py-12 md:py-20">
      <Link 
        href="/blog" 
        className="mb-10 font-sans text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--accent)]"
      >
        ← 返回文章列表
      </Link>

      <article className="flex flex-col">
        <div className="mb-4 font-sans text-[13px] text-[var(--text-muted)]">
          {post.tags.map(getTagLabel).join(' · ')} · {formatBlogDate(post.date)} · {post.readMinutes} 分钟
        </div>
        
        <h1 className="mb-6 font-heading text-4xl font-bold tracking-[0.08em] text-[var(--text-primary)] md:text-[40px] leading-tight">
          {post.title}
        </h1>
        
        <p className="mb-10 font-sans text-base leading-[1.6] text-[var(--text-secondary)]">
          {post.excerpt}
        </p>

        <div className="h-px w-full bg-[var(--border)] mb-12" />

        <div className="mdx-content w-full">
          <MDXContent code={post.code} />
        </div>
      </article>

      <div className="h-px w-full bg-[var(--border)] mt-16 mb-8" />

      <nav className="flex flex-col justify-between gap-4 sm:flex-row">
        <div className="flex-1">
          {prev && (
            <Link href={`/blog/${prev.slug}`} className="group flex flex-col gap-1">
              <span className="font-sans text-xs text-[var(--text-muted)]">上一篇</span>
              <span className="font-sans text-sm text-[var(--text-primary)] transition-colors group-hover:text-[var(--accent)]">
                {prev.title}
              </span>
            </Link>
          )}
        </div>
        <div className="flex-1 text-right">
          {next && (
            <Link href={`/blog/${next.slug}`} className="group flex flex-col gap-1 items-end">
              <span className="font-sans text-xs text-[var(--text-muted)]">下一篇</span>
              <span className="font-sans text-sm text-[var(--text-primary)] transition-colors group-hover:text-[var(--accent)]">
                {next.title}
              </span>
            </Link>
          )}
        </div>
      </nav>

      {related.length > 0 && (
        <>
          <div className="h-px w-full bg-[var(--border)] my-12" />
          <section>
            <h2 className="mb-6 font-heading text-xl font-bold text-[var(--text-primary)]">相关文章</h2>
            <div className="grid gap-6 sm:grid-cols-3">
              {related.map((item) => (
                <Link key={item.slug} href={`/blog/${item.slug}`} className="group flex flex-col gap-2">
                  <div className="font-sans text-xs text-[var(--text-muted)]">
                    {formatBlogDate(item.date)}
                  </div>
                  <div className="font-sans text-sm font-medium text-[var(--text-primary)] transition-colors group-hover:text-[var(--accent)] line-clamp-2">
                    {item.title}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </>
      )}

      <div className="h-px w-full bg-[var(--border)] my-12" />

      <section>
        <h3 className="mb-8 font-heading text-xl font-bold text-[var(--text-primary)]">
          评论
        </h3>
        {giscusConfig.repoId && giscusConfig.categoryId ? (
          <Giscus key={post.slug} {...giscusConfig} />
        ) : (
          <div className="text-sm text-[var(--text-muted)]">
            请在 GitHub 上启用 Discussions 并配置 Giscus。
          </div>
        )}
      </section>
    </main>
  );
}
