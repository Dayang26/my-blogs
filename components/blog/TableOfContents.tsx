'use client';

import React, { useEffect, useState } from 'react';

type TocItem = {
  id: string;
  text: string;
  level: number;
};

export function TableOfContents({ articleSelector = '.mdx-content' }: { articleSelector?: string }) {
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    let unobserve = () => {};

    const timer = setTimeout(() => {
      const article = document.querySelector(articleSelector);
      if (!article) return;

      const elements = Array.from(article.querySelectorAll('h2, h3')) as HTMLElement[];
      const items: TocItem[] = [];

      elements.forEach((el, index) => {
        let id = el.id;
        if (!id) {
          id = el.textContent
            ? el.textContent.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w\u4e00-\u9fa5-]/g, '')
            : `heading-${index}`;
          el.id = id;
        }

        items.push({
          id,
          text: el.textContent || '',
          level: el.tagName === 'H2' ? 2 : 3,
        });
      });

      setHeadings(items);

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveId(entry.target.id);
            }
          });
        },
        {
          rootMargin: '0px 0px -70% 0px',
          threshold: 0.1,
        }
      );

      elements.forEach((el) => observer.observe(el));
      unobserve = () => {
        elements.forEach((el) => observer.unobserve(el));
        observer.disconnect();
      };
    }, 50);

    return () => {
      clearTimeout(timer);
      unobserve();
    };
  }, [articleSelector]);

  if (headings.length < 2) {
    return null;
  }

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
      setActiveId(id);
      window.history.pushState(null, '', `#${id}`);
    }
  };

  return (
    <aside className="sticky top-24 hidden max-h-[calc(100vh-8rem)] w-60 overflow-y-auto rounded-3xl glass-card p-4 xl:block">
      <div className="flex items-center gap-2 px-2 pb-3 font-mono text-[11px] font-semibold tracking-wider text-[var(--text-primary)] uppercase">
        <svg
          className="h-3.5 w-3.5 text-[var(--accent)]"
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
            d="M4 6h16M4 12h10M4 18h14"
          />
        </svg>
        <span>文章目录</span>
      </div>

      <nav className="flex flex-col gap-0.5 text-xs" aria-label="文章目录导航">
        {headings.map((h) => {
          const isActive = activeId === h.id;
          return (
            <a
              key={h.id}
              href={`#${h.id}`}
              onClick={(e) => handleClick(e, h.id)}
              className={`rounded-xl px-2.5 py-1.5 transition-all duration-200 line-clamp-1 ${
                h.level === 3 ? 'pl-5' : ''
              } ${
                isActive
                  ? 'bg-[var(--accent-subtle)] font-semibold text-[var(--accent)] shadow-[inset_0_1px_0_var(--glass-specular-top)]'
                  : 'text-[var(--text-muted)] hover:bg-[var(--surface-hover)]/60 hover:text-[var(--text-primary)]'
              }`}
              title={h.text}
            >
              {h.text}
            </a>
          );
        })}
      </nav>
    </aside>
  );
}
