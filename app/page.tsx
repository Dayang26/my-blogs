import type { Metadata } from 'next';
import { getBlogIndexData } from '@/lib/blog';

export const metadata: Metadata = {
  title: 'SnowLine — Aaron Hu 的个人博客',
  description: '关于前端开发、技术探索与个人成长的博客',
};
import { HomeClient } from './home-client';

export default function HomePage() {
  const { posts } = getBlogIndexData();
  const latestPosts = posts.slice(0, 6);

  return <HomeClient posts={latestPosts} />;
}
