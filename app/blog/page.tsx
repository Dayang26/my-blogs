import BlogIndexClient from '@/components/blog/BlogIndexClient';
import { getBlogIndexData } from '@/lib/blog';

export default function BlogPage() {
  const { posts, tags } = getBlogIndexData();
  return <BlogIndexClient posts={posts} tags={tags} />;
}
