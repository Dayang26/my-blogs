
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://snowline.dev';

export const tagLabels: Record<string, string> = {
  AI: 'AI',
  Architecture: '系统架构',
  Calibration: '标定',
  Design: '设计',
  Motion: '动效',
  Performance: '性能优化',
  Physics: '物理',
  Product: '产品',
  Rambler: '碎碎念',
  Release: '发布',
  Rendering: '渲染',
  Simulation: '仿真',
  UI: '界面',
  Vision: '计算机视觉',
};

export const formatBlogDate = (value?: string) => {
  if (!value) return '';
  // 直接字符串截取，避免 new Date('YYYY-MM-DD') 按 UTC 解析导致的时区偏移
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return value;
  return `${match[1]}.${match[2]}.${match[3]}`;
};

export const getTagLabel = (tag: string) => {
  if (tag === 'All') return '全部';
  return tagLabels[tag] ?? tag;
};

