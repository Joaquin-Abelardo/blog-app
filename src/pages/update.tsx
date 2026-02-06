import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import '../css/update.css';

const Update = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [currentImage, setCurrentImage] = useState('');
  const [newImage, setNewImage] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) fetchBlog();
  }, [id]);

  const fetchBlog = async () => {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('id', id)
        .eq('user_id', user?.id) // Only fetch blogs the user owns
        .single();

      if (error) throw error;

      setTitle(data.title);
      setContent(data.content);
      setCurrentImage(data.image_url || '');
    } catch (err) {
      console.error(err);
      alert('Blog not found or you are not authorized');
      navigate('/blogs');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setNewImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const uploadImage = async (file: File) => {
    try {
      const ext = file.name.split('.').pop();
      const fileName = `${user?.id}-${Date.now()}.${ext}`;
      await supabase.storage.from('blog-images').upload(fileName, file);
      const { data } = supabase.storage.from('blog-images').getPublicUrl(fileName);
      return data.publicUrl;
    } catch (err) {
      console.error('Error uploading image:', err);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      if (!title.trim() || !content.trim()) {
        setError('Title and content are required');
        setSaving(false);
        return;
      }

      let imageUrl = currentImage;
      if (newImage) {
        const uploaded = await uploadImage(newImage);
        if (!uploaded) {
          setError('Failed to upload new image');
          setSaving(false);
          return;
        }
        imageUrl = uploaded;
      }

      const { error } = await supabase
        .from('blogs')
        .update({
          title: title.trim(),
          content: content.trim(),
          image_url: imageUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user?.id); // Must match owner for RLS

      if (error) throw error;

      alert('Blog updated successfully!');
      navigate(`/blogs/${id}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to update blog');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <h2>Loading blog...</h2>
      </div>
    );
  }

  return (
    <div className="update-container">
      <button className="update-back-btn" onClick={() => navigate(`/blogs/${id}`)} disabled={saving}>
        ← Cancel
      </button>

      <h1>Update Blog</h1>

      <form className="update-form" onSubmit={handleSubmit}>
        <label htmlFor="title">Title:</label>
        <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} required />

        <label htmlFor="content">Content:</label>
        <textarea id="content" rows={10} value={content} onChange={e => setContent(e.target.value)} required />

        <label>Current Image:</label>
        {currentImage ? <img src={currentImage} alt="Current blog" /> : <p className="note">No image uploaded</p>}

        <label htmlFor="newImage">Upload New Image (optional):</label>
        <input type="file" id="newImage" accept="image/*" onChange={handleImageChange} />
        {preview && (
          <div>
            <p className="note">New Image Preview:</p>
            <img src={preview} alt="Preview" />
          </div>
        )}

        {error && <div className="update-error">{error}</div>}

        <button className="update-save-btn" type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default Update;
