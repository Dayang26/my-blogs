'use client';

import { useState } from 'react';

export function Footer() {
  const [year] = useState(() => {
    if (typeof window === 'undefined') return null;
    return new Date().getFullYear();
  });

  return (
    <footer className="w-full border-t border-[var(--border)] mt-20">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-center gap-2 px-6 py-8 text-center text-xs text-[var(--text-muted)] md:flex-row md:gap-1">
        <span>&copy; {year} SnowLine</span>
        <span className="hidden md:inline">&middot;</span>
        <span className="italic">Personality begins where comparison ends.</span>
        <span className="hidden md:inline">&middot;</span>
        <span>Aaron Hu &middot; <a href="mailto:flyhsyy@gmail.com" className="transition-colors hover:text-[var(--accent)]">flyhsyy@gmail.com</a></span>
      </div>
    </footer>
  );
}
