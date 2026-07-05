import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../api';
import type { LoginForm } from '../types';

export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState<LoginForm>({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const update =
    (field: keyof LoginForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
    };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.email || !form.password) {
      setError('Ingresa tu email y contraseña.');
      return;
    }

    setLoading(true);
    try {
      await login(form); // redirects to /search on success
    } catch (err) {
      setError(
        err instanceof ApiError
          ? 'Credenciales incorrectas.'
          : 'Ocurrió un error inesperado.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card auth-card">
      <h1>Iniciar sesión</h1>
      <p className="subtitle">Bienvenido de vuelta ✈️</p>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit} noValidate>
        <label>
          Email
          <input
            type="email"
            value={form.email}
            onChange={update('email')}
            placeholder="alice@example.com"
          />
        </label>
        <label>
          Contraseña
          <input
            type="password"
            value={form.password}
            onChange={update('password')}
            placeholder="••••••••"
          />
        </label>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Ingresando…' : 'Entrar'}
        </button>
      </form>

      <p className="muted">
        ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
      </p>
    </div>
  );
}
