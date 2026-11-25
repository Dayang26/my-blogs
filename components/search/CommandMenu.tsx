'use client';

import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { type SearchIndexItem } from '@/types/blog';
import { formatBlogDate, getTagLabel } from '@/lib/blog-shared';

export function CommandMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<SearchIndexItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const pressedOutsideRef = useRef(false);
  const hasFetchedRef = useRef(false);

  // 首次打开时懒加载搜索索引
  useEffect(() => {
    if (!isOpen || hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    fetch('/searchIndex.json')
      .then((res) => (res.ok ? res.json() : []))
      .then((data: SearchIndexItem[]) => {
        setItems(data);
      })
      .catch((err) => console.warn('CommandMenu search index error:', err));
  }, [isOpen]);

  const openMenu = useCallback(() => {
    setQuery('');
    setSelectedIndex(0);
    setIsOpen(true);
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) {
      dialog.showModal();
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, []);

  const closeMenu = useCallback(() => {
    const dialog = dialogRef.current;
    if (dialog && dialog.open) {
      dialog.close();
    }
    setIsOpen(false);
    setQuery('');
    setSelectedIndex(0);
  }, []);

  // 监听全局快捷键 Cmd+K / Ctrl+K 和自定义 open-command-menu 事件
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (dialogRef.current?.open) {
          closeMenu();
        } else {
          openMenu();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('open-command-menu', openMenu);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-command-menu', openMenu);
    };
  }, [openMenu, closeMenu]);

  // 过滤搜索结果
  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return items.slice(0, 8);
    }
    return items.filter((item) => item.searchText.includes(q)).slice(0, 8);
  }, [items, query]);

  const currentActiveIndex = Math.min(selectedIndex, Math.max(0, filteredItems.length - 1));

  const handleSelect = (slug: string) => {
    closeMenu();
    router.push(`/blog/${slug}`);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[currentActiveIndex]) {
        handleSelect(filteredItems[currentActiveIndex].slug);
      }
    }
  };

  // 键盘选中项滚动进可视区域
  useEffect(() => {
    if (!isOpen) return;
    listRef.current
      ?.querySelector(`[data-option-index="${currentActiveIndex}"]`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [isOpen, currentActiveIndex]);

  // 轻触面板外遮罩关闭（同时避免框内拖选文字拖到外部松开时误关）
  const isOutsidePanel = (e: React.PointerEvent<HTMLDialogElement>, panel: HTMLDivElement) => {
    const r = panel.getBoundingClientRect();
    return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
  };

  const handleDialogPointerDown = (e: React.PointerEvent<HTMLDialogElement>) => {
    const panel = panelRef.current;
    if (!panel) return;
    pressedOutsideRef.current = isOutsidePanel(e, panel);
  };

  const handleDialogPointerUp = (e: React.PointerEvent<HTMLDialogElement>) => {
    const panel = panelRef.current;
    if (!panel) return;
    if (pressedOutsideRef.current && isOutsidePanel(e, panel)) {
      closeMenu();
    }
    pressedOutsideRef.current = false;
  };

  return (
    <dialog
      ref={dialogRef}
      aria-label="全站搜索"
      onClose={() => {
        setIsOpen(false);
        setQuery('');
        setSelectedIndex(0);
      }}
      onPointerDown={handleDialogPointerDown}
      onPointerUp={handleDialogPointerUp}
      {...({ closedby: 'any' } as Record<string, string>)}
      className="glass-dialog"
    >
      <div
        ref={panelRef}
        className="glass-dialog-panel glass-overlay mx-auto w-full max-w-[640px] rounded-3xl overflow-hidden"
      >
        {/* Spotlight Search Input Bar */}
      <div className="flex items-center gap-3 border-b border-[var(--border)] px-5 py-4">
        <svg
          className="h-5 w-5 text-[var(--accent)] flex-shrink-0"
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
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedIndex(0);
          }}
          onKeyDown={handleInputKeyDown}
          placeholder="搜索全站文章、技术主题或关键词..."
          aria-label="搜索全站文章"
          autoFocus
          className="w-full bg-transparent font-sans text-base text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none"
        />
        <button
          type="button"
          onClick={closeMenu}
          className="hidden sm:inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--surface)] px-2 py-0.5 font-mono text-[10px] text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
          title="关闭搜索"
        >
          ESC
        </button>
      </div>

      {/* Results List */}
      <div
        ref={listRef}
        role="listbox"
        aria-activedescendant={filteredItems.length > 0 ? `search-option-${currentActiveIndex}` : undefined}
        className="max-h-[380px] overflow-y-auto p-2.5"
      >
        {filteredItems.length > 0 ? (
          <div className="flex flex-col gap-1">
            <div className="px-3 py-1.5 font-mono text-[11px] font-medium tracking-wider text-[var(--text-muted)] uppercase">
              {query ? '匹配文章' : '近期推荐'}
            </div>
            {filteredItems.map((item, idx) => {
              const isSelected = idx === currentActiveIndex;
              return (
                <button
                  key={item.slug}
                  id={`search-option-${idx}`}
                  data-option-index={idx}
                  role="option"
                  aria-selected={isSelected}
                  type="button"
                  onClick={() => handleSelect(item.slug)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex flex-col gap-1 rounded-2xl px-3.5 py-3 text-left transition-all duration-150 ${
                    isSelected
                      ? 'bg-[var(--accent-subtle)] shadow-[inset_0_1px_0_var(--glass-specular-top)] ring-1 ring-[var(--accent)]/30'
                      : 'hover:bg-[var(--surface-hover)]/60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`font-heading text-sm font-semibold line-clamp-1 ${
                        isSelected ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]'
                      }`}
                    >
                      {item.title}
                    </span>
                    <span className="font-mono text-[11px] text-[var(--text-muted)] flex-shrink-0">
                      {item.readMinutes} 分钟
                    </span>
                  </div>
                  <p className="line-clamp-1 font-sans text-xs text-[var(--text-secondary)]">
                    {item.excerpt}
                  </p>
                  <div className="flex items-center gap-2 font-mono text-[10px] text-[var(--text-muted)]">
                    <span>{formatBlogDate(item.date)}</span>
                    <span>·</span>
                    <span className="text-[var(--accent)]">
                      {item.tags.map(getTagLabel).join(' · ')}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="font-sans text-sm text-[var(--text-muted)]">
              没有找到与 &quot;{query}&quot; 相关的文章
            </p>
          </div>
        )}
      </div>

      {/* Footer shortcuts */}
      <div className="flex items-center justify-between border-t border-[var(--border)] bg-[var(--surface)]/50 px-5 py-2.5 font-mono text-[11px] text-[var(--text-muted)]">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <kbd className="rounded-md border border-[var(--border)] bg-[var(--surface-solid)]/60 px-1.5 py-0.5 text-[10px]">↑</kbd>
            <kbd className="rounded-md border border-[var(--border)] bg-[var(--surface-solid)]/60 px-1.5 py-0.5 text-[10px]">↓</kbd>
            <span className="ml-0.5">导航</span>
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded-md border border-[var(--border)] bg-[var(--surface-solid)]/60 px-1.5 py-0.5 text-[10px]">↵</kbd>
            <span className="ml-0.5">打开</span>
          </span>
        </div>
        <span>
          <kbd className="rounded-md border border-[var(--border)] bg-[var(--surface-solid)]/60 px-1.5 py-0.5 text-[10px]">ESC</kbd> 退出
        </span>
      </div>
      </div>
    </dialog>
  );
}
