import type { Lang, PostEntity, PostListItem } from '@/types/blog';

export const getI18n = <T extends PostEntity | PostListItem>(post: T, lang: Lang) =>
  post.i18n[lang] ?? post.i18n.zh ?? post.i18n.en;

export const tagLabels: Record<string, { zh: string; en: string }> = {
  AI: { zh: 'AI', en: 'AI' },
  RAG: { zh: 'RAG', en: 'RAG' },
  Architecture: { zh: '系统架构', en: 'Architecture' },
  Philosophy: { zh: '哲学', en: 'Philosophy' },
  Money: { zh: '搞钱', en: 'Money' },
  Rambles: { zh: '碎碎念', en: 'Rambles' },
};

export const formatBlogDate = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}.${month}.${day}`;
};

export const getTagLabel = (tag: string, lang: Lang) => {
  if (tag === 'All') return lang === 'zh' ? '全部' : 'All';
  return tagLabels[tag]?.[lang] ?? tag;
};

export const getLanguageLabel = (lang: Lang) => (lang === 'zh' ? '中文' : 'English');
