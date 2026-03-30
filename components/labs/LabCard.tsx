'use client';

import Link from 'next/link';
import { LabModule } from '@/types/lab';
import { useBlogLanguage } from '@/hooks/useBlogLanguage';

interface LabCardProps {
  module: LabModule;
}

export function LabCard({ module }: LabCardProps) {
  const { lang } = useBlogLanguage('en');
  const isZh = lang === 'zh';
  const title = module.title[lang];
  const description = module.description[lang];
  const isReady = module.status === 'ready';

  return (
    <Link
      href={isReady ? module.path : '#'}
      className={`group relative block border-2 p-4 transition active:translate-x-1 active:translate-y-1 ${
        isReady
          ? 'border-cyan-200/90 bg-cyan-400/90 text-slate-950 hover:border-cyan-200 cursor-pointer'
          : 'border-slate-200/60 bg-slate-900/80 text-slate-400 cursor-not-allowed'
      }`}
    >
      {/* Status Badge */}
      {!isReady && (
        <span className="absolute right-2 top-2 rounded bg-slate-700 px-2 py-0.5 text-xs font-bold uppercase text-slate-300">
          {isZh ? '即将推出' : 'Coming Soon'}
        </span>
      )}

      {/* Icon */}
      <div className="mb-3 text-4xl">{module.icon}</div>

      {/* Title */}
      <h3 className="mb-2 text-sm font-bold uppercase tracking-[0.15em]">{title}</h3>

      {/* Description */}
      <p className="text-xs opacity-80">{description}</p>
    </Link>
  );
}