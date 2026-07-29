/**
 * waLink — builds the correct WhatsApp deep link for customer-side use.
 *
 * FORMAT: https://wa.me/{E164phone}?text={encodedMessage}
 *
 * WHY wa.me (not api.whatsapp.com/send):
 *   wa.me is WhatsApp's official universal deep link standard.
 *   On mobile → opens the WhatsApp app directly to the chat.
 *   On desktop → opens WhatsApp Web directly to the chat.
 *   No intermediate "Open app / Continue to Web" landing page.
 *
 * HOW IT WORKS FOR THE CUSTOMER:
 *   1. Customer clicks the button / link
 *   2. Their own WhatsApp opens (app or Web)
 *   3. Chat with the admin number is opened
 *   4. Pre-filled message is shown in the text box
 *   5. Customer reads it and presses Send — nothing is sent automatically
 *
 * @param {string} number  - admin WhatsApp number (10 digits or 12 with 91 prefix)
 * @param {string} [msg]   - pre-filled message (customer must press Send)
 * @returns {string}       - https://wa.me/91XXXXXXXXXX?text=...
 */
export function waLink(number, msg = '') {
  // Strip everything except digits
  const digits = String(number || '').replace(/\D/g, '');

  // Normalise to E.164 format (India: 91 + 10 digits = 12 digits total)
  // If already 12 digits starting with 91 → use as-is (e.g. "919944268288")
  // If 10 digits → prepend 91
  const phone = (digits.startsWith('91') && digits.length === 12)
    ? digits
    : `91${digits}`;

  // URL-encode the message so special characters (!, ,  etc.) don't break the link
  const text = msg ? `?text=${encodeURIComponent(msg)}` : '';

  return `https://wa.me/${phone}${text}`;
}

/** Default message used on "Chat on WhatsApp" buttons site-wide */
export const DEFAULT_WA_MSG =
  'Hello Sri Velva Naturals, I am interested in your products';
