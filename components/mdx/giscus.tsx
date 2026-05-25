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
  const scriptInitedRef = useRef(false);

  useEffect(() => {
    if (scriptInitedRef.current) {
      // 主题或语言变化时通过 giscus API 更新，避免重建 iframe
      if (window.giscus) {
        window.location.reload();
      }
      return;
    }

    scriptInitedRef.current = true;
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
      scriptInitedRef.current = false;
    };
  }, [repo, repoId, category, categoryId, mapping, term, theme, lang]);

  return <div ref={containerRef} className="giscus-container mt-8" />;
}
