'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { type SearchIndexItem } from '@/types/blog';
import { formatBlogDate, getTagLabel } from '@/lib/blog-shared';

export function CommandMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<SearchIndexItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // 加载搜索索引
  useEffect(() => {
    fetch('/searchIndex.json')
      .then((res) => (res.ok ? res.json() : []))
      .then((data: SearchIndexItem[]) => {
        setItems(data);
      })
      .catch((err) => console.warn('CommandMenu search index error:', err));
  }, []);

  const openMenu = () => {
    setIsOpen(true);
    setQuery('');
    setSelectedIndex(0);
  };

  const closeMenu = () => {
    setIsOpen(false);
    setQuery('');
    setSelectedIndex(0);
  };

  // 监听键盘快捷键 Cmd+K / Ctrl+K 和自定义 open-command-menu 事件
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => {
          if (!prev) {
            setQuery('');
            setSelectedIndex(0);
            return true;
          }
          return false;
        });
      } else if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        closeMenu();
      }
    };

    const handleCustomOpen = () => {
      openMenu();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('open-command-menu', handleCustomOpen);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-command-menu', handleCustomOpen);
    };
  }, [isOpen]);

  // 控制滚动条锁定与输入聚焦
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = '';
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  // 过滤搜索结果
  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return items.slice(0, 8);
    }
    return items
      .filter((item) => item.searchText.includes(q))
      .slice(0, 8);
  }, [items, query]);

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
      const safeIndex = Math.min(selectedIndex, Math.max(0, filteredItems.length - 1));
      if (filteredItems[safeIndex]) {
        handleSelect(filteredItems[safeIndex].slug);
      }
    }
  };

  if (!isOpen) return null;

  const currentActiveIndex = Math.min(selectedIndex, Math.max(0, filteredItems.length - 1));

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 px-4 bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={closeMenu}
    >
      <div
        className="w-full max-w-[620px] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center border-b border-[var(--border)] px-4 py-3">
          <svg
            className="h-5 w-5 text-[var(--text-muted)] mr-3 flex-shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
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
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleInputKeyDown}
            placeholder="搜索全站文章、主题或关键词..."
            className="w-full bg-transparent font-sans text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none"
          />
          <kbd className="hidden sm:inline-block rounded border border-[var(--border)] bg-[var(--bg)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--text-muted)]">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div ref={listRef} className="max-h-[380px] overflow-y-auto p-2">
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
                    type="button"
                    onClick={() => handleSelect(item.slug)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex flex-col gap-1 rounded-lg px-3 py-2.5 text-left transition-all ${
                      isSelected
                        ? 'bg-[var(--surface-hover)] border-l-2 border-[var(--accent)]'
                        : 'hover:bg-[var(--surface-hover)]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-heading text-sm font-semibold text-[var(--text-primary)] line-clamp-1">
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
                        {item.tags.map(getTagLabel).join(', ')}
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
        <div className="flex items-center justify-between border-t border-[var(--border)] bg-[var(--bg)] px-4 py-2 font-mono text-[11px] text-[var(--text-muted)]">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="rounded border border-[var(--border)] bg-[var(--surface)] px-1 py-0.5 text-[10px]">↑</kbd>{' '}
              <kbd className="rounded border border-[var(--border)] bg-[var(--surface)] px-1 py-0.5 text-[10px]">↓</kbd> 导航
            </span>
            <span>
              <kbd className="rounded border border-[var(--border)] bg-[var(--surface)] px-1 py-0.5 text-[10px]">↵</kbd> 打开
            </span>
          </div>
          <span>
            <kbd className="rounded border border-[var(--border)] bg-[var(--surface)] px-1 py-0.5 text-[10px]">ESC</kbd> 退出
          </span>
        </div>
      </div>
    </div>
  );
}
