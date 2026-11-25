'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

export function Header() {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const isBlog = pathname.startsWith('/blog');

  const handleOpenSearch = () => {
    window.dispatchEvent(new CustomEvent('open-command-menu'));
  };

  return (
    <header className="pointer-events-none sticky top-3 sm:top-4 z-40 mx-auto w-full max-w-[1200px] px-4 sm:px-6">
      <div className="pointer-events-auto mx-auto flex max-w-[880px] items-center justify-between gap-2 sm:gap-4 rounded-full glass-pill px-4 py-2 sm:px-5 sm:py-2.5 transition-all duration-300">
        {/* Brand Logo */}
        <Link
          href="/"
          className="group flex items-center gap-2.5 font-heading text-base sm:text-lg font-bold tracking-[0.14em] text-[var(--text-primary)] transition-colors hover:text-[var(--accent)]"
        >
          <span className="relative flex h-2.5 w-2.5 items-center justify-center">
            <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-45 blur-[3px] transition-transform duration-300 group-hover:scale-150" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--accent)] transition-transform duration-300 group-hover:scale-125" />
          </span>
          <span>SnowLine</span>
        </Link>

        {/* Center / Right Navigation & Tools */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Navigation Pills */}
          <nav className="flex items-center gap-1" aria-label="主导航">
            <Link
              href="/"
              className={`hidden sm:inline-flex items-center rounded-full px-3 py-1.5 font-sans text-xs font-medium transition-all duration-200 ${
                isHome
                  ? 'bg-[var(--accent-subtle)] text-[var(--accent)] shadow-[inset_0_1px_0_var(--glass-specular-top)]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]'
              }`}
            >
              首页
            </Link>
            <Link
              href="/blog"
              className={`inline-flex items-center rounded-full px-3 py-1.5 font-sans text-xs font-medium transition-all duration-200 ${
                isBlog
                  ? 'bg-[var(--accent-subtle)] text-[var(--accent)] shadow-[inset_0_1px_0_var(--glass-specular-top)]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]'
              }`}
            >
              博客
            </Link>
          </nav>

          <div className="h-4 w-px bg-[var(--border)] mx-0.5" aria-hidden="true" />

          {/* Spotlight Search Trigger */}
          <button
            type="button"
            onClick={handleOpenSearch}
            className="group flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-2.5 sm:px-3 py-1.5 text-xs text-[var(--text-secondary)] transition-all duration-200 hover:border-[var(--accent)]/40 hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] active:scale-95"
            title="全站搜索 (⌘K)"
            aria-label="打开全站搜索"
          >
            <svg
              className="h-3.5 w-3.5 text-[var(--text-muted)] transition-colors group-hover:text-[var(--accent)]"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <span className="hidden md:inline font-sans">搜索</span>
            <kbd className="hidden sm:inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--surface-solid)]/60 px-1.5 py-0.5 font-mono text-[10px] leading-none text-[var(--text-muted)]">
              ⌘K
            </kbd>
          </button>

          {/* GitHub */}
          <a
            href="https://github.com/Dayang26"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-secondary)] transition-all duration-200 hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] active:scale-95"
            aria-label="GitHub"
            title="GitHub"
          >
            <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
          </a>

          {/* Theme Toggle */}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
