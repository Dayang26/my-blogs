export interface CompositePost {
  slug: string;
  date: string;
  tags: string[];
  series: string | null;
  featured: boolean;
  type: string;
  status: string;
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
  title: string;
  excerpt: string;
  tags: string[];
  date: string;
  readMinutes: number;
  series?: string | null;
  featured?: boolean;
  searchText: string;
}
