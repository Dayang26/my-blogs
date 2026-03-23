import { cache } from 'react';
import { posts as metaPosts, postI18n } from '../.velite';
import type { Lang, PostEntity, PostI18n, PostI18nLite, PostListItem, SeriesGroup } from '@/types/blog';

const buildI18nMap = () => {
  const map = new Map<string, Partial<Record<Lang, PostI18n>>>();
  for (const entry of postI18n) {
    const lang = entry.lang.replace('.mdx', '') as Lang;
    if (lang !== 'zh' && lang !== 'en') continue;
    const slug = entry.slug;
    if (!slug) continue;
    const existing = map.get(slug) ?? {};
    map.set(slug, { ...existing, [lang]: entry });
  }
  return map;
};

const getReadMinutes = (entry?: PostI18n) => {
  if (!entry) return 0;
  if (typeof entry.readMinutes === 'number') return entry.readMinutes;
  const readingTime = entry.metadata?.readingTime ?? 1;
  return Math.max(1, Math.round(readingTime));
};

const toI18nLite = (entry?: PostI18n): PostI18nLite | undefined => {
  if (!entry) return undefined;
  return {
    title: entry.title,
    excerpt: entry.excerpt,
    readMinutes: getReadMinutes(entry),
    code: entry.code,
  };
};

const i18nBySlug = buildI18nMap();

const mergedPosts: PostEntity[] = metaPosts
  .filter((post) => post.slug)
  .map((post) => ({
    ...post,
    i18n: i18nBySlug.get(post.slug!) ?? {},
  }));

const publishedPosts = mergedPosts.filter((post) => post.status === 'published');

const sortedPosts = [...publishedPosts].sort(
  (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
);

const listPosts: PostListItem[] = sortedPosts.map((post) => ({
  ...post,
  i18n: {
    zh: toI18nLite(post.i18n.zh),
    en: toI18nLite(post.i18n.en),
  },
}));

export const blogPosts = sortedPosts;
export const blogListPosts = listPosts;

export const getBlogPosts = () => blogPosts;
export const getBlogListPosts = () => blogListPosts;

export const getPostBySlug = (slug: string) => blogPosts.find((post) => post.slug === slug);

export const getFeaturedPosts = (posts = blogListPosts, limit = 3) =>
  posts.filter((post) => post.featured).slice(0, limit);

export const getLatestUpdateDate = (posts = blogListPosts) => posts[0]?.date ?? null;

export const getTags = (posts = blogListPosts) => {
  const counts = new Map<string, number>();
  posts.forEach((post) => {
    post.tags.forEach((tag) => {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    });
  });
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([tag]) => tag);
};

export const getSeriesGroups = (posts = blogListPosts): SeriesGroup[] => {
  const map = new Map<string, PostListItem[]>();
  posts.forEach((post) => {
    if (!post.series) return;
    const existing = map.get(post.series) ?? [];
    existing.push(post);
    map.set(post.series, existing);
  });

  return [...map.entries()]
    .map(([name, items]) => ({
      name,
      posts: [...items].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      ),
    }))
    .sort(
      (a, b) =>
        new Date(b.posts[0]?.date ?? 0).getTime() - new Date(a.posts[0]?.date ?? 0).getTime(),
    );
};

export const getChangelogPosts = (posts = blogListPosts, limit = 4) =>
  posts.filter((post) => post.type === 'Changelog').slice(0, limit);

export const getLabNotes = (posts = blogListPosts, limit = 4) =>
  posts.filter((post) => post.type === 'LabNote').slice(0, limit);

export const getAdjacentPosts = (slug: string, posts = blogListPosts) => {
  const index = posts.findIndex((post) => post.slug === slug);
  if (index === -1) return { prev: null, next: null };
  return {
    prev: posts[index - 1] ?? null,
    next: posts[index + 1] ?? null,
  };
};

export const getRelatedPosts = (slug: string, posts = blogListPosts, limit = 3) => {
  const current = posts.find((post) => post.slug === slug);
  if (!current) return [];

  const scored = posts
    .filter((post) => post.slug !== slug)
    .map((post) => {
      const sharedTags = post.tags.filter((tag) => current.tags.includes(tag)).length;
      const seriesBoost = current.series && post.series === current.series ? 2 : 0;
      return { post, score: sharedTags + seriesBoost };
    })
    .sort((a, b) => b.score - a.score || new Date(b.post.date).getTime() - new Date(a.post.date).getTime());

  return scored.slice(0, limit).map(({ post }) => post);
};

export const getLanguageFallback = (post: PostListItem | PostEntity, lang: Lang) => {
  const preferred = post.i18n[lang];
  if (preferred) return preferred;
  return post.i18n.zh ?? post.i18n.en;
};

export const getLanguagePair = (post: PostEntity, lang: Lang) => {
  const preferred = post.i18n[lang];
  if (preferred) return preferred;
  return post.i18n.zh ?? post.i18n.en;
};

export const getBlogIndexData = cache(() => {
  const posts = blogListPosts;
  return {
    posts,
    featured: getFeaturedPosts(posts),
    series: getSeriesGroups(posts),
    changelog: getChangelogPosts(posts),
    labNotes: getLabNotes(posts),
    tags: ['All', ...getTags(posts)],
    latestDate: getLatestUpdateDate(posts),
  };
});

export const getPostStats = cache(() => ({
  total: blogListPosts.length,
  tags: getTags().length,
  series: getSeriesGroups().length,
}));

export { formatBlogDate, getLanguageLabel, tagLabels } from './blog-shared';
