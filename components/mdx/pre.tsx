'use client';

import { useRef, useState, type HTMLAttributes } from 'react';

export function Pre({ children, className, ...props }: HTMLAttributes<HTMLPreElement>) {
  const preRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!preRef.current) return;
    const code = preRef.current.innerText || '';
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // 降级处理
    }
  };

  return (
    <div className="group relative my-6">
      <button
        type="button"
        onClick={handleCopy}
        className="absolute right-3 top-3 z-10 hidden font-mono text-[11px] uppercase tracking-wider text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)] group-hover:block"
        aria-label="复制代码"
      >
        {copied ? '已复制' : '复制'}
      </button>
      <pre
        ref={preRef}
        className={`overflow-x-auto rounded-none border border-[var(--border)] bg-[var(--code-bg)] p-4 font-mono text-sm leading-relaxed ${className || ''}`}
        {...props}
      >
        {children}
      </pre>
    </div>
  );
}
