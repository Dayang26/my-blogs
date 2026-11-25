'use client';

import { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { type PostListItem } from '@/types/blog';
import { formatBlogDate, getTagLabel } from '@/lib/blog-shared';
import { ParticleModeControl } from '@/components/particles/ParticleModeControl';
import type { ParticleMode } from '@/components/particles/config';

const ParticleBackground = dynamic(
  () => import('@/components/particles/ParticleBackground').then((m) => ({ default: m.ParticleBackground })),
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
  const [particlesEnabled, setParticlesEnabled] = useState(false);
  const [particleMode, setParticleMode] = useState<ParticleMode>('flock');

  const isMorph = particlesEnabled && particleMode === 'morph';

  const featuredPost = posts.find((p) => p.featured) || posts[0];
  const recentPosts = posts.filter((p) => p.slug !== featuredPost?.slug).slice(0, 6);

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col px-6">
      {/* ─── Hero Section ─── */}
      <section className="relative flex min-h-[600px] md:min-h-[660px] flex-col items-center justify-center text-center animate-fade-in py-16 md:py-24">
        {particlesEnabled && <ParticleBackground mode={particleMode} />}

        {/* Identity Glass Badge */}
        <div
          data-obstacle="true"
          className="relative z-10 mb-6 inline-flex items-center gap-2 rounded-full glass-pill px-4 py-1.5 font-sans text-xs font-medium text-[var(--text-secondary)]"
        >
          <span className="h-2 w-2 rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]" aria-hidden="true" />
          <span>Aaron Hu</span>
          <span className="text-[var(--text-muted)]">·</span>
          <span className="text-[var(--text-primary)]">数字工匠 & 前端探索者</span>
        </div>

        {/* Main Title (Hidden only in Morph mode, replaced in-place by particle text) */}
        <h1
          className={`relative z-10 font-heading text-[clamp(3rem,2.2rem+4.5vw,4.75rem)] font-bold tracking-[0.18em] leading-none text-[var(--text-primary)] select-none transition-opacity duration-300 ${
            isMorph ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          <TextObstacles text="SnowLine" />
        </h1>

        {/* Motto / Slogan */}
        <p className="relative z-10 mt-6 max-w-xl font-sans text-base md:text-lg text-[var(--text-secondary)] text-balance">
          <TextObstacles text="Personality begins where comparison ends." />
        </p>

        {/* Tech Focus Glass Pills */}
        <div className="relative z-10 mt-7 flex flex-wrap items-center justify-center gap-2 max-w-lg">
          {['Web Graphics', 'Architecture', 'AI Engineering', 'Liquid UI'].map((tag) => (
            <span
              key={tag}
              data-obstacle="true"
              className="rounded-full border border-[var(--glass-stroke)] bg-[var(--surface)] px-3.5 py-1 font-mono text-[11px] font-medium text-[var(--text-secondary)] backdrop-blur-md shadow-[inset_0_1px_0_var(--glass-specular-top)]"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Primary CTA + Glass Social Dock */}
        <div className="relative z-10 mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/blog"
            data-obstacle="true"
            className="group inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-6 py-2.5 font-sans text-sm font-semibold text-[var(--accent-fg)] shadow-[0_8px_24px_-4px_var(--accent-glow),inset_0_1px_0_rgba(255,255,255,0.35)] transition-all duration-200 hover:bg-[var(--accent-hover)] hover:shadow-[0_12px_28px_-4px_var(--accent-glow)] active:scale-95"
          >
            <span>探索全部文章</span>
            <span className="transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true">→</span>
          </Link>

          <div
            data-obstacle="true"
            className="inline-flex items-center gap-1 rounded-full glass-pill p-1"
            role="group"
            aria-label="社交与订阅入口"
          >
            <a
              href="https://github.com/Dayang26"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-sans text-xs font-medium text-[var(--text-secondary)] transition-all duration-200 hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] active:scale-95"
              title="GitHub 个人主页"
            >
              <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <span>GitHub</span>
            </a>

            <a
              href="/rss.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-sans text-xs font-medium text-[var(--text-secondary)] transition-all duration-200 hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] active:scale-95"
              title="RSS 订阅"
            >
              <svg className="h-3.5 w-3.5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2" aria-hidden="true">
                <path d="M4 11a9 9 0 0 1 9 9" />
                <path d="M4 4a16 16 0 0 1 16 16" />
                <circle cx="5" cy="19" r="1" />
              </svg>
              <span>RSS</span>
            </a>

            <a
              href="mailto:flyhsyy@gmail.com"
              className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-sans text-xs font-medium text-[var(--text-secondary)] transition-all duration-200 hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] active:scale-95"
              title="发送邮件联系我"
            >
              <svg className="h-3.5 w-3.5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2" aria-hidden="true">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <span>Email</span>
            </a>
          </div>
        </div>

        {/* Particle Mode Segmented Control */}
        <div className="absolute bottom-4 right-2 sm:right-4 z-20">
          <ParticleModeControl
            enabled={particlesEnabled}
            currentMode={particleMode}
            onToggle={() => setParticlesEnabled((prev) => !prev)}
            onModeChange={setParticleMode}
          />
        </div>
      </section>

      {/* ─── Featured Post Bento Spotlight ─── */}
      {featuredPost && (
        <section className="mb-16">
          <div className="mb-6 flex items-center justify-between px-1">
            <div className="flex items-center gap-2.5">
              <span className="h-2 w-2 rounded-full bg-[var(--accent)]" aria-hidden="true" />
              <h2 className="font-heading text-xl font-bold tracking-tight text-[var(--text-primary)]">
                精选推荐
              </h2>
            </div>
            <span className="rounded-full glass-pill px-3 py-1 font-mono text-[11px] font-medium text-[var(--accent)]">
              Featured Story
            </span>
          </div>

          <Link
            href={`/blog/${featuredPost.slug}`}
            className="group relative flex flex-col gap-5 overflow-hidden rounded-3xl glass-card glass-card-interactive p-7 md:p-10"
          >
            {/* Subtle Refractive Glow Accent */}
            <div
              className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-55 blur-3xl transition-opacity duration-500 group-hover:opacity-85"
              style={{ background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)' }}
              aria-hidden="true"
            />

            <div className="relative z-10 flex flex-wrap items-center gap-3 font-mono text-xs text-[var(--text-muted)]">
              <span className="rounded-full bg-[var(--accent-subtle)] px-3 py-1 font-semibold text-[var(--accent)] shadow-[inset_0_1px_0_var(--glass-specular-top)]">
                {featuredPost.tags[0] ? getTagLabel(featuredPost.tags[0]) : 'Deep Dive'}
              </span>
              <span>{formatBlogDate(featuredPost.date)}</span>
              <span>·</span>
              <span>{featuredPost.readMinutes} 分钟阅读</span>
            </div>

            <h3 className="relative z-10 font-heading text-2xl md:text-3xl font-bold tracking-tight text-balance text-[var(--text-primary)] transition-colors duration-200 group-hover:text-[var(--accent)]">
              {featuredPost.title}
            </h3>

            <p className="relative z-10 max-w-3xl font-sans text-sm md:text-base leading-relaxed text-[var(--text-secondary)] line-clamp-3">
              {featuredPost.excerpt}
            </p>

            <div className="relative z-10 mt-1 flex items-center justify-between pt-2">
              <div className="flex flex-wrap gap-2">
                {featuredPost.tags.slice(1, 4).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-[var(--border)] bg-[var(--surface)]/60 px-2.5 py-0.5 font-mono text-[11px] text-[var(--text-muted)]"
                  >
                    #{getTagLabel(tag)}
                  </span>
                ))}
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full glass-button px-4 py-1.5 font-sans text-xs font-semibold text-[var(--accent)]">
                <span>阅读全文</span>
                <span className="transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true">→</span>
              </span>
            </div>
          </Link>
        </section>
      )}

      {/* ─── Recent Posts Bento Grid ─── */}
      <section className="flex flex-col pb-12">
        <div className="mb-7 flex items-center justify-between px-1">
          <div className="flex items-center gap-2.5">
            <span className="h-2 w-2 rounded-full bg-[var(--text-muted)]/60" aria-hidden="true" />
            <h2 className="font-heading text-xl font-bold tracking-tight text-[var(--text-primary)]">
              最新文章
            </h2>
          </div>
          <Link
            href="/blog"
            className="inline-flex items-center gap-1 rounded-full glass-button px-3.5 py-1.5 font-sans text-xs font-medium text-[var(--accent)]"
          >
            <span>查看全部</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {recentPosts.map((post, index) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col justify-between rounded-3xl glass-card glass-card-interactive p-6 animate-fade-in"
              style={{ animationDelay: `${index * 45}ms` }}
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between font-mono text-[11px] text-[var(--text-muted)]">
                  <span>{formatBlogDate(post.date)}</span>
                  <span className="rounded-full bg-[var(--surface)]/70 px-2 py-0.5">{post.readMinutes} min</span>
                </div>
                <h3 className="font-heading text-base font-bold leading-snug text-balance text-[var(--text-primary)] transition-colors duration-200 group-hover:text-[var(--accent)] line-clamp-2">
                  {post.title}
                </h3>
                <p className="line-clamp-2 font-sans text-xs leading-relaxed text-[var(--text-secondary)]">
                  {post.excerpt}
                </p>
              </div>

              <div className="mt-5 flex items-center justify-between pt-2">
                <div className="flex flex-wrap gap-1.5 font-mono text-[10.5px] text-[var(--accent)]">
                  {post.tags.slice(0, 2).map((tag: string) => (
                    <span
                      key={tag}
                      className="rounded-full bg-[var(--accent-subtle)] px-2.5 py-0.5 font-medium"
                    >
                      {getTagLabel(tag)}
                    </span>
                  ))}
                </div>
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--surface)]/70 font-sans text-xs text-[var(--text-muted)] transition-all duration-200 group-hover:translate-x-0.5 group-hover:bg-[var(--accent-subtle)] group-hover:text-[var(--accent)]"
                  aria-hidden="true"
                >
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
