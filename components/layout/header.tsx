import Link from 'next/link';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-6">
        <Link 
          href="/" 
          className="font-heading text-xl font-bold tracking-[0.15em] text-[var(--text-primary)] transition-colors hover:text-[var(--accent)]"
        >
          SnowLine
        </Link>
        <nav>
          <Link 
            href="/blog" 
            className="font-sans font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--accent)]"
          >
            博客
          </Link>
        </nav>
      </div>
    </header>
  );
}
