import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../api';
import type { RegisterForm } from '../types';

const empty: RegisterForm = {
  email: '',
  firstName: '',
  lastName: '',
  password: '',
};

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<RegisterForm>(empty);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const update =
    (field: keyof RegisterForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
    };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side check for empty fields before hitting the backend.
    if (!form.email || !form.firstName || !form.lastName || !form.password) {
      setError('Por favor completa todos los campos.');
      return;
    }

    setLoading(true);
    try {
      await register(form);
      setSuccess(true);
      // Show the success message briefly, then send the user to login.
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Ocurrió un error inesperado.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="card auth-card">
        <div className="alert alert-success">
          ¡Cuenta creada con éxito! Redirigiendo al login…
        </div>
      </div>
    );
  }

  return (
    <div className="card auth-card">
      <h1>Crear cuenta</h1>
      <p className="subtitle">Regístrate para reservar tus vuelos</p>

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
          Nombre
          <input
            type="text"
            value={form.firstName}
            onChange={update('firstName')}
            placeholder="Alice"
          />
        </label>
        <label>
          Apellido
          <input
            type="text"
            value={form.lastName}
            onChange={update('lastName')}
            placeholder="Smith"
          />
        </label>
        <label>
          Contraseña
          <input
            type="password"
            value={form.password}
            onChange={update('password')}
            placeholder="Mínimo 8 caracteres, 1 mayúscula y 1 número"
          />
        </label>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Creando…' : 'Registrarse'}
        </button>
      </form>

      <p className="muted">
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
      </p>
    </div>
  );
}
