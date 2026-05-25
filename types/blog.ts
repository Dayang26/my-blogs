export type Lang = 'zh' | 'en';

export const LANGS: Lang[] = ['zh', 'en'];

export interface CompositePost {
  slug: string;
  date: string;
  tags: string[];
  series: string | null;
  featured: boolean;
  type: string;
  status: string;
  i18n: {
    zh: PostI18nLite | null;
    en: PostI18nLite | null;
  };
}

export interface PostI18nLite {
  title: string;
  excerpt: string;
  readMinutes: number;
  code: string;
}

export type PostEntity = CompositePost;

export type PostListItem = CompositePost;

export type SeriesGroup = {
  name: string;
  posts: PostListItem[];
};

export interface SearchIndexItem {
  slug: string;
  lang: string;
  title: string;
  excerpt: string;
  tags: string[];
  date: string;
  readMinutes: number;
  series?: string | null;
  featured?: boolean;
  searchText: string;
}
