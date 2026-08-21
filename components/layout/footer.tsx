import Link from 'next/link';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-[var(--border)] bg-[var(--surface)]/50 mt-20 transition-colors">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-6 px-6 py-10 md:flex-row">
        {/* Left info */}
        <div className="flex flex-col items-center gap-1 md:items-start text-xs text-[var(--text-muted)]">
          <div className="flex items-center gap-2 font-mono text-[var(--text-secondary)] font-medium">
            <span>&copy; {year} SnowLine</span>
            <span>·</span>
            <span>Aaron Hu</span>
          </div>
          <p className="font-sans italic text-[var(--text-muted)]">
            Personality begins where comparison ends.
          </p>
        </div>

        {/* Center / Right Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 font-sans text-xs text-[var(--text-secondary)]">
          <Link href="/" className="transition-colors hover:text-[var(--accent)]">
            首页
          </Link>
          <Link href="/blog" className="transition-colors hover:text-[var(--accent)]">
            全部文章
          </Link>
          <a
            href="/rss.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-[var(--accent)]"
          >
            RSS 订阅
          </a>
          <a
            href="https://github.com/Dayang26"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-[var(--accent)]"
          >
            GitHub
          </a>
          <a
            href="mailto:flyhsyy@gmail.com"
            className="transition-colors hover:text-[var(--accent)]"
          >
            联系邮箱
          </a>
        </div>
      </div>
    </footer>
  );
}
