'use client';

import Link from 'next/link';
import { useBlogLanguage } from '@/hooks/useBlogLanguage';
import { LANGS } from '@/types/blog';
import { getLanguageLabel } from '@/lib/blog-shared';

const navLinks = [
  { href: '/labs', en: 'Enter Lab', zh: '进入试验区', primary: true },
  { href: '/blog', en: 'Blog', zh: '日志区域', primary: false },
  { href: '/shop', en: 'Shop', zh: '积分商城', primary: false },
] as const;

export function HomeClient() {
  const { lang, setLang } = useBlogLanguage('en');

  return (
    <div className="absolute right-8 top-1/2 flex -translate-y-1/2 flex-col gap-4">
      <div className="flex items-center gap-2">
        {LANGS.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setLang(option)}
            className={`px-2 py-1 text-xs font-bold uppercase tracking-[0.15em] transition ${
              lang === option
                ? 'border-2 border-cyan-200/90 bg-cyan-400/90 text-slate-950'
                : 'border-2 border-slate-200/60 bg-slate-900/80 text-slate-300 hover:border-slate-200/90'
            }`}
          >
            {option === 'en' ? 'EN' : '中文'}
          </button>
        ))}
      </div>
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`border-2 px-6 py-4 text-center text-sm font-bold uppercase tracking-[0.2em] transition active:translate-x-1 active:translate-y-1 ${
            link.primary
              ? 'border-cyan-200/90 bg-cyan-400/90 text-slate-950 shadow-[6px_6px_0px_rgba(14,116,144,0.8)] active:shadow-[3px_3px_0px_rgba(14,116,144,0.8)]'
              : 'border-slate-200/90 bg-slate-900/90 text-slate-100 shadow-[6px_6px_0px_rgba(30,41,59,0.9)] active:shadow-[3px_3px_0px_rgba(30,41,59,0.9)]'
          }`}
        >
          {lang === 'en' ? link.en : link.zh}
        </Link>
      ))}
    </div>
  );
}