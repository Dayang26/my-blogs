import { defineCollection, defineConfig, s } from 'velite';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { readdirSync, existsSync } from 'node:fs';
import path from 'node:path';

const posts = defineCollection({
  name: 'Post',
  pattern: 'posts/**/meta.json',
  schema: s.object({
    date: s.isodate(),
    tags: s.array(s.string()).default([]),
    series: s.string().optional(),
    featured: s.boolean().default(false),
    type: s.string().default('DeepDive'),
    status: s.enum(['published', 'draft']).default('published'),
  }).transform((data, { meta }) => {
    const parts = meta.path.split('/');
    return { ...data, slug: parts[parts.length - 2] };
  }),
});

const postI18n = defineCollection({
  name: 'PostI18n',
  pattern: 'posts/**/{zh,en}.mdx',
  schema: s.object({
    title: s.string(),
    excerpt: s.string(),
    plain: s.raw(),
    code: s.mdx(),
    metadata: s.metadata(),
  }).transform((data, { meta }) => {
    const parts = meta.path.split('/');
    const lang = parts[parts.length - 1]!.replace('.mdx', '') as 'zh' | 'en';
    return { ...data, slug: parts[parts.length - 2], lang, readMinutes: Math.max(1, Math.round(data.metadata.readingTime || 1)) };
  }),
});

type I18nItem = {
  title: string;
  excerpt: string;
  readMinutes: number;
  slug: string;
  lang: string;
};

export default defineConfig({
  root: 'content',
  collections: { posts, postI18n },
  prepare: async (data, context) => {
    const contentDir = path.resolve('content/posts');

    const allDirs = readdirSync(contentDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);

    const i18nBySlug = new Map<string, { zh?: I18nItem; en?: I18nItem }>();

    for (const item of data.postI18n) {
      // 这里的 item 已经经过 transform，可以直接访问 slug 和 lang
      const lang = item.lang;
      const slug = item.slug;

      if (!lang || !slug) {
        // console.log(`Skipping i18n item due to missing lang or slug: ${item.meta.path}`);
        continue;
      }
      // console.log(`Processing i18n: slug=${slug}, lang=${lang}, item.code=${item.code ? 'defined' : 'undefined'}`);

      const entry: I18nItem = {
        title: item.title,
        excerpt: item.excerpt,
        readMinutes: item.readMinutes,
        slug,
        lang,
      };

      const existing = i18nBySlug.get(slug) ?? {};
      if (lang === 'zh') existing.zh = entry;
      if (lang === 'en') existing.en = entry;
      i18nBySlug.set(slug, existing);
    }
    // console.log(`i18nBySlug size: ${i18nBySlug.size}`);

    const published: Array<{
      slug: string;
      date: string;
      tags: string[];
      series: string | null;
      featured: boolean;
      type: string;
      status: string;
      zh: I18nItem | null;
      en: I18nItem | null;
    }> = [];

    for (const dirName of allDirs) {
      // console.log(`Processing directory: ${dirName}`);
      const metaPath = path.join(contentDir, dirName, 'meta.json');
      if (!existsSync(metaPath)) {
        // console.log(`  Skipping ${dirName}: meta.json not found`);
        continue;
      }

      const metaRaw = await readFile(metaPath, 'utf8');
      const meta = JSON.parse(metaRaw) as {
        date: string;
        tags?: string[];
        series?: string;
        featured?: boolean;
        type?: string;
        status?: string;
      };

      if (meta.status === 'draft') {
        // console.log(`  Skipping ${dirName}: status is draft`);
        continue;
      }

      const i18n = i18nBySlug.get(dirName);
      // console.log(`  i18n for ${dirName}: ${JSON.stringify(i18n)}`);
      if (!i18n || (!i18n.zh && !i18n.en)) {
        // console.log(`  Skipping ${dirName}: no valid i18n content (zh or en)`);
        continue;
      }

      published.push({
        slug: dirName,
        date: meta.date,
        tags: meta.tags ?? [],
        series: meta.series ?? null,
        featured: meta.featured ?? false,
        type: meta.type ?? 'DeepDive',
        status: meta.status ?? 'published',
        zh: i18n.zh ?? null,
        en: i18n.en ?? null,
      });
      // console.log(`  Added ${dirName} to published. Current published size: ${published.length}`);
    }

    published.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const searchIndex = published.flatMap((post) => {
      const entries: Array<{
        slug: string;
        lang: string;
        title: string;
        excerpt: string;
        tags: string[];
        date: string;
        readMinutes: number;
        series: string | null;
        featured: boolean;
        searchText: string;
      }> = [];

      if (post.zh) {
        entries.push({
          slug: post.slug,
          lang: 'zh',
          title: post.zh.title,
          excerpt: post.zh.excerpt,
          tags: post.tags,
          date: post.date,
          readMinutes: post.zh.readMinutes,
          series: post.series,
          featured: post.featured,
          searchText: [post.zh.title, post.zh.excerpt, ...post.tags].join(' ').toLowerCase(),
        });
      }
      if (post.en) {
        entries.push({
          slug: post.slug,
          lang: 'en',
          title: post.en.title,
          excerpt: post.en.excerpt,
          tags: post.tags,
          date: post.date,
          readMinutes: post.en.readMinutes,
          series: post.series,
          featured: post.featured,
          searchText: [post.en.title, post.en.excerpt, ...post.tags].join(' ').toLowerCase(),
        });
      }
      return entries;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const compositePosts = published.map((post) => ({
      slug: post.slug,
      date: post.date,
      tags: post.tags,
      series: post.series,
      featured: post.featured,
      type: post.type,
      status: post.status,
      i18n: {
        zh: post.zh ? { title: post.zh.title, excerpt: post.zh.excerpt, readMinutes: post.zh.readMinutes } : null,
        en: post.en ? { title: post.en.title, excerpt: post.en.excerpt, readMinutes: post.en.readMinutes } : null,
      },
    }));

    const outputDir = path.resolve(process.cwd(), '.velite');
    const publicDir = path.resolve('public');
    const libDir = path.resolve('lib');

    await mkdir(outputDir, { recursive: true });
    await mkdir(publicDir, { recursive: true });

    await writeFile(path.join(outputDir, 'searchIndex.json'), JSON.stringify(searchIndex, null, 2), 'utf8');
    await writeFile(path.join(publicDir, 'searchIndex.json'), JSON.stringify(searchIndex, null, 2), 'utf8');
    await writeFile(path.join(outputDir, 'compositePosts.json'), JSON.stringify(compositePosts, null, 2), 'utf8');
    await writeFile(path.join(libDir, '__generated_posts.ts'), `// Auto-generated by velite, do not edit
import type { CompositePost } from '@/types/blog';

const posts: CompositePost[] = ${JSON.stringify(compositePosts, null, 2)} as CompositePost[];

export default posts;
`, 'utf8');
  },
});
