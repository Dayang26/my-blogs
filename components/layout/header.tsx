'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

export function Header() {
  const pathname = usePathname();

  const handleOpenSearch = () => {
    window.dispatchEvent(new CustomEvent('open-command-menu'));
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--border)] bg-[var(--header-bg)] backdrop-blur-md transition-colors">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link 
          href="/" 
          className="group flex items-center gap-2 font-heading text-lg font-bold tracking-[0.18em] text-[var(--text-primary)] transition-colors hover:text-[var(--accent)]"
        >
          <span className="h-2 w-2 rounded-full bg-[var(--accent)] transition-transform duration-300 group-hover:scale-150" />
          <span>SnowLine</span>
        </Link>

        {/* Right Tools & Nav */}
        <div className="flex items-center gap-3 md:gap-5">
          {/* Quick Search Button */}
          <button
            type="button"
            onClick={handleOpenSearch}
            className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 text-xs text-[var(--text-muted)] transition-all hover:border-[var(--accent)] hover:text-[var(--text-primary)]"
            title="搜索 (⌘K)"
          >
            <svg
              className="h-3.5 w-3.5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <span className="hidden sm:inline">搜索</span>
            <kbd className="hidden font-mono text-[10px] text-[var(--text-muted)] sm:inline-block">
              ⌘K
            </kbd>
          </button>

          {/* Navigation Links */}
          <nav className="flex items-center gap-4 text-sm">
            <Link 
              href="/blog" 
              className={`font-sans transition-colors ${
                pathname.startsWith('/blog')
                  ? 'font-semibold text-[var(--accent)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              博客
            </Link>

            <a
              href="https://github.com/Dayang26"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
              aria-label="GitHub"
              title="GitHub"
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
            </a>
          </nav>

          {/* Theme Toggle Button */}
          <div className="border-l border-[var(--border)] pl-2">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
