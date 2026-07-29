import { Link } from 'react-router-dom';
import { FiInstagram, FiFacebook, FiYoutube } from 'react-icons/fi';
import brand from '../utils/brandConfig';
import { useSettings } from '../context/SettingsContext';
import { waLink, DEFAULT_WA_MSG } from '../utils/waLink';
import './Footer.css';


export default function Footer() {
  const { settings } = useSettings();
  const wa    = settings.whatsappNumber;
  const email = settings.email;

  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="container footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              <img
                src={brand.logoSrc}
                alt={brand.logoAlt}
                className="footer-logo-img"
              />
            </div>
            <p>Bringing nature's finest to your doorstep. Handcrafted with traditional wisdom and pure ingredients.</p>
            <div className="footer-social">
              <a href="#" aria-label="Instagram"><FiInstagram /></a>
              <a href="#" aria-label="Facebook"><FiFacebook /></a>
              <a href="#" aria-label="YouTube"><FiYoutube /></a>
              <a
                href={waLink(wa)}
                aria-label="WhatsApp"
                target="_blank"
                rel="noreferrer"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
              </a>
            </div>
          </div>

          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/products">All Products</Link></li>
              <li><Link to="/about">Our Story</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Categories</h4>
            <ul>
              <li><Link to="/products?category=Oils">Cold Pressed Oils</Link></li>
              <li><Link to="/products?category=Skin Care">Skin Care</Link></li>
              <li><Link to="/products?category=Hair Care">Hair Care</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Contact</h4>
            <ul className="contact-list">
              <li>📍 Tamil Nadu, India</li>
              <li>
                <a href={waLink(wa)} target="_blank" rel="noreferrer">
                  📱 +91 {wa}
                </a>
              </li>
              <li>
                <a href={`mailto:${email}`}>{email}</a>
              </li>
            </ul>
            <a
              href={waLink(wa, DEFAULT_WA_MSG)}
              target="_blank"
              rel="noreferrer"
              className="btn btn-whatsapp btn-sm"
              style={{ marginTop: '1rem' }}
            >
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <p>© {new Date().getFullYear()} Sri Velva Naturals. All rights reserved. Crafted with ❤️ in Tamil Nadu.</p>
        </div>
      </div>
    </footer>
  );
}
