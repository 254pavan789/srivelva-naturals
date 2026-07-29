import { useEffect } from 'react';

/**
 * useRipple
 * ─────────────────────────────────────────────────────────────
 * Attaches a single delegated click listener to <body>.
 * When any element with class "ripple-host" is clicked it
 * injects a <span class="ripple-dot"> at the exact cursor
 * position, plays the CSS expansion animation, then removes it.
 *
 * Call once in App.jsx — covers the entire page.
 * ─────────────────────────────────────────────────────────────
 */
export default function useRipple() {
  useEffect(() => {
    function handleClick(e) {
      // Walk up DOM to find the nearest ripple-host
      const host = e.target.closest('.ripple-host');
      if (!host) return;

      const rect   = host.getBoundingClientRect();
      const size   = Math.max(rect.width, rect.height) * 1.8;
      const x      = e.clientX - rect.left - size / 2;
      const y      = e.clientY - rect.top  - size / 2;

      const dot = document.createElement('span');
      dot.className = 'ripple-dot';
      dot.style.cssText = `
        width:  ${size}px;
        height: ${size}px;
        left:   ${x}px;
        top:    ${y}px;
      `;

      host.appendChild(dot);

      // Clean up after animation ends (0.55 s per CSS)
      dot.addEventListener('animationend', () => dot.remove(), { once: true });
    }

    document.body.addEventListener('click', handleClick);
    return () => document.body.removeEventListener('click', handleClick);
  }, []);
}
