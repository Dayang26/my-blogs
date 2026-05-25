'use client';

import Link from 'next/link';
import { type PostListItem } from '@/types/blog';
import { formatBlogDate, getTagLabel } from '@/lib/blog-shared';

type HomeClientProps = {
  posts: PostListItem[];
};

export function HomeClient({ posts }: HomeClientProps) {
  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col px-6">
      {/* ─── Hero ─── */}
      <section className="flex flex-col items-center justify-center py-24 md:py-32 animate-fade-in" style={{ animationDelay: '50ms' }}>
        <div className="h-px w-[120px] bg-[var(--border)] mb-8" />
        <h1 className="font-heading text-5xl font-bold tracking-[0.25em] md:text-[64px] text-[var(--text-primary)]">
          SnowLine
        </h1>
        <div className="h-px w-[120px] bg-[var(--border)] mt-8 mb-6" />
        <p className="font-sans text-base italic text-[var(--text-secondary)] animate-fade-in" style={{ animationDelay: '100ms' }}>
          一个关于手势追踪、3D 交互与前端开发的个人博客
        </p>
        <p className="mt-2 font-sans text-sm font-medium text-[var(--text-muted)] animate-fade-in" style={{ animationDelay: '150ms' }}>
          Aaron Hu
        </p>
      </section>

      {/* ─── Recent Posts ─── */}
      <section className="flex flex-col pb-20">
        <h2 className="mb-8 font-heading text-xl font-semibold text-[var(--text-primary)] animate-fade-in" style={{ animationDelay: '200ms' }}>
          最新文章
        </h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, index) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col gap-3 border-b border-[var(--border)] pb-6 transition-colors hover:border-[var(--accent)] animate-fade-in"
              style={{ animationDelay: `${250 + index * 50}ms` }}
            >
              <div className="text-xs text-[var(--text-muted)]">
                {formatBlogDate(post.date)}
              </div>
              <h3 className="text-base font-semibold text-[var(--text-primary)] transition-colors group-hover:text-[var(--accent)]">
                {post.title}
              </h3>
              <p className="line-clamp-2 text-sm text-[var(--text-secondary)] flex-1">
                {post.excerpt}
              </p>
              <div className="flex flex-wrap gap-2 text-xs text-[var(--accent)]">
                {post.tags.slice(0, 2).map((tag: string) => (
                  <span key={tag}>{getTagLabel(tag)}</span>
                ))}
              </div>
            </Link>
          ))}
        </div>
        
        <div className="mt-12 flex justify-center animate-fade-in" style={{ animationDelay: `${250 + posts.length * 50}ms` }}>
          <Link 
            href="/blog" 
            className="font-sans text-sm font-medium text-[var(--accent)] transition-colors hover:text-[var(--accent-hover)]"
          >
            查看全部文章 →
          </Link>
        </div>
      </section>
    </div>
  );
}
