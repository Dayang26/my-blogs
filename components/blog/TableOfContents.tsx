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

      // 监听视口中的标题
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
    <aside className="sticky top-28 hidden max-h-[calc(100vh-8rem)] w-60 overflow-y-auto xl:block">
      <div className="flex items-center gap-2 pb-3 font-mono text-xs font-semibold tracking-wider text-[var(--text-primary)] uppercase">
        <svg
          className="h-4 w-4 text-[var(--accent)]"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 6h16M4 12h10M4 18h14"
          />
        </svg>
        <span>目录</span>
      </div>

      <nav className="flex flex-col border-l border-[var(--border)] pl-3 text-xs">
        {headings.map((h) => {
          const isActive = activeId === h.id;
          return (
            <a
              key={h.id}
              href={`#${h.id}`}
              onClick={(e) => handleClick(e, h.id)}
              className={`py-1.5 transition-colors line-clamp-1 ${
                h.level === 3 ? 'pl-3' : ''
              } ${
                isActive
                  ? 'font-medium text-[var(--accent)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
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
