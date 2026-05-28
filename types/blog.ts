export interface PostListItem {
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
}

export interface CompositePost extends PostListItem {
  code: string;
}

export type PostEntity = CompositePost;

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
