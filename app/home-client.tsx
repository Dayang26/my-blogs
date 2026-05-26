'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { type PostListItem } from '@/types/blog';
import { formatBlogDate, getTagLabel } from '@/lib/blog-shared';

const ParticleBackground = dynamic(
  () => import('@/components/particles/ParticleBackground').then(m => ({ default: m.ParticleBackground })),
  { ssr: false }
);

type HomeClientProps = {
  posts: PostListItem[];
};

function TextObstacles({ text }: { text: string }) {
  const words = text.split(' ');
  return (
    <>
      {words.map((word, i) => (
        <span key={i} className="whitespace-nowrap">
          {word.split('').map((char, j) => (
            <span key={j} data-obstacle="true">{char}</span>
          ))}
          {i !== words.length - 1 && <span> </span>}
        </span>
      ))}
    </>
  );
}

export function HomeClient({ posts }: HomeClientProps) {
  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col px-6">
      {/* ─── Hero ─── */}
      <section className="relative flex flex-col items-center justify-center py-32 md:py-40 animate-fade-in" style={{ animationDelay: '50ms' }}>
        <ParticleBackground />
        <h1 className="relative z-10 font-heading text-5xl font-bold tracking-[0.25em] md:text-[64px] text-[var(--text-primary)]">
          <TextObstacles text="SnowLine" />
        </h1>
        <div data-obstacle="true" className="relative z-10 h-px w-[120px] bg-[var(--border)] mt-8 mb-6" />
        <p className="relative z-10 font-sans text-base italic text-[var(--text-secondary)] animate-fade-in" style={{ animationDelay: '100ms' }}>
          <TextObstacles text="Personality begins where comparison ends." />
        </p>
        <p className="relative z-10 mt-2 font-sans text-sm font-medium text-[var(--text-muted)] animate-fade-in" style={{ animationDelay: '150ms' }}>
          <TextObstacles text="Aaron Hu" />
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
