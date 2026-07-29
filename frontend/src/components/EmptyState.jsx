import { Link } from 'react-router-dom';
import './EmptyState.css';

export default function EmptyState({
  title    = 'Nothing here yet',
  message  = 'Try a different category or check back soon.',
  ctaLabel = 'View All Products',
  ctaTo    = '/products',
}) {
  return (
    <div className="empty-state-wrap" role="status" aria-live="polite">
      {/* ── SVG Illustration — botanical motif ── */}
      <div className="es-illustration" aria-hidden="true">
        <svg
          width="180"
          height="180"
          viewBox="0 0 180 180"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer circle */}
          <circle cx="90" cy="90" r="88" stroke="#C8DEB5" strokeWidth="2" strokeDasharray="6 5" />

          {/* Bowl / plate */}
          <ellipse cx="90" cy="118" rx="46" ry="10" fill="#E6D9C2" />
          <path
            d="M46 112 Q90 140 134 112"
            stroke="#B8860B" strokeWidth="2.5" fill="none"
            strokeLinecap="round"
          />

          {/* Oil drop */}
          <path
            d="M90 52 C90 52 70 74 70 88 a20 20 0 0 0 40 0 C110 74 90 52 90 52 Z"
            fill="#E2B84A" opacity="0.85"
          />
          <path
            d="M90 62 C90 62 78 76 78 86 a12 12 0 0 0 24 0 C102 76 90 62 90 62 Z"
            fill="#FAF7F0" opacity="0.55"
          />

          {/* Left leaf */}
          <path
            d="M62 80 Q42 60 50 42 Q68 50 62 80Z"
            fill="#7BA05B" opacity="0.75"
          />
          <line x1="62" y1="80" x2="52" y2="50" stroke="#2D5016" strokeWidth="1.2"
                strokeLinecap="round" opacity="0.6" />

          {/* Right leaf */}
          <path
            d="M118 80 Q138 60 130 42 Q112 50 118 80Z"
            fill="#7BA05B" opacity="0.75"
          />
          <line x1="118" y1="80" x2="128" y2="50" stroke="#2D5016" strokeWidth="1.2"
                strokeLinecap="round" opacity="0.6" />

          {/* Small sparkles */}
          <circle cx="56"  cy="110" r="3" fill="#B8860B" opacity="0.4" />
          <circle cx="124" cy="105" r="2.5" fill="#B8860B" opacity="0.4" />
          <circle cx="90"  cy="145" r="2" fill="#7BA05B" opacity="0.5" />
        </svg>
      </div>

      <h3 className="es-title">{title}</h3>
      <p  className="es-message">{message}</p>

      {ctaTo && (
        <Link to={ctaTo} className="btn btn-primary es-cta">
          {ctaLabel}
        </Link>
      )}
    </div>
  );
}
