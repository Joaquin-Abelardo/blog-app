// User type from Supabase Auth
export interface User {
  id: string;
  email: string;
  created_at?: string;
}

// Blog type
export interface Blog {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

// Comment type
export interface Comment {
  id: string;
  blog_id: string;
  user_id: string;
  content: string;
  image_url?: string;
  created_at: string;
}

// Authentication status for Redux
export interface authStatus {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

// Blog status for Redux
export interface blogStatus {
  blogs: Blog[];
  currentBlog: Blog | null;
  loading: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
}