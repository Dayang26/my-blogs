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

  // 1. 提取语言与元数据
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

  // 2. 复制代码处理
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
    <div className="group relative my-6 overflow-hidden rounded-xl border border-[var(--code-border)] bg-[var(--code-bg)] shadow-[var(--card-shadow)] transition-all">
      {/* Code Header Bar */}
      <div className="flex h-9 items-center justify-between border-b border-[var(--code-border)]/60 bg-[var(--surface)] px-3.5">
        {/* Left: Window controls & File / Language badge */}
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex items-center gap-1.5 opacity-70 flex-shrink-0">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-400/80" />
          </div>

          {extractedTitle ? (
            <div className="flex items-center gap-1.5 font-mono text-[11.5px] font-medium text-[var(--text-primary)] truncate">
              <svg className="h-3.5 w-3.5 text-[var(--text-muted)] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <span className="truncate">{extractedTitle}</span>
            </div>
          ) : null}

          {language && (
            <span
              className={`font-mono text-[10.5px] font-medium tracking-wide uppercase ${
                extractedTitle
                  ? 'rounded bg-[var(--surface-hover)] px-1.5 py-0.5 text-[var(--text-muted)] border border-[var(--border)]'
                  : 'ml-1 text-[var(--text-muted)]'
              }`}
            >
              {language}
            </span>
          )}
        </div>

        {/* Copy Button */}
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 font-mono text-[11px] text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
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
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="text-emerald-500 font-sans">已复制</span>
            </>
          ) : (
            <>
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <span>复制</span>
            </>
          )}
        </button>
      </div>

      {/* Code Body */}
      <pre
        ref={preRef}
        className={`overflow-x-auto p-4 font-mono text-[13.5px] leading-relaxed text-[var(--text-primary)] ${className || ''}`}
        {...props}
      >
        {children}
      </pre>
    </div>
  );
}
