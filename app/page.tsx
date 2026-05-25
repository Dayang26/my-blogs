import { getBlogIndexData, getPostStats } from '@/lib/blog';
import { HomeClient } from './home-client';

export default function HomePage() {
  const { posts } = getBlogIndexData();
  const stats = getPostStats();
  const latestPosts = posts.slice(0, 6);

  return <HomeClient posts={latestPosts} stats={stats} />;
}
