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
        <span key={i} className="inline-block whitespace-nowrap" data-obstacle="true">
          {word}
          {i !== words.length - 1 && <span>&nbsp;</span>}
        </span>
      ))}
    </>
  );
}

export function HomeClient({ posts }: HomeClientProps) {
  // 分离精选文章与常规文章
  const featuredPost = posts.find((p) => p.featured) || posts[0];
  const recentPosts = posts.filter((p) => p.slug !== featuredPost?.slug).slice(0, 6);

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col px-6">
      {/* ─── Hero Section ─── */}
      <section className="relative flex min-h-[620px] flex-col items-center justify-center text-center animate-fade-in py-16">
        <ParticleBackground />
        
        {/* Main Title */}
        <h1 className="relative z-10 font-heading text-5xl font-bold tracking-[0.25em] md:text-[68px] text-[var(--text-primary)] select-none">
          <TextObstacles text="SnowLine" />
        </h1>

        <div data-obstacle="true" className="relative z-10 h-px w-[120px] bg-[var(--border)] mt-6 mb-6" />

        {/* Motto / Slogan */}
        <p className="relative z-10 font-sans text-base md:text-lg italic text-[var(--text-secondary)]">
          <TextObstacles text="Personality begins where comparison ends." />
        </p>

        {/* Author & Identity Tagline */}
        <div className="relative z-10 mt-3 flex items-center gap-2 font-sans text-xs md:text-sm font-medium text-[var(--text-muted)]">
          <span data-obstacle="true">Aaron Hu</span>
          <span>·</span>
          <span data-obstacle="true" className="text-[var(--text-secondary)]">数字工匠 & 前端探索者</span>
        </div>

        {/* Tech Focus Tags */}
        <div className="relative z-10 mt-6 flex flex-wrap items-center justify-center gap-2 max-w-md">
          {['Web Graphics', 'Architecture', 'AI Engineering', 'Minimalist UI'].map((tag) => (
            <span
              key={tag}
              data-obstacle="true"
              className="rounded-full border border-[var(--border)] bg-[var(--surface)]/90 px-3 py-1 font-mono text-[11px] text-[var(--text-secondary)] backdrop-blur-sm shadow-sm"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Social & Quick Links */}
        <div className="relative z-10 mt-8 flex items-center gap-4">
          <a
            href="https://github.com/Dayang26"
            target="_blank"
            rel="noopener noreferrer"
            data-obstacle="true"
            className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 py-1.5 font-sans text-xs font-medium text-[var(--text-secondary)] shadow-sm transition-all hover:border-[var(--accent)] hover:text-[var(--accent)] hover:shadow-md"
            title="GitHub 个人主页"
          >
            <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            <span>GitHub</span>
          </a>

          <a
            href="/rss.xml"
            target="_blank"
            rel="noopener noreferrer"
            data-obstacle="true"
            className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 py-1.5 font-sans text-xs font-medium text-[var(--text-secondary)] shadow-sm transition-all hover:border-[var(--accent)] hover:text-[var(--accent)] hover:shadow-md"
            title="RSS 订阅"
          >
            <svg className="h-4 w-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
              <path d="M4 11a9 9 0 0 1 9 9" />
              <path d="M4 4a16 16 0 0 1 16 16" />
              <circle cx="5" cy="19" r="1" />
            </svg>
            <span>RSS</span>
          </a>

          <a
            href="mailto:flyhsyy@gmail.com"
            data-obstacle="true"
            className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 py-1.5 font-sans text-xs font-medium text-[var(--text-secondary)] shadow-sm transition-all hover:border-[var(--accent)] hover:text-[var(--accent)] hover:shadow-md"
            title="发送邮件联系我"
          >
            <svg className="h-4 w-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            <span>Email</span>
          </a>
        </div>
      </section>

      {/* ─── Featured Post Spotlight ─── */}
      {featuredPost && (
        <section className="mb-16">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-heading text-xl font-bold tracking-tight text-[var(--text-primary)]">
              精选推荐
            </h2>
            <span className="font-mono text-xs text-[var(--accent)]">Featured Post</span>
          </div>

          <Link
            href={`/blog/${featuredPost.slug}`}
            className="group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 md:p-8 shadow-[var(--card-shadow)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--accent)] hover:shadow-[var(--card-shadow-hover)]"
          >
            <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-[var(--text-muted)]">
              <span className="rounded-md bg-[var(--accent-subtle)] px-2 py-0.5 font-semibold text-[var(--accent)]">
                {featuredPost.tags[0] ? getTagLabel(featuredPost.tags[0]) : 'Deep Dive'}
              </span>
              <span>{formatBlogDate(featuredPost.date)}</span>
              <span>·</span>
              <span>{featuredPost.readMinutes} 分钟阅读</span>
            </div>

            <h3 className="font-heading text-2xl md:text-3xl font-bold tracking-tight text-[var(--text-primary)] transition-colors group-hover:text-[var(--accent)]">
              {featuredPost.title}
            </h3>

            <p className="font-sans text-sm md:text-base leading-relaxed text-[var(--text-secondary)] line-clamp-3">
              {featuredPost.excerpt}
            </p>

            <div className="mt-2 flex items-center gap-1 font-sans text-xs font-semibold text-[var(--accent)]">
              <span>阅读全文</span>
              <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
            </div>
          </Link>
        </section>
      )}

      {/* ─── Recent Posts Cards Grid ─── */}
      <section className="flex flex-col pb-20">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="font-heading text-xl font-bold tracking-tight text-[var(--text-primary)]">
            最新文章
          </h2>
          <Link 
            href="/blog" 
            className="font-sans text-xs font-medium text-[var(--accent)] transition-colors hover:text-[var(--accent-hover)]"
          >
            查看全部 →
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {recentPosts.map((post, index) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col justify-between rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--card-shadow)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--accent)] hover:shadow-[var(--card-shadow-hover)] animate-fade-in"
              style={{ animationDelay: `${index * 40}ms` }}
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between font-mono text-[11px] text-[var(--text-muted)]">
                  <span>{formatBlogDate(post.date)}</span>
                  <span>{post.readMinutes} min</span>
                </div>
                <h3 className="font-heading text-base font-semibold leading-snug text-[var(--text-primary)] transition-colors group-hover:text-[var(--accent)] line-clamp-2">
                  {post.title}
                </h3>
                <p className="line-clamp-2 font-sans text-xs leading-relaxed text-[var(--text-secondary)]">
                  {post.excerpt}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-[var(--border)]/60 pt-3">
                <div className="flex flex-wrap gap-1.5 font-mono text-[10px] text-[var(--accent)]">
                  {post.tags.slice(0, 2).map((tag: string) => (
                    <span key={tag} className="rounded bg-[var(--accent-subtle)] px-1.5 py-0.5">
                      {getTagLabel(tag)}
                    </span>
                  ))}
                </div>
                <span className="font-sans text-xs text-[var(--text-muted)] transition-transform duration-200 group-hover:translate-x-1 group-hover:text-[var(--accent)]">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
