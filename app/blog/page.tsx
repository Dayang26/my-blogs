import type { Metadata } from 'next';
import BlogIndexClient from '@/components/blog/BlogIndexClient';
import { getBlogIndexData } from '@/lib/blog';

export const metadata: Metadata = {
  title: '文章 — SnowLine',
  description: '浏览所有技术文章',
};

export default function BlogPage() {
  const { posts, tags } = getBlogIndexData();
  return <BlogIndexClient posts={posts} tags={tags} />;
}
