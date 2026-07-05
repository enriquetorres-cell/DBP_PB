import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <nav className="navbar">
      <NavLink to="/search" className="brand">
        ✈️ Fly Away
      </NavLink>

      <div className="nav-links">
        <NavLink to="/search">Búsqueda</NavLink>
        {isAuthenticated && <NavLink to="/my-bookings">Mis Reservas</NavLink>}

        {isAuthenticated ? (
          <>
            {user && (
              <span className="nav-user">Hola, {user.username}</span>
            )}
            <button type="button" className="btn-logout" onClick={logout}>
              Cerrar sesión
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login">Login</NavLink>
            <NavLink to="/register">Registro</NavLink>
          </>
        )}
      </div>
    </nav>
  );
}
