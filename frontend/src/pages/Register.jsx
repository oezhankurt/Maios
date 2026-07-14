import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function Register() {
  const navigate = useNavigate();
  const { register, loading, error } = useAuthStore();
  const [form, setForm] = useState({ username: '', email: '', password: '', currency: 'EUR' });

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const ok = await register(form);
    if (ok) navigate('/');
  };

  return (
    <div className="auth-wrap">
      <div className="card auth-card">
        <h1>Create account</h1>
        <p className="auth-sub">Start tracking profit across your marketplaces</p>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={submit}>
          <div className="field">
            <label>Username</label>
            <input className="input" value={form.username} onChange={set('username')} required />
          </div>
          <div className="field">
            <label>Email</label>
            <input className="input" type="email" value={form.email} onChange={set('email')} required />
          </div>
          <div className="field">
            <label>Password (min 8 chars)</label>
            <input
              className="input"
              type="password"
              value={form.password}
              onChange={set('password')}
              minLength={8}
              required
            />
          </div>
          <div className="field">
            <label>Currency</label>
            <select className="select" value={form.currency} onChange={set('currency')}>
              <option value="EUR">EUR (€)</option>
              <option value="USD">USD ($)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
          <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Creating…' : 'Create Account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
