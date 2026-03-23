// Giscus configuration for comments
// To get repoId and categoryId, go to: https://giscus.app/apijson
// Note: Empty repoId/categoryId will cause comments to not load
export const giscusConfig = {
  repo: 'Dayang26/my-blogs',
  repoId: 'R_kgDOQ-qeBw',
  category: 'Announcements',
  categoryId: 'DIC_kwDOQ-qeB84C42Rc',
  mapping: 'pathname' as const,
  theme: 'dark_dimmed',
  lang: 'zh-CN',
};

export const commentsUiText = {
  zh: { comments: '评论' },
  en: { comments: 'Comments' },
};
