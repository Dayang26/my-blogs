export type Lang = 'zh' | 'en';

export type PostMeta = (typeof import('../.velite').posts)[number];
export type PostI18n = (typeof import('../.velite').postI18n)[number];

export type PostI18nLite = Pick<PostI18n, 'title' | 'excerpt' | 'readMinutes' | 'code'>;

export type PostEntity = PostMeta & {
  i18n: Partial<Record<Lang, PostI18n>>;
};

export type PostListItem = Omit<PostEntity, 'i18n'> & {
  i18n: Partial<Record<Lang, PostI18nLite>>;
};

export type SeriesGroup = {
  name: string;
  posts: PostListItem[];
};

export type SearchIndexItem = {
  slug: string;
  lang: Lang;
  title: string;
  excerpt: string;
  tags: string[];
  date: string;
  readMinutes: number;
  series?: string | null;
  featured?: boolean;
  searchText: string;
};
