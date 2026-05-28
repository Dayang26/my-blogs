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

  const selectOption = useCallback((option: SelectOption) => {
    onChange(option.value);
    setIsOpen(false);
    buttonRef.current?.focus();
  }, [onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
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
  }, [isOpen, options, focusIndex, value, selectOption]);

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
        className="flex min-w-[100px] items-center justify-between gap-2 border-b border-[var(--border)] px-1 py-1.5 font-sans text-sm font-medium text-[var(--text-primary)] transition-colors hover:text-[var(--accent)] outline-none"
      >
        <span>{selectedLabel}</span>
        <svg
          className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
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
          className="absolute z-50 mt-2 w-full overflow-hidden rounded bg-[var(--surface)] border border-[var(--border)] shadow-md"
        >
          {options.map((option, index) => {
            const isSelected = value === option.value;
            const isFocused = index === focusIndex;
            return (
              <li
                key={option.value}
                role="option"
                aria-selected={isSelected}
                className={`w-full px-3 py-2 text-left font-sans text-sm transition-colors cursor-pointer outline-none ${
                  isSelected ? 'text-[var(--accent)] font-medium' : 'text-[var(--text-secondary)]'
                } ${isFocused ? 'bg-[var(--bg)]' : 'hover:bg-[var(--bg)]'}`}
                onClick={() => selectOption(option)}
                onMouseEnter={() => setFocusIndex(index)}
              >
                {option.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
