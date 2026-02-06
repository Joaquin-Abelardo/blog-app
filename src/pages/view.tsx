import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { Blog, Comment } from '../types';
import '../css/view.css';

const View = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);

  const [blog, setBlog] = useState<Blog | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [commentImage, setCommentImage] = useState<File | null>(null);
  const [commentPreview, setCommentPreview] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    if (id) {
      fetchBlog();
      fetchComments();
    }
  }, [id]);

  const fetchBlog = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('blogs').select('*').eq('id', id).single();
      if (error) throw error;
      setBlog(data);
    } catch {
      alert('Failed to load blog');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('blog_id', id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setComments(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCommentImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCommentImage(file);
    setCommentPreview(URL.createObjectURL(file));
  };

  const uploadCommentImage = async (file: File) => {
    try {
      const ext = file.name.split('.').pop();
      const fileName = `${user?.id}-${Date.now()}.${ext}`;
      await supabase.storage.from('comment-images').upload(fileName, file);
      const { data } = supabase.storage.from('comment-images').getPublicUrl(fileName);
      return data.publicUrl;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmittingComment(true);

    try {
      let imageUrl = null;
      if (commentImage) {
        imageUrl = await uploadCommentImage(commentImage);
      }

      const { error } = await supabase.from('comments').insert({
        blog_id: id,
        user_id: user?.id,
        content: commentText.trim(),
        image_url: imageUrl,
        created_at: new Date().toISOString(),
      });

      if (error) throw error;

      setCommentText('');
      setCommentImage(null);
      setCommentPreview('');
      fetchComments();
      alert('Comment added successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <h2>Loading blog...</h2>
      </div>
    );
  }

  if (!blog) return null;

  

  return (
    <div className="view-container">
      <div className="view-top-buttons">
        <button className="view-btn back" onClick={() => navigate('/blogs')}>← Back to Blogs</button>
          <>
            <button className="view-btn edit" onClick={() => navigate(`/blogs/${id}/edit`)}>Edit</button>
            <button className="view-btn delete" onClick={() => navigate(`/blogs/${id}/delete`)}>Delete</button>
          </>
      </div>

      <article className="view-article">
        <h1>{blog.title}</h1>
        <p className="date">Published on {new Date(blog.created_at).toLocaleDateString()}</p>
        {blog.image_url && <img src={blog.image_url} alt={blog.title} />}
        <div className="content">{blog.content}</div>
      </article>

      <hr />

      <div className="view-comments">
        <h2>Comments ({comments.length})</h2>

        <form className="comment-form" onSubmit={handleCommentSubmit}>
          <textarea
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            placeholder="Write a comment..."
            rows={4}
            required
          />
          <input type="file" accept="image/*" onChange={handleCommentImageChange} />
          {commentPreview && <img src={commentPreview} alt="Comment preview" />}
          <button type="submit" disabled={submittingComment}>
            {submittingComment ? 'Posting...' : 'Post Comment'}
          </button>
        </form>

        {comments.length === 0 && <p className="note">No comments yet. Be the first to comment!</p>}

        {comments.map(comment => (
          <div key={comment.id} className="comment">
            <p>{comment.content}</p>
            {comment.image_url && <img src={comment.image_url} alt="Comment attachment" />}
            <p className="date">{new Date(comment.created_at).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default View;
