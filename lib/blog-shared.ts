import type { Lang } from '@/types/blog';

export const tagLabels: Record<string, { zh: string; en: string }> = {
  Performance: { zh: '性能', en: 'Performance' },
  Vision: { zh: '视觉', en: 'Vision' },
  Architecture: { zh: '架构', en: 'Architecture' },
  Design: { zh: '设计', en: 'Design' },
  Motion: { zh: '动效', en: 'Motion' },
  UI: { zh: '界面', en: 'UI' },
  Calibration: { zh: '校准', en: 'Calibration' },
  Physics: { zh: '物理', en: 'Physics' },
  Simulation: { zh: '模拟', en: 'Simulation' },
  Rendering: { zh: '渲染', en: 'Rendering' },
  Release: { zh: '版本', en: 'Release' },
  Product: { zh: '产品', en: 'Product' },
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
