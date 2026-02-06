import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { Blog } from '../types';
import '../css/listBlogs.css';

const ListBlogs = () => {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);

  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalBlogs, setTotalBlogs] = useState(0);

  const blogsPerPage = 6;
  const totalPages = Math.ceil(totalBlogs / blogsPerPage);

  useEffect(() => {
    fetchBlogs();
  }, [currentPage]);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const start = (currentPage - 1) * blogsPerPage;
      const end = start + blogsPerPage - 1;

      // Total count for pagination
      const { count, error: countError } = await supabase
        .from('blogs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id);

      // Get blogs for this page
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .range(start, end);

      if (error || countError) throw error || countError;

      setBlogs(data || []);
      setTotalBlogs(count || 0);
    } catch {
      alert('Failed to load blogs');
    } finally {
      setLoading(false);
    }
  };

  const blogTitle = (text: string, max: number) =>
    text.length <= max ? text : text.substring(0, max) + '...';

  if (loading) return <div className="listblogs-container"><h2>Loading blogs...</h2></div>;

  return (
    <div className="listblogs-container">
      <div className="listblogs-header">
        <h1>All Blogs</h1>
        <div>
          <button className="btn create" onClick={() => navigate('/blogs/create')}>Create New Blog</button>
          <button className="btn logout" onClick={() => navigate('/logout')}>Logout</button>
        </div>
      </div>

      {blogs.length === 0 ? (
        <div className="no-blogs"><p>No blogs found. Create your first blog!</p></div>
      ) : (
        <>
          <div className="blogs-grid">
            {blogs.map(blog => (
              <div key={blog.id} className="blog-card" onClick={() => navigate(`/blogs/${blog.id}`)}>
                {blog.image_url && <img src={blog.image_url} alt={blog.title} />}
                <h3>{blogTitle(blog.title, 50)}</h3>
                <p>{blogTitle(blog.content, 100)}</p>
                <p className="date">{new Date(blog.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>

          <div className="pagination">
            <button className="prev" onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>Previous</button>
            <span>Page {currentPage} of {totalPages}</span>
            <button className="next" onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>Next</button>
          </div>
        </>
      )}
    </div>
  );
};

export default ListBlogs;
