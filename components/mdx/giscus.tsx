'use client';

import { useEffect, useRef } from 'react';

type GiscusProps = {
  repo: string;
  repoId: string;
  category: string;
  categoryId: string;
  mapping?: 'pathname' | 'url' | 'title' | 'og:title' | 'specific' | 'number';
  term?: string;
  theme?: string;
  lang?: string;
};

declare global {
  interface Window {
    giscus: {
      reload: () => void;
    };
  }
}

export function Giscus({
  repo,
  repoId,
  category,
  categoryId,
  mapping = 'pathname',
  term,
  theme = 'preferred_color_scheme',
  lang = 'zh-CN',
}: GiscusProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const existingScript = document.querySelector('script[src="https://giscus.app/client.js"]');
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.setAttribute('data-repo', repo);
    script.setAttribute('data-repo-id', repoId);
    script.setAttribute('data-category', category);
    script.setAttribute('data-category-id', categoryId);
    script.setAttribute('data-mapping', mapping);
    if (term) script.setAttribute('data-term', term);
    script.setAttribute('data-theme', theme);
    script.setAttribute('data-lang', lang);
    script.setAttribute('crossorigin', 'anonymous');
    script.async = true;

    containerRef.current?.appendChild(script);

    return () => {
      script.remove();
    };
  }, [repo, repoId, category, categoryId, mapping, term, theme, lang]);

  return <div ref={containerRef} className="giscus-container mt-8" />;
}
