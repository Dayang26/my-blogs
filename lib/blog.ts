import { cache } from 'react';
import type { PostListItem, SeriesGroup } from '@/types/blog';

import postsData from './__generated_posts';

const publishedPosts = postsData.filter((post) => post.status === 'published');

const sortedPosts = [...publishedPosts].sort(
  (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
);

export const getBlogPosts = () => sortedPosts;

export const getPostBySlug = (slug: string) => sortedPosts.find((post) => post.slug === slug);

export const getTags = (posts = sortedPosts) => {
  const counts = new Map<string, number>();
  posts.forEach((post) => {
    post.tags.forEach((tag: string) => {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    });
  });
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([tag]) => tag);
};

const getSeriesGroups = (posts = sortedPosts): SeriesGroup[] => {
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

export const getAdjacentPosts = (slug: string, posts = sortedPosts) => {
  const index = posts.findIndex((post) => post.slug === slug);
  if (index === -1) return { prev: null, next: null };
  return {
    prev: posts[index - 1] ?? null,
    next: posts[index + 1] ?? null,
  };
};

export const getRelatedPosts = (slug: string, posts = sortedPosts, limit = 3) => {
  const current = posts.find((post) => post.slug === slug);
  if (!current) return [];

  const scored = posts
    .filter((post) => post.slug !== slug)
    .map((post) => {
      const sharedTags = post.tags.filter((tag: string) => current.tags.includes(tag)).length;
      const seriesBoost = current.series && post.series === current.series ? 2 : 0;
      return { post, score: sharedTags + seriesBoost };
    })
    .sort((a, b) => b.score - a.score || new Date(b.post.date).getTime() - new Date(a.post.date).getTime());

  return scored.slice(0, limit).map(({ post }) => post);
};

export const getBlogIndexData = cache(() => {
  const posts = sortedPosts;
  return {
    posts,
    tags: ['All', ...getTags(posts)],
  };
});

export { formatBlogDate } from './blog-shared';
