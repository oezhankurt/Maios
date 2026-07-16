import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useToast } from '../hooks/useToast';

export default function Login() {
  const navigate = useNavigate();
  const { login, loading, error } = useAuthStore();
  const { error: showError, success: showSuccess } = useToast();
  const [email, setEmail] = useState('demo@maios.app');
  const [password, setPassword] = useState('demo1234');

  useEffect(() => {
    if (error) showError(error);
  }, [error, showError]);

  const submit = async (e) => {
    e.preventDefault();
    const ok = await login(email, password);
    if (ok) {
      showSuccess('Erfolgreich angemeldet');
      navigate('/');
    }
  };

  return (
    <div className="auth-wrap">
      <div className="card auth-card">
        <h1>
          Ma<span style={{ color: 'var(--primary)' }}>ios</span>
        </h1>
        <p className="auth-sub">Sign in to your seller dashboard</p>

        <form onSubmit={submit}>
          <div className="field">
            <label>Email</label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '15px', textAlign: 'center' }}>
          <p style={{ fontSize: '0.9rem', marginBottom: '10px' }}>
            <Link to="/forgot-password" style={{ color: 'var(--primary)', textDecoration: 'none' }}>
              Passwort vergessen?
            </Link>
          </p>
        </div>

        <p className="auth-switch">
          No account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
}
