import BlogIndexClient from '@/components/blog/BlogIndexClient';
import { getBlogIndexData, getPostStats } from '@/lib/blog';

export default function BlogPage() {
  const data = getBlogIndexData();
  const stats = getPostStats();

  return <BlogIndexClient {...data} stats={stats} />;
}
