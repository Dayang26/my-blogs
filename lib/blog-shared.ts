import type { Lang, PostEntity, PostListItem } from '@/types/blog';

export const getI18n = <T extends PostEntity | PostListItem>(post: T, lang: Lang) =>
  post.i18n[lang] ?? post.i18n.zh ?? post.i18n.en;

export const tagLabels: Record<string, { zh: string; en: string }> = {
  AI: { zh: 'AI', en: 'AI' },
  Architecture: { zh: '系统架构', en: 'Architecture' },
  Calibration: { zh: '标定', en: 'Calibration' },
  Design: { zh: '设计', en: 'Design' },
  Motion: { zh: '动效', en: 'Motion' },
  Performance: { zh: '性能优化', en: 'Performance' },
  Physics: { zh: '物理', en: 'Physics' },
  Product: { zh: '产品', en: 'Product' },
  Rambler: { zh: '碎碎念', en: 'Rambler' },
  Release: { zh: '发布', en: 'Release' },
  Rendering: { zh: '渲染', en: 'Rendering' },
  Simulation: { zh: '仿真', en: 'Simulation' },
  UI: { zh: '界面', en: 'UI' },
  Vision: { zh: '计算机视觉', en: 'Vision' },
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
