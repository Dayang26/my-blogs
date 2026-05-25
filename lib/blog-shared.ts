
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
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}.${month}.${day}`;
};

export const getTagLabel = (tag: string) => {
  if (tag === 'All') return '全部';
  return tagLabels[tag] ?? tag;
};
