import { useState } from 'react';
import './StarRating.css';

export default function StarRating({ value = 0, onChange, size = 24, readOnly = false }) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;

  return (
    <div className={`star-rating ${readOnly ? 'read-only' : 'interactive'}`} role="group" aria-label="Star rating">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          className={`star-btn ${n <= display ? 'lit' : ''}`}
          style={{ fontSize: size, width: size + 8, height: size + 8 }}
          onClick={() => !readOnly && onChange && onChange(n)}
          onMouseEnter={() => !readOnly && setHovered(n)}
          onMouseLeave={() => !readOnly && setHovered(0)}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
          tabIndex={readOnly ? -1 : 0}
        >
          ★
        </button>
      ))}
    </div>
  );
}
