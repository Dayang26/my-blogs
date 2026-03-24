'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useBlogLanguage } from '@/hooks/useBlogLanguage';
import { LANGS, type Lang, type PostEntity, type PostListItem } from '@/types/blog';
import { formatBlogDate, getI18n, getLanguageLabel, getTagLabel } from '@/lib/blog-shared';
import { MDXContent } from '@/components/mdx-content';
import { Giscus } from '@/components/mdx/giscus';
import { giscusConfig, commentsUiText } from '@/lib/giscus-config';

const uiText = {
  zh: {
    back: '返回博客',
    related: '相关文章',
    prev: '上一条',
    next: '下一条',
    meta: '文章信息',
    series: '所属系列',
    read: '阅读时长',
    minutes: '分钟',
    fallback: '内容语言已切换为',
    unavailable: '内容不可用',
  },
  en: {
    back: 'Back to Blog',
    related: 'Related Posts',
    prev: 'Previous',
    next: 'Next',
    meta: 'Post Info',
    series: 'Series',
    read: 'Read time',
    minutes: 'min',
    fallback: 'Content fallback to',
    unavailable: 'Content unavailable',
  },
};

type BlogPostClientProps = {
  post: PostEntity;
  prev: PostListItem | null;
  next: PostListItem | null;
  related: PostListItem[];
};

export default function BlogPostClient({ post, prev, next, related }: BlogPostClientProps) {
  const { lang, setLang } = useBlogLanguage('zh');
  
  const availableLang = useMemo(() => {
    if (post.i18n[lang]) return lang;
    if (post.i18n.zh) return 'zh';
    if (post.i18n.en) return 'en';
    return null;
  }, [lang, post]);
  
  const currentLang = availableLang || lang;
  const content = useMemo(() => getI18n(post, currentLang), [post, currentLang]);
  const copy = uiText[currentLang];

  if (!content) {
    return (
      <div className="pixel-card mx-auto max-w-4xl p-8 text-center text-sm text-slate-300">
        {copy.unavailable}
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),_rgba(15,23,42,0.92))]" />
        <div className="pixel-grid absolute inset-0 opacity-50" />
        <div className="scanlines absolute inset-0 opacity-40" />
      </div>

      <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 pb-20 pt-12">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/blog" className="pixel-chip px-4 py-2 text-xs font-mono uppercase tracking-[0.2em]">
            {copy.back}
          </Link>
          <div className="flex items-center rounded-lg border border-slate-700/50 bg-slate-900/50 p-0.5">
            {LANGS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setLang(option)}
                className={`relative px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] transition-colors ${
                  lang === option ? 'text-cyan-100' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {lang === option && (
                  <span className="absolute inset-0 rounded-md bg-cyan-500/10" />
                )}
                {getLanguageLabel(option)}
              </button>
            ))}
          </div>
        </header>

        <section className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono uppercase tracking-[0.2em] text-slate-300">
            <span>{formatBlogDate(post.date)}</span>
            <span>
              {content.readMinutes} {copy.minutes}
            </span>
            {post.type && <span>{post.type}</span>}
          </div>
          <h1 className="text-3xl font-bold uppercase tracking-[0.12em] md:text-4xl">
            {content.title}
          </h1>
          <p className="max-w-3xl text-sm font-mono leading-relaxed text-slate-200/90 md:text-base">
            {content.excerpt}
          </p>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="pixel-chip cursor-default px-3 py-2 text-xs font-bold uppercase tracking-[0.2em]"
              >
                {getTagLabel(tag, lang)}
              </span>
            ))}
          </div>
          {availableLang && availableLang !== lang && (
            <div className="text-xs font-mono uppercase tracking-[0.2em] text-amber-200">
              {copy.fallback} {getLanguageLabel(availableLang)}
            </div>
          )}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_260px]">
          <article className="pixel-card p-6">
            <div className="mdx-content text-sm leading-relaxed text-slate-200">
              <MDXContent code={content.code} />
            </div>
          </article>

          <aside className="flex flex-col gap-4">
            <div className="pixel-card flex flex-col gap-2 p-4">
              <div className="text-xs font-mono uppercase tracking-[0.2em] text-slate-400">
                {copy.meta}
              </div>
              <div className="text-sm font-semibold">{formatBlogDate(post.date)}</div>
              <div className="text-xs font-mono text-slate-300">
                {copy.read}: {content.readMinutes} {copy.minutes}
              </div>
              {post.series && (
                <div className="mt-2">
                  <div className="text-xs font-mono uppercase tracking-[0.2em] text-slate-400">
                    {copy.series}
                  </div>
                  <div className="text-sm font-semibold text-cyan-100">{post.series}</div>
                </div>
              )}
            </div>

            <div className="pixel-card flex flex-col gap-3 p-4">
              {prev && (
                <Link href={`/blog/${prev.slug}`} className="flex flex-col gap-1">
                  <span className="text-xs font-mono uppercase tracking-[0.2em] text-slate-400">
                    {copy.prev}
                  </span>
                  <span className="text-sm font-semibold text-slate-100">
                    {getI18n(prev, lang)?.title}
                  </span>
                </Link>
              )}
              {next && (
                <Link href={`/blog/${next.slug}`} className="flex flex-col gap-1">
                  <span className="text-xs font-mono uppercase tracking-[0.2em] text-slate-400">
                    {copy.next}
                  </span>
                  <span className="text-sm font-semibold text-slate-100">
                    {getI18n(next, lang)?.title}
                  </span>
                </Link>
              )}
            </div>
          </aside>
        </section>

        {related.length > 0 && (
          <section className="flex flex-col gap-4">
            <h2 className="text-xl font-bold uppercase tracking-[0.12em]">{copy.related}</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {related.map((item) => {
                const relatedContent = getI18n(item, lang);
                if (!relatedContent) return null;
                return (
                  <Link key={item.slug} href={`/blog/${item.slug}`} className="pixel-card flex flex-col gap-3 p-4">
                    <div className="text-xs font-mono uppercase tracking-[0.2em] text-slate-400">
                      {formatBlogDate(item.date)}
                    </div>
                    <div className="text-sm font-semibold text-slate-100">{relatedContent.title}</div>
                    <div className="text-xs text-slate-300">{relatedContent.excerpt}</div>
                  </Link>
                );
              })}
      </div>
      </section>
      )}

      <section className="pixel-card mt-8 p-6">
        <h3 className="mb-4 text-lg font-bold uppercase tracking-[0.12em]">
          {commentsUiText[lang].comments}
        </h3>
        {giscusConfig.repoId && giscusConfig.categoryId ? (
          <Giscus {...giscusConfig} />
        ) : (
          <div className="text-sm text-slate-400">
            请在 GitHub 上启用 Discussions 并配置 Giscus。详见 lib/giscus-config.ts
          </div>
        )}
      </section>
    </main>
    </div>
  );
}
