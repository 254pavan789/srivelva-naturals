/**
 * brandConfig.js
 * ─────────────────────────────────────────────────────────────
 * Central config for brand identity.
 * To swap the logo, change ONLY the `logoSrc` value below.
 * The logo image is served from /public/ so it doesn't need
 * to be imported — just update the path string.
 * ─────────────────────────────────────────────────────────────
 */

const brand = {
  /** Path relative to /public — change this to swap the logo */
  logoSrc: '/assets/sri-velva-logo-v2.png',

  /** Alt text for the logo <img> */
  logoAlt: 'Sri Velva Naturals — Pure Natural Cold Pressed Oils',

  /** Short name shown in tab / footer when no image */
  name: 'Sri Velva Naturals',

  /** Marketing tagline */
  tagline: 'Pure · Natural · Cold Pressed',

  /** WhatsApp number pulled from env; this is just the display fallback */
  whatsapp: import.meta.env.VITE_WHATSAPP_NUMBER || '9944268288',
};

export default brand;
