import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { supabase } from '../utils/supabaseClient';
import { logout } from '../store/slices/authSlice';

const Logout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const handleLogout = async () => {
      await supabase.auth.signOut();
      dispatch(logout());
      navigate('/login');
    };

    handleLogout();
  }, [navigate, dispatch]);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Logging out...</h1>
    </div>
  );
};

export default Logout;