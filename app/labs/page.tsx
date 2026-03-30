'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { labModules } from '@/lib/config/labs.config';
import { LabCard } from '@/components/labs/LabCard';
import { useBlogLanguage } from '@/hooks/useBlogLanguage';

const EarthBackground = dynamic(
  () => import('@/components/labs/EarthBackground').then((mod) => mod.EarthBackground),
  {
    ssr: false,
    loading: () => null,
  }
);

export default function LabsPage() {
  const { lang } = useBlogLanguage('en');
  const isZh = lang === 'zh';

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-slate-100">
      {/* 3D Earth Background */}
      <EarthBackground />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col pointer-events-none">
        {/* Header */}
        <header className="flex items-center justify-between px-8 py-6 pointer-events-auto">
          <h1 className="text-lg font-bold uppercase tracking-[0.2em]">
            {isZh ? '实验区域' : 'Labs'}
          </h1>
          <Link
            href="/"
            className="border-2 border-slate-200/60 bg-slate-900/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-slate-300 hover:border-slate-200/90"
          >
            {isZh ? '返回首页' : 'Back to Home'}
          </Link>
        </header>

        {/* Vertical Module List (Left Side) */}
        <main className="flex flex-1 items-center justify-start px-8 pb-8 pointer-events-none">
          <div className="flex w-80 flex-col gap-6 pointer-events-auto">
            {labModules.map((module) => (
              <LabCard key={module.id} module={module} />
            ))}

            {/* Placeholder cards for future expansion */}
            {labModules.length < 3 &&
              Array.from({ length: 3 - labModules.length }).map((_, i) => (
                <div
                  key={`placeholder-${i}`}
                  className="flex min-h-[160px] items-center justify-center border-2 border-dashed border-slate-700 bg-slate-900/40"
                >
                  <span className="text-xs uppercase tracking-[0.15em] text-slate-600">
                    {isZh ? '即将推出' : 'Coming Soon'}
                  </span>
                </div>
              ))}
          </div>
        </main>
      </div>
    </div>
  );
}