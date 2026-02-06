import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { supabase } from './utils/supabaseClient';
import { setUser } from './store/slices/authSlice';
import { RootState } from './store/store';

// Import pages
import Registration from './pages/registration';
import Login from './pages/login';
import Logout from './pages/logout';
import ListBlogs from './pages/listBlogs';
import Create from './pages/create';
import View from './pages/view';
import Update from './pages/update';
import Delete from './pages/delete';

function App() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        dispatch(setUser({
          id: session.user.id,
          email: session.user.email || '',
        }));
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        dispatch(setUser({
          id: session.user.id,
          email: session.user.email || '',
        }));
      } else {
        dispatch(setUser(null));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [dispatch]);

  return (
    <Router>
      <div className="App">
        <Routes>
          
          <Route path="/register" element={!isAuthenticated ? <Registration /> : <Navigate to="/login" />} />
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/blogs" />} />
          <Route path="/logout" element={isAuthenticated ? <Logout /> : <Navigate to="/login" />} />
          <Route path="/blogs" element={isAuthenticated ? <ListBlogs /> : <Navigate to="/login" />} />
          <Route path="/blogs/create" element={isAuthenticated ? <Create /> : <Navigate to="/login" />} />
          <Route path="/blogs/:id" element={isAuthenticated ? <View /> : <Navigate to="/login" />} />
          <Route path="/blogs/:id/edit" element={isAuthenticated ? <Update /> : <Navigate to="/login" />} />
          <Route path="/blogs/:id/delete" element={isAuthenticated ? <Delete /> : <Navigate to="/login" />} />
          <Route path="/" element={<Navigate to={isAuthenticated ? "/blogs" : "/login"} />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;