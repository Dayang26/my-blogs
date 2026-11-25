'use client';

import React, { useEffect, useState } from 'react';

export function BackToTop() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
        const currentScroll = window.scrollY;

        setVisible(currentScroll > 300);

        if (totalScroll > 0) {
          const progress = (currentScroll / totalScroll) * 100;
          setScrollProgress(Math.min(100, Math.max(0, progress)));
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!visible) return null;

  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      className="glass-pill fixed bottom-7 right-6 sm:right-8 z-40 flex h-11 w-11 items-center justify-center rounded-full text-[var(--text-primary)] transition-all duration-300 hover:scale-110 hover:text-[var(--accent)] active:scale-95 animate-fade-in focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
      aria-label="返回顶部"
      title={`已阅读 ${Math.round(scrollProgress)}% - 点击返回顶部`}
    >
      <svg className="absolute inset-0 -rotate-90" width="44" height="44" aria-hidden="true">
        <circle
          cx="22"
          cy="22"
          r={radius}
          fill="none"
          stroke="var(--text-muted)"
          strokeWidth="2"
          opacity="0.28"
        />
        <circle
          cx="22"
          cy="22"
          r={radius}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2.5"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-150"
        />
      </svg>
      <svg
        className="relative z-10 h-4 w-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.5"
          d="M5 10l7-7m0 0l7 7m-7-7v18"
        />
      </svg>
    </button>
  );
}
