import { defineCollection, defineConfig, s } from 'velite';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const posts = defineCollection({
  name: 'Post',
  pattern: 'posts/**/meta.json',
  schema: s
    .object({
      date: s.isodate(),
      tags: s.array(s.string()).default([]),
      series: s.string().optional(),
      featured: s.boolean().default(false),
      type: s.string().default('DeepDive'),
      status: s.enum(['published', 'draft']).default('published'),
    })
    .transform((data, { meta }) => {
      const parts = meta.path.split('/');
      const slug = parts[parts.length - 2];
      return { ...data, slug };
    }),
});

const postI18n = defineCollection({
  name: 'PostI18n',
  pattern: 'posts/**/{zh,en}.mdx',
  schema: s
    .object({
      title: s.string(),
      excerpt: s.string(),
      plain: s.raw(),
      code: s.mdx(),
      metadata: s.metadata(),
    })
    .transform((data, { meta }) => {
      const parts = meta.path.split('/');
      const lang = parts[parts.length - 1] as 'zh' | 'en';
      const slug = parts[parts.length - 2];
      const readMinutes = Math.max(1, Math.round(data.metadata.readingTime || 1));
      return { ...data, slug, lang, readMinutes };
    }),
});

export default defineConfig({
  root: 'content',
  collections: { posts, postI18n },
  prepare: async (data, context) => {
    const i18nBySlug = new Map<string, { zh?: (typeof data.postI18n)[number]; en?: (typeof data.postI18n)[number] }>();

    for (const item of data.postI18n) {
      const entry = i18nBySlug.get(item.slug) ?? {};
      if (item.lang === 'zh') entry.zh = item;
      if (item.lang === 'en') entry.en = item;
      i18nBySlug.set(item.slug, entry);
    }

    const searchIndex = data.posts
      .filter((post) => post.status === 'published')
      .flatMap((post) => {
        const i18n = i18nBySlug.get(post.slug);
        if (!i18n) return [];
        const entries = [i18n.zh, i18n.en].filter(Boolean) as (typeof data.postI18n)[number][];
        return entries.map((entry) => ({
          slug: post.slug,
          lang: entry.lang,
          title: entry.title,
          excerpt: entry.excerpt,
          tags: post.tags,
          date: post.date,
          readMinutes: entry.readMinutes,
          series: post.series ?? null,
          featured: post.featured,
          searchText: [entry.title, entry.excerpt, ...(post.tags ?? [])].join(' ').toLowerCase(),
        }));
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const outputDir = path.resolve(context?.config.output.data ?? '.velite');
    const publicDir = path.resolve('public');

    await mkdir(outputDir, { recursive: true });
    await mkdir(publicDir, { recursive: true });

    const payload = JSON.stringify(searchIndex, null, 2);
    await writeFile(path.join(outputDir, 'searchIndex.json'), payload, 'utf8');
    await writeFile(path.join(publicDir, 'searchIndex.json'), payload, 'utf8');
  },
});
