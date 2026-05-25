import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BlogPostClient from '@/components/blog/BlogPostClient';
import { getAdjacentPosts, getBlogPosts, getPostBySlug, getRelatedPosts } from '@/lib/blog';

export const dynamicParams = false;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const generateStaticParams = () =>
  getBlogPosts().map((post) => ({
    slug: post.slug,
  }));

export const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) {
    return { title: 'Blog — SnowLine' };
  }
  return {
    title: `${post.title} — SnowLine`,
    description: post.excerpt,
  };
};

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post || !post.slug) {
    notFound();
  }

  const { prev, next } = getAdjacentPosts(post.slug);
  const related = getRelatedPosts(post.slug);

  return <BlogPostClient post={post} prev={prev} next={next} related={related} />;
}
