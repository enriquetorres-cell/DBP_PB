import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import MyBookings from './pages/MyBookings';
import Register from './pages/Register';
import Search from './pages/Search';
import './App.css';

/**
 * Landing route: send visitors without a session to login, and already
 * authenticated users straight to the search screen.
 */
function Home() {
  const { isAuthenticated } = useAuth();
  return <Navigate to={isAuthenticated ? '/search' : '/login'} replace />;
}

function App() {
  return (
    <>
      <Navbar />
      <main className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/search" element={<Search />} />
          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute>
                <MyBookings />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
