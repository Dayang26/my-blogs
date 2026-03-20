import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BlogPostClient from '@/components/blog/BlogPostClient';
import { getAdjacentPosts, getBlogPosts, getPostBySlug, getRelatedPosts } from '@/lib/blog';

export const dynamicParams = false;

type PageProps = {
  params: { slug: string };
};

export const generateStaticParams = () =>
  getBlogPosts().map((post) => ({
    slug: post.slug,
  }));

export const generateMetadata = ({ params }: PageProps): Metadata => {
  const post = getPostBySlug(params.slug);
  const content = post?.i18n.zh ?? post?.i18n.en;
  if (!content) {
    return { title: 'Blog' };
  }
  return {
    title: content.title,
    description: content.excerpt,
  };
};

export default function BlogPostPage({ params }: PageProps) {
  const post = getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const { prev, next } = getAdjacentPosts(post.slug);
  const related = getRelatedPosts(post.slug);

  return <BlogPostClient post={post} prev={prev} next={next} related={related} />;
}
