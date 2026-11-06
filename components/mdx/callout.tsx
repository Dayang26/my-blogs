import React, { type ReactNode } from 'react';

export type CalloutType = 'note' | 'tip' | 'warning' | 'danger';

type CalloutProps = {
  type?: CalloutType;
  title?: string;
  children: ReactNode;
};

const CALLOUT_CONFIG: Record<
  CalloutType,
  {
    borderClass: string;
    bgClass: string;
    iconColor: string;
    defaultTitle: string;
    icon: ReactNode;
  }
> = {
  note: {
    borderClass: 'border-l-blue-500',
    bgClass: 'bg-blue-500/[0.04]',
    iconColor: 'text-blue-500',
    defaultTitle: '说明',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
  },
  tip: {
    borderClass: 'border-l-emerald-500',
    bgClass: 'bg-emerald-500/[0.04]',
    iconColor: 'text-emerald-500',
    defaultTitle: '技巧提示',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
      </svg>
    ),
  },
  warning: {
    borderClass: 'border-l-amber-500',
    bgClass: 'bg-amber-500/[0.04]',
    iconColor: 'text-amber-500',
    defaultTitle: '注意事项',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  danger: {
    borderClass: 'border-l-rose-500',
    bgClass: 'bg-rose-500/[0.04]',
    iconColor: 'text-rose-500',
    defaultTitle: '重要警告',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ),
  },
};

export function Callout({ type = 'note', title, children }: CalloutProps) {
  const config = CALLOUT_CONFIG[type] || CALLOUT_CONFIG.note;
  const headerTitle = title !== undefined ? title : config.defaultTitle;

  return (
    <aside
      className={`my-6 rounded-r-lg border border-[var(--border)] border-l-[3px] ${config.borderClass} ${config.bgClass} p-4 font-sans text-sm leading-relaxed transition-colors`}
      role="note"
    >
      {headerTitle ? (
        <div className="mb-2 flex items-center gap-2 font-heading font-medium tracking-wide text-[var(--text-primary)]">
          <span className={`flex-shrink-0 ${config.iconColor}`}>{config.icon}</span>
          <span>{headerTitle}</span>
        </div>
      ) : null}
      <div className="text-[var(--text-secondary)] [&>p]:my-1.5 [&>p:first-child]:mt-0 [&>p:last-child]:mb-0 [&_code]:rounded [&_code]:bg-[var(--surface-hover)] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs [&_code]:text-[var(--accent)]">
        {children}
      </div>
    </aside>
  );
}
