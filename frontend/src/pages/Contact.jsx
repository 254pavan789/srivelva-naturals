import { useState } from 'react';
import toast from 'react-hot-toast';
import { FiMapPin, FiMail, FiClock, FiSend, FiPhone } from 'react-icons/fi';
import { useSettings }           from '../context/SettingsContext';
import { waLink, DEFAULT_WA_MSG } from '../utils/waLink';
import './Contact.css';

/*
 * Contact page
 *
 * "Send a Message" form → opens the customer's own WhatsApp with a
 * pre-filled message so the admin receives it directly.
 *
 * Quick Message buttons → same WhatsApp deep-link approach.
 * Nothing is auto-sent; the customer must press Send in WhatsApp.
 */

const QUICK_MESSAGES = [
  'I want to place a bulk order',
  'Tell me about your oils',
  'Do you offer custom blends?',
  "What's the delivery time?",
];

export default function Contact() {
  const { wa, email } = useSettings();   // live values from /api/settings

  const [form, setForm] = useState({
    name: '', email: '', phone: '', subject: '', message: '',
  });

  const handleChange = e =>
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.message.trim()) {
      toast.error('Please fill in your name and message.');
      return;
    }

    const msg = [
      'Hello Sri Velva Naturals, I have an enquiry.',
      '',
      `Name: ${form.name.trim()}`,
      form.phone.trim()   ? `Phone: ${form.phone.trim()}`     : null,
      form.email.trim()   ? `Email: ${form.email.trim()}`     : null,
      form.subject.trim() ? `Subject: ${form.subject.trim()}` : null,
      '',
      `Message: ${form.message.trim()}`,
    ].filter(line => line !== null).join('\n');

    window.open(waLink(wa, msg), '_blank');
    setForm({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  return (
    <div className="contact-page page-enter">

      {/* Hero */}
      <div className="contact-hero">
        <div className="container">
          <span className="label" style={{ color: 'var(--gold)', display: 'block', marginBottom: '0.75rem', textAlign: 'center' }}>
            Get in Touch
          </span>
          <h1 style={{ textAlign: 'center' }}>Contact Us</h1>
          <p style={{ textAlign: 'center' }}>Have a question about our products? We're here to help — anytime.</p>
        </div>
      </div>

      <div className="container contact-layout">

        {/* ── Info Column ── */}
        <div className="contact-info-col">
          <div className="ci-block">
            <h2>Let's Talk</h2>
            <p>Reach out for product queries, bulk orders, custom blends, or just to say hello.</p>
          </div>

          <div className="contact-cards">
            <div className="contact-card">
              <div className="cc-icon"><FiPhone size={20}/></div>
              <div>
                <strong>Phone / WhatsApp</strong>
                <a
                  href={waLink(wa, DEFAULT_WA_MSG)}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: 'inherit', textDecoration: 'none', display: 'block' }}
                >
                  +91 {wa}
                </a>
                <small>Call us during business hours</small>
              </div>
            </div>

            <div className="contact-card">
              <div className="cc-icon"><FiMail size={20}/></div>
              <div>
                <strong>Email</strong>
                <a href={`mailto:${email}`} style={{ color: 'inherit', textDecoration: 'none', display: 'block' }}>
                  {email}
                </a>
                <small>We reply within 24 hours</small>
              </div>
            </div>

            <div className="contact-card">
              <div className="cc-icon"><FiMapPin size={20}/></div>
              <div>
                <strong>Location</strong>
                <span>Velur, Tamil Nadu, India</span>
                <small>Serving pan-India</small>
              </div>
            </div>

            <div className="contact-card">
              <div className="cc-icon"><FiClock size={20}/></div>
              <div>
                <strong>Business Hours</strong>
                <span>Mon – Sat: 9 AM – 6 PM</span>
                <small>Sunday: limited support</small>
              </div>
            </div>
          </div>

          {/* ── Quick Message buttons ── */}
          <div className="wa-quick">
            <h3>Quick Message</h3>
            <p>Click a button to open WhatsApp — you'll see a pre-filled message ready to send:</p>
            <div className="wa-templates">
              {QUICK_MESSAGES.map(label => {
                const msg = form.name.trim()
                  ? `Hi, my name is ${form.name.trim()}. ${label}.`
                  : `Hi Sri Velva Naturals, ${label}.`;
                return (
                  <a
                    key={label}
                    href={waLink(wa, msg)}
                    target="_blank"
                    rel="noreferrer"
                    className="wa-template-btn"
                  >
                    💬 {label}
                  </a>
                );
              })}
            </div>

            <a
              href={waLink(wa, DEFAULT_WA_MSG)}
              target="_blank"
              rel="noreferrer"
              className="btn btn-whatsapp"
              style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}
            >
              Chat on WhatsApp
            </a>
          </div>
        </div>

        {/* ── Form Column ── */}
        <div className="contact-form-col">
          <div className="contact-form-wrap">
            <h2>General Enquiry</h2>
            <p>Fill in the form and we'll get back to you via WhatsApp.</p>

            <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }} noValidate aria-label="Contact form">

              <div className="cf-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="cf-name">Your Name *</label>
                  <input
                    id="cf-name"
                    className="form-input"
                    name="name"
                    type="text"
                    placeholder="Priya Sharma"
                    autoComplete="name"
                    value={form.name}
                    onChange={handleChange}
                    aria-required="true"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="cf-phone">Phone Number</label>
                  <input
                    id="cf-phone"
                    className="form-input"
                    name="phone"
                    type="tel"
                    placeholder="9876543210"
                    autoComplete="tel-national"
                    value={form.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="cf-email">Email Address</label>
                <input
                  id="cf-email"
                  className="form-input"
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="cf-subject">Subject</label>
                <select
                  id="cf-subject"
                  className="form-input"
                  name="subject"
                  autoComplete="off"
                  value={form.subject}
                  onChange={handleChange}
                >
                  <option value="">Select a subject…</option>
                  <option value="Product Enquiry">Product Enquiry</option>
                  <option value="Bulk Order">Bulk Order</option>
                  <option value="Feedback">Feedback</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="cf-message">Message *</label>
                <textarea
                  id="cf-message"
                  className="form-input"
                  name="message"
                  rows={5}
                  placeholder="Tell us how we can help you…"
                  autoComplete="off"
                  value={form.message}
                  onChange={handleChange}
                  style={{ resize: 'vertical' }}
                  aria-required="true"
                />
              </div>

              <button className="btn btn-primary btn-lg cf-submit" type="submit">
                <FiSend size={16}/> Send via WhatsApp
              </button>

            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
