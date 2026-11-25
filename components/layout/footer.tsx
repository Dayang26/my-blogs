import Link from 'next/link';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 w-full px-6 pb-10">
      <div className="mx-auto max-w-[1200px]">
        <div
          className="mb-8 h-px w-full bg-gradient-to-r from-transparent via-[var(--border)] to-transparent"
          aria-hidden="true"
        />

        <div className="flex flex-col items-center justify-between gap-6 rounded-3xl glass-card px-6 py-6 md:flex-row">
          {/* Left info */}
          <div className="flex flex-col items-center gap-1 md:items-start text-xs text-[var(--text-muted)]">
            <div className="flex items-center gap-2 font-mono text-[var(--text-primary)] font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" aria-hidden="true" />
              <span>&copy; {year} SnowLine</span>
              <span className="text-[var(--text-muted)]">·</span>
              <span>Aaron Hu</span>
            </div>
            <p className="font-sans italic text-[var(--text-muted)]">
              Personality begins where comparison ends.
            </p>
          </div>

          {/* Right Links */}
          <nav className="flex flex-wrap items-center justify-center gap-2 font-sans text-xs text-[var(--text-secondary)]" aria-label="页脚导航">
            <Link
              href="/"
              className="rounded-full px-3 py-1.5 transition-all duration-200 hover:bg-[var(--surface-hover)] hover:text-[var(--accent)]"
            >
              首页
            </Link>
            <Link
              href="/blog"
              className="rounded-full px-3 py-1.5 transition-all duration-200 hover:bg-[var(--surface-hover)] hover:text-[var(--accent)]"
            >
              全部文章
            </Link>
            <a
              href="/rss.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full px-3 py-1.5 transition-all duration-200 hover:bg-[var(--surface-hover)] hover:text-[var(--accent)]"
            >
              RSS 订阅
            </a>
            <a
              href="https://github.com/Dayang26"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full px-3 py-1.5 transition-all duration-200 hover:bg-[var(--surface-hover)] hover:text-[var(--accent)]"
            >
              GitHub
            </a>
            <a
              href="mailto:flyhsyy@gmail.com"
              className="rounded-full px-3 py-1.5 transition-all duration-200 hover:bg-[var(--surface-hover)] hover:text-[var(--accent)]"
            >
              联系邮箱
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
