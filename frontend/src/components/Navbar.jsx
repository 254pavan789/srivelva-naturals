import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { FiShoppingCart, FiMenu, FiX } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import brand from '../utils/brandConfig';
import './Navbar.css';

export default function Navbar() {
  const { count } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen]         = useState(false);
  const navigate  = useNavigate();
  const { pathname } = useLocation();


  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 48);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    const fn = () => { if (window.innerWidth > 768) setOpen(false); };
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);

  const navLinks = [
    { to: '/',         label: 'Home'     },
    { to: '/products', label: 'Products' },
    { to: '/about',    label: 'About'    },
    { to: '/contact',  label: 'Contact'  },
  ];

  const isAboutPage = pathname === '/about';

  const navClass = [
    'navbar',
    (scrolled || isAboutPage) ? 'scrolled'      : '',
    open                      ? 'menu-open'     : '',
  ].filter(Boolean).join(' ');

  return (
    <nav className={navClass}>
      <div className="container navbar-inner">

        {/* ── Logo
            To swap the logo image, edit src/utils/brandConfig.js → logoSrc
            ── */}
        <Link to="/" className="navbar-logo" onClick={() => setOpen(false)}>
          <img
            src={brand.logoSrc}
            alt={brand.logoAlt}
            className="navbar-logo-img"
            draggable={false}
          />
        </Link>

        {/* ── Desktop links ── */}
        <ul className="navbar-links">
          {navLinks.map(l => (
            <li key={l.to}>
              <NavLink
                to={l.to}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                end={l.to === '/'}
              >
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* ── Actions ── */}
        <div className="navbar-actions">
          <button
            className="cart-btn"
            onClick={() => navigate('/cart')}
            aria-label={`Cart — ${count} item${count !== 1 ? 's' : ''}`}
          >
            <FiShoppingCart size={19} />
            {count > 0 && <span className="cart-badge">{count}</span>}
          </button>

          <Link to="/products" className="btn btn-primary btn-sm hidden-mobile">
            Shop Now
          </Link>

          <button
            className="menu-btn"
            onClick={() => setOpen(o => !o)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <FiX size={21} /> : <FiMenu size={21} />}
          </button>
        </div>
      </div>

      {/* ── Mobile drawer ── */}
      <div className={`mobile-menu ${open ? 'open' : ''}`} inert={!open ? '' : undefined}>
        <div className="mobile-menu-inner">
          {navLinks.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) => `mobile-link ${isActive ? 'active' : ''}`}
              end={l.to === '/'}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </NavLink>
          ))}
          <NavLink to="/cart" className="mobile-link" onClick={() => setOpen(false)}>
            Cart {count > 0 && <span className="mobile-cart-count">{count}</span>}
          </NavLink>
          <Link
            to="/products"
            className="btn btn-primary mobile-shop-btn"
            onClick={() => setOpen(false)}
          >
            Shop Now
          </Link>
        </div>
      </div>
    </nav>
  );
}
