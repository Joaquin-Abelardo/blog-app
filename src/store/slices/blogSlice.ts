import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { blogStatus, Blog } from '../../types';

const initialState: blogStatus = {
  blogs: [],
  currentBlog: null,
  loading: false,
  error: null,
  totalCount: 0,
  currentPage: 1,
};

const blogSlice = createSlice({
  name: 'blog',
  initialState,
  reducers: {
    setBlogs: (state, action: PayloadAction<Blog[]>) => {
      state.blogs = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setTotalBlogs: (state, action: PayloadAction<number>) => {
      state.totalCount = action.payload;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
  },
});

export const {
  setBlogs,
  setLoading,
  setError,
  setTotalBlogs,
  setCurrentPage,
} = blogSlice.actions;
export default blogSlice.reducer;