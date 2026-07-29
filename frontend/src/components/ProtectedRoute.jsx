import { Navigate } from 'react-router-dom';

/**
 * ProtectedRoute — guards /admin routes.
 *
 * Checks two things:
 *   1. Token exists in localStorage
 *   2. Token is not expired (reads expiry from the payload without a server call)
 *
 * Token format (set by TokenService.generate()):
 *   base64("admin:{issuedAt}:{expiresAt}") + "." + hmacHex
 *
 * If expired → clears localStorage and redirects to /admin/login.
 * If valid   → renders children.
 *
 * The server still validates the HMAC signature on every API call — this
 * client-side check only prevents the admin UI from rendering with a stale token.
 */
function isTokenValid(token) {
  if (!token) return false;
  try {
    const [encoded] = token.split('.');
    // atob decodes the base64 payload
    const payload   = atob(encoded);          // "admin:{issuedAt}:{expiresAt}"
    const parts     = payload.split(':');
    if (parts.length !== 3 || parts[0] !== 'admin') return false;
    const expiresAt = parseInt(parts[2], 10);
    return Date.now() < expiresAt;
  } catch {
    return false;
  }
}

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem('admin_token');

  if (!isTokenValid(token)) {
    // Clear stale token before redirecting
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
