'use client';

import { useCallback, useSyncExternalStore } from 'react';
import type { Lang } from '@/types/blog';

const STORAGE_KEY = 'blog-lang';
const listeners = new Set<() => void>();
let cachedLang: Lang | null = null;

const parseLang = (value: string | null): Lang | null => {
  if (value === 'zh' || value === 'en') return value;
  return null;
};

const getStoredLang = () => {
  if (typeof window === 'undefined') return null;
  return parseLang(window.localStorage.getItem(STORAGE_KEY));
};

const getSnapshot = (fallback: Lang) => () => {
  if (cachedLang === null) {
    cachedLang = getStoredLang() ?? fallback;
  }
  return cachedLang;
};

const subscribe = (callback: () => void) => {
  listeners.add(callback);
  if (typeof window === 'undefined') {
    return () => {
      listeners.delete(callback);
    };
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    cachedLang = parseLang(event.newValue) ?? cachedLang;
    callback();
  };

  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(callback);
    window.removeEventListener('storage', onStorage);
  };
};

const setStoredLang = (next: Lang) => {
  cachedLang = next;
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, next);
  }
  listeners.forEach((listener) => listener());
};

export const useBlogLanguage = (defaultLang: Lang = 'zh') => {
  const lang = useSyncExternalStore(subscribe, getSnapshot(defaultLang), () => defaultLang);
  const setLang = useCallback((next: Lang) => setStoredLang(next), []);

  return { lang, setLang };
};
