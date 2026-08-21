'use client';

import React, { useRef, useState, type HTMLAttributes } from 'react';

export function Pre({ children, className, ...props }: HTMLAttributes<HTMLPreElement>) {
  const preRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  // 从子节点或属性中提取代码语言
  let language = '';
  if (React.isValidElement(children)) {
    const childProps = children.props as { className?: string; 'data-language'?: string };
    const classStr = childProps.className || '';
    const match = classStr.match(/language-([a-zA-Z0-9_\-]+)/);
    if (match && match[1]) {
      language = match[1];
    } else if (childProps['data-language']) {
      language = childProps['data-language'];
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
    <div className="group relative my-6 overflow-hidden rounded-xl border border-[var(--code-border)] bg-[var(--code-bg)] shadow-[var(--card-shadow)] transition-all">
      {/* Code Header Bar */}
      <div className="flex h-9 items-center justify-between border-b border-[var(--code-border)]/60 bg-[var(--surface)] px-3.5">
        {/* Window controls / language */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 opacity-70">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-400/80" />
          </div>
          {language && (
            <span className="ml-2 font-mono text-[11px] font-medium tracking-wide text-[var(--text-muted)] uppercase">
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
