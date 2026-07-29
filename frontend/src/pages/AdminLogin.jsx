import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLock, FiUser, FiEye, FiEyeOff } from 'react-icons/fi';
import { loginAdmin } from '../utils/api';
import brand from '../utils/brandConfig';
import './AdminLogin.css';

/*
 * AdminLogin — standalone page at /admin/login.
 * Logo uses brandConfig (same as Navbar) — NO hardcoded /logo.png
 * NO golden ring / border / background-box on the logo
 */
export default function AdminLogin() {
  const navigate = useNavigate();
  const [form,    setForm]    = useState({ username: '', password: '' });
  const [showPw,  setShowPw]  = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleChange = e =>
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      setError('Please enter username and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res   = await loginAdmin(form);
      const token = res?.data?.data?.token ?? res?.data?.token;
      if (!token) throw new Error('No token in response');
      localStorage.setItem('admin_token', token);
      navigate('/admin', { replace: true });
    } catch (err) {
      const msg = err?.response?.data?.message || 'Invalid username or password.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        {/* ── Brand — logo from brandConfig, NO ring/border/box ── */}
        <div className="login-brand">
          <img
            src={brand.logoSrc}
            alt={brand.logoAlt}
            className="login-logo"
            draggable={false}
          />
          <h1>Admin Panel</h1>
          <p>Sign in to manage your store</p>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="login-error" role="alert">
            {error}
          </div>
        )}

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} noValidate>

          <div className="login-field">
            <label htmlFor="username">Username</label>
            <div className="login-input-wrap">
              <FiUser className="login-icon" size={16} />
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                placeholder="admin"
                value={form.username}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>

          <div className="login-field">
            <label htmlFor="password">Password</label>
            <div className="login-input-wrap">
              <FiLock className="login-icon" size={16} />
              <input
                id="password"
                name="password"
                type={showPw ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                disabled={loading}
              />
              <button
                type="button"
                className="pw-toggle"
                onClick={() => setShowPw(s => !s)}
                tabIndex={-1}
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw ? <FiEyeOff size={15}/> : <FiEye size={15}/>}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>

        </form>

        <a href="/" className="login-back">← Back to website</a>

      </div>
    </div>
  );
}
