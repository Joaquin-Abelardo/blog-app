import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { supabase } from '../utils/supabaseClient';
import { RootState } from '../store/store';
import '../css/create.css';

const Create = () => {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  setImage(file);
  setImagePreview(URL.createObjectURL(file));
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!title || !content) {
        setError('Title and content are required');
        setLoading(false);
        return;
      }

      let imageUrl = null;
      if (image) {
        const fileName = `${user?.id}-${Date.now()}`;
        const { error: uploadError } = await supabase.storage.from('blog-images').upload(fileName, image);
        if (uploadError) throw uploadError;

        imageUrl = supabase.storage.from('blog-images').getPublicUrl(fileName).data.publicUrl;
      }

      const { error: insertError } = await supabase.from('blogs').insert({
        title,
        content,
        image_url: imageUrl,
        user_id: user?.id,
      });

      if (insertError) throw insertError;

      alert('Blog created successfully!');
      navigate('/blogs');
    } catch (err: any) {
      setError(err.message || 'Failed to create blog');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-container">
      <button className="back-button" onClick={() => navigate('/blogs')}>
        ← Back to Blogs
      </button>

      <h1>Create New Blog</h1>

      <form onSubmit={handleSubmit}>
        <label htmlFor="title">Title:</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter blog title"
          required
        />

        <label htmlFor="content">Content:</label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your blog content here..."
          required
          rows={10}
        />

        <label htmlFor="image">Image (optional):</label>
        <input type="file" id="image" accept="image/*" onChange={handleImageChange} />
        {imagePreview && (
          <div className="image-preview">
            <p>Image Preview:</p>
            <img src={imagePreview} alt="Preview" />
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Blog'}
        </button>
      </form>
    </div>
  );
};

export default Create;
