export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  category_id: number;
  category_name: string;
  category_slug: string;
  thumbnail: string;
  created_at: string;
  tags?: string[];
}

export interface RecentPost {
  title: string;
  slug: string;
  created_at: string;
}
