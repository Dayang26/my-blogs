// Giscus configuration for comments
// To get repoId and categoryId, go to: https://giscus.app/apijson
// Note: Empty repoId/categoryId will cause comments to not load
// Use NEXT_PUBLIC_GISCUS_* env vars to override (baked at build time for static export)
export const giscusConfig = {
  repo: process.env.NEXT_PUBLIC_GISCUS_REPO || 'Dayang26/my-blogs',
  repoId: process.env.NEXT_PUBLIC_GISCUS_REPO_ID || 'R_kgDOQ-qeBw',
  category: process.env.NEXT_PUBLIC_GISCUS_CATEGORY || 'Announcements',
  categoryId: process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID || 'DIC_kwDOQ-qeB84C42Rc',
  mapping: 'pathname' as const,
  theme: 'dark_dimmed',
  lang: 'zh-CN',
};

export const commentsUiText = {
  zh: { comments: '评论' },
  en: { comments: 'Comments' },
};
