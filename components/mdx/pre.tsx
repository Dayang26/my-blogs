'use client';

import React, { useRef, useState, type HTMLAttributes } from 'react';

type PreProps = HTMLAttributes<HTMLPreElement> & {
  title?: string;
  filename?: string;
  'data-title'?: string;
  'data-filename'?: string;
  'data-meta'?: string;
};

export function Pre({ children, className, title, filename, ...props }: PreProps) {
  const preRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  let language = '';
  let extractedTitle = title || filename || props['data-title'] || props['data-filename'] || '';

  if (React.isValidElement(children)) {
    const childProps = children.props as {
      className?: string;
      'data-language'?: string;
      'data-title'?: string;
      'data-meta'?: string;
      title?: string;
    };

    const classStr = childProps.className || '';
    const match = classStr.match(/language-([a-zA-Z0-9_\-]+)/);
    if (match && match[1]) {
      language = match[1];
    } else if (childProps['data-language']) {
      language = childProps['data-language'];
    }

    if (!extractedTitle) {
      if (childProps['data-title']) {
        extractedTitle = childProps['data-title'];
      } else if (childProps.title) {
        extractedTitle = childProps.title;
      } else if (childProps['data-meta']) {
        const metaTitleMatch = childProps['data-meta'].match(/(?:title|filename)=["']?([^"'\s]+)["']?/);
        if (metaTitleMatch && metaTitleMatch[1]) {
          extractedTitle = metaTitleMatch[1];
        }
      }
    }
  }

  const handleCopy = async () => {
    if (!preRef.current) return;
    const code = preRef.current.innerText || '';
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="group relative my-6 overflow-hidden rounded-2xl glass-card">
      {/* Code Header Bar */}
      <div className="flex h-10 items-center justify-between border-b border-[var(--border)] bg-[var(--surface)]/75 px-4">
        {/* Left: File / Language badge */}
        <div className="flex items-center gap-2.5 overflow-hidden">
          {extractedTitle ? (
            <div className="flex items-center gap-1.5 font-mono text-xs font-medium text-[var(--text-primary)] truncate">
              <svg
                className="h-3.5 w-3.5 text-[var(--accent)] flex-shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <span className="truncate">{extractedTitle}</span>
            </div>
          ) : null}

          {language && (
            <span className="rounded-full border border-[var(--border)] bg-[var(--surface-solid)]/60 px-2.5 py-0.5 font-mono text-[10px] font-semibold tracking-wider text-[var(--text-muted)] uppercase">
              {language}
            </span>
          )}
        </div>

        {/* Copy Button */}
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-full border border-transparent px-2.5 py-1 font-mono text-[11px] text-[var(--text-muted)] transition-all duration-200 hover:border-[var(--border)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] active:scale-95"
          aria-label="复制代码"
          title="复制代码"
        >
          {copied ? (
            <>
              <svg
                className="h-3.5 w-3.5 text-emerald-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-sans text-emerald-500 font-medium">已复制</span>
            </>
          ) : (
            <>
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <span className="font-sans">复制</span>
            </>
          )}
        </button>
      </div>

      {/* Code Body */}
      <pre
        ref={preRef}
        className={`overflow-x-auto bg-[var(--code-bg)] p-4 font-mono text-[0.84375rem] leading-relaxed text-[var(--text-primary)] ${className || ''}`}
        {...props}
      >
        {children}
      </pre>
    </div>
  );
}
