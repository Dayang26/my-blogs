'use client';

import { useState, useRef, useEffect, useCallback, useId } from 'react';

type SelectOption = {
  value: string;
  label: string;
};

type CustomSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  className?: string;
};

export function CustomSelect({ value, onChange, options, className = '' }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusIndex, setFocusIndex] = useState(-1);
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listId = useId();

  const selectedLabel = options.find((o) => o.value === value)?.label ?? value;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectOption = useCallback(
    (option: SelectOption) => {
      onChange(option.value);
      setIsOpen(false);
      buttonRef.current?.focus();
    },
    [onChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) {
        if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setIsOpen(true);
          setFocusIndex(options.findIndex((o) => o.value === value));
        }
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusIndex((prev) => (prev + 1) % options.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusIndex((prev) => (prev - 1 + options.length) % options.length);
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (focusIndex >= 0 && options[focusIndex]) {
            selectOption(options[focusIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          buttonRef.current?.focus();
          break;
        case 'Home':
          e.preventDefault();
          setFocusIndex(0);
          break;
        case 'End':
          e.preventDefault();
          setFocusIndex(options.length - 1);
          break;
      }
    },
    [isOpen, options, focusIndex, value, selectOption]
  );

  return (
    <div ref={ref} className={`relative ${className}`} onKeyDown={handleKeyDown}>
      <button
        ref={buttonRef}
        type="button"
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={isOpen ? listId : undefined}
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) setFocusIndex(options.findIndex((o) => o.value === value));
        }}
        className="glass-button flex min-w-[116px] items-center justify-between gap-2 rounded-full px-3.5 py-1.5 font-sans text-xs font-medium text-[var(--text-primary)] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
      >
        <span>{selectedLabel}</span>
        <svg
          className={`h-3.5 w-3.5 text-[var(--text-muted)] transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[var(--accent)]' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <ul
          id={listId}
          role="listbox"
          className="glass-overlay absolute right-0 z-50 mt-2 min-w-[144px] overflow-hidden rounded-2xl p-1.5 animate-fade-in"
        >
          {options.map((option, index) => {
            const isSelected = value === option.value;
            const isFocused = index === focusIndex;
            return (
              <li
                key={option.value}
                role="option"
                aria-selected={isSelected}
                className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left font-sans text-xs transition-colors cursor-pointer outline-none ${
                  isSelected
                    ? 'bg-[var(--accent-subtle)] font-semibold text-[var(--accent)]'
                    : isFocused
                      ? 'bg-[var(--surface-hover)] text-[var(--text-primary)]'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]'
                }`}
                onClick={() => selectOption(option)}
                onMouseEnter={() => setFocusIndex(index)}
              >
                <span>{option.label}</span>
                {isSelected && (
                  <svg className="h-3.5 w-3.5 text-[var(--accent)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
