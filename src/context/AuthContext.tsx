import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, loginUser, registerUser } from '../api';
import { clearBookingIds } from '../bookingStore';
import type { LoginForm, RegisterForm, UserProfile } from '../types';

interface AuthContextType {
  token: string | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (data: LoginForm) => Promise<void>;
  register: (data: RegisterForm) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('token')
  );
  const [user, setUser] = useState<UserProfile | null>(null);
  const navigate = useNavigate();

  // Load (or refresh) the current user's profile whenever we hold a token.
  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }
    let cancelled = false;
    getCurrentUser()
      .then((profile) => {
        if (!cancelled) setUser(profile);
      })
      .catch(() => {
        // Token invalid/expired: clear it so the UI drops back to logged-out.
        if (!cancelled) {
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const login = async (data: LoginForm): Promise<void> => {
    const res = await loginUser(data);
    localStorage.setItem('token', res.token);
    setToken(res.token);
    navigate('/search');
  };

  const register = async (data: RegisterForm): Promise<void> => {
    // Register only creates the account; the caller redirects to login.
    await registerUser(data);
  };

  const logout = (): void => {
    localStorage.removeItem('token');
    clearBookingIds();
    setToken(null);
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: Boolean(token),
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
};
