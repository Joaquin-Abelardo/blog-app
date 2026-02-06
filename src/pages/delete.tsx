import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { Blog } from '../types';
import '../css/delete.css';

const Delete = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);

  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (id) fetchBlog();
  }, [id]);

  const fetchBlog = async () => {
  const { data, error } = await supabase.from('blogs').select('*').eq('id', id).single();
  if (error || data.user_id !== user?.id) {
    alert('Blog not found or cannot delete others\' blogs');
    return navigate('/blogs');
  }
  setBlog(data);
  setLoading(false);
};


  const handleDelete = async () => {
    setDeleting(true);
    try {
      // Delete comments first
      await supabase.from('comments').delete().eq('blog_id', id).eq('user_id', user?.id);

      // Delete blog
      const { error } = await supabase
        .from('blogs')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id); // Must match owner for RLS

      if (error) throw error;

      alert('Blog deleted successfully!');
      navigate('/blogs');
    } catch (error) {
      console.error(error);
      alert('Failed to delete blog');
      setDeleting(false);
    }
  };

  const handleCancel = () => navigate(`/blogs/${id}`);

  if (loading) {
    return (
      <div className="loading-container">
        <h2>Loading...</h2>
      </div>
    );
  }

  if (!blog) return null;

  return (
    <div className="delete-container">
      <div className="delete-box">
        <h1>Delete Blog</h1>
        <p>Are you sure you want to delete this blog?</p>
        <p className="bold">"{blog.title}"</p>
        <p className="note">This action cannot be undone. All comments will also be deleted.</p>

        <div className="delete-buttons">
          <button className="cancel-btn" onClick={handleCancel} disabled={deleting}>
            Cancel
          </button>
          <button className="delete-btn" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete Blog'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Delete;
