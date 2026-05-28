import { cache } from 'react';
import type { CompositePost, PostListItem } from '@/types/blog';

import postsData from './__generated_posts';

const publishedPosts = postsData.filter((post) => post.status === 'published');

const sortedPosts = [...publishedPosts].sort(
  (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
);

function stripCode(post: CompositePost): PostListItem {
  const { code: _code, ...rest } = post;
  void _code;
  return rest;
}

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


export const getAdjacentPosts = (slug: string, posts = sortedPosts) => {
  const index = posts.findIndex((post) => post.slug === slug);
  if (index === -1) return { prev: null, next: null };
  const prev = posts[index - 1];
  const next = posts[index + 1];
  return {
    prev: prev ? stripCode(prev) : null,
    next: next ? stripCode(next) : null,
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

  return scored
    .slice(0, limit)
    .filter(({ score }) => score > 0)
    .map(({ post }) => stripCode(post));
};

export const getBlogIndexData = cache(() => {
  const posts: PostListItem[] = sortedPosts.map(stripCode);
  return {
    posts,
    tags: ['All', ...getTags(sortedPosts)],
  };
});
