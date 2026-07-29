import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '../utils/api';
import { useSettings } from '../context/SettingsContext';
import { waLink, DEFAULT_WA_MSG } from '../utils/waLink';
import { STATIC_PRODUCTS } from '../utils/staticProducts';
import ProductCard from '../components/ProductCard';
import './Home.css';

const FEATURES = [
  { icon: '🌿', title: 'Pure & Natural', desc: 'No chemicals, no additives. Just nature in its purest form.' },
  { icon: '🏺', title: 'Cold Pressed', desc: 'Traditional methods preserving maximum nutrients and benefits.' },
  { icon: '✅', title: 'Lab Tested', desc: 'Every batch quality-tested for purity and potency.' },
  { icon: '🚚', title: 'Fast Delivery', desc: 'Fresh from our farm to your doorstep within 3–5 days.' },
];

const TESTIMONIALS = [
  { name: 'Priya S.', loc: 'Chennai', rating: 5, text: 'The coconut oil is absolutely pure. My hair has never felt this silky!' },
  { name: 'Ravi K.', loc: 'Coimbatore', rating: 5, text: 'Switched to their sesame oil for cooking — family loves the aroma.' },
  { name: 'Meena T.', loc: 'Madurai', rating: 5, text: 'Face oil transformed my skin in just 2 weeks. Highly recommend!' },
];

export default function Home() {
  const { wa } = useSettings();
  // wa.me is the official WhatsApp deep link — opens app on mobile, WhatsApp Web on desktop.
  // Customer sees the pre-filled message and must press Send manually.
  // wa comes live from SettingsContext → GET /api/settings (admin-configurable).
  const waHref = waLink(wa, DEFAULT_WA_MSG);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts()
      .then(r => {
        const list = r?.data?.data;
        setProducts(Array.isArray(list) && list.length > 0 ? list.slice(0, 6) : STATIC_PRODUCTS.slice(0, 6));
      })
      .catch(() => setProducts(STATIC_PRODUCTS.slice(0, 6)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="home page-enter">
      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-blob hero-blob-1" />
          <div className="hero-blob hero-blob-2" />
          <div className="hero-grain" />
        </div>
        <div className="container hero-inner">
          {/* Mobile-only hero image */}
          <div className="hero-visual-mobile">
            <img
              src="/assets/sri-velva-hero-new.png"
              alt="Sri Velva Naturals"
              className="hero-img-mobile"
            />
          </div>
          <div className="hero-content">
            <span className="label hero-eyebrow">Pure · Natural · Chemical Free</span>
            <h1 className="display-xl hero-title">
              Nature's Finest<br />
              <em>Oils & Care</em>
            </h1>
            <p className="body-lg hero-desc">
              Handcrafted cold-pressed oils and natural care products rooted in Tamil Nadu's ancient tradition of purity.
            </p>
            <div className="hero-actions">
              <Link to="/products" className="btn btn-primary btn-lg">Shop Collection</Link>
              <Link to="/about" className="btn btn-outline btn-lg">Our Story</Link>
            </div>
            <div className="hero-trust">
              <span>🌿 Chemical-free</span>
              <span>🏺 Cold pressed</span>
              <span>✅ Lab tested</span>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-img-wrap">
              <img
                src="/assets/sri-velva-hero-new.png"
                alt="Sri Velva Naturals"
                className="hero-img hero-logo-main"
              />
              <div className="hero-card-float">
                <div className="float-icon">🌿</div>
                <div>
                  <strong>100% Natural</strong>
                  <span>No preservatives</span>
                </div>
              </div>
              <div className="hero-card-float hero-card-float-2">
                <div className="float-icon">⭐</div>
                <div>
                  <strong>4.9 Rating</strong>
                  <span>1200+ customers</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="section categories-section">
        <div className="container">
          <div className="section-header reveal">
            <span className="eyebrow">Browse by Category</span>
            <h2>What We Offer</h2>
            <div className="divider" />
          </div>
          <div className="categories-grid">
            {[
              { name: 'Cold Pressed Oils', tag: 'oils',      desc: 'Sesame, Coconut, Groundnut & more',          img: '/assets/categories/cold-pressed-oils.png',         icon: '🫒' },
              { name: 'Skin Care',         tag: 'skin care', desc: 'Face oils, serums & Herbal Bath Powder',      img: '/assets/categories/herbal-bath-powder-skin.png',   icon: '✨' },
              { name: 'Hair Care',         tag: 'hair care', desc: 'Hair oils, Shikakai Powder & scalp care',     img: '/assets/categories/shikakai-powder-hair.png',      icon: '💆' },
              { name: 'Spices',            tag: 'spices',    desc: 'Turmeric, Pepper, Sambar Powder & more',      img: '/assets/categories/spices.png',                    icon: '🌶️' },
            ].map((cat, i) => (
              <Link to={`/products?category=${cat.tag}`} key={cat.tag} className={`category-card reveal reveal-delay-${i + 1}`}>
                <div className="cat-img">
                  <img src={cat.img} alt={cat.name} loading="lazy" />
                  <div className="cat-overlay" />
                </div>
                <div className="cat-body">
                  <span className="cat-icon">{cat.icon}</span>
                  <h3>{cat.name}</h3>
                  <p>{cat.desc}</p>
                  <span className="cat-cta">Explore →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section className="section featured-section">
        <div className="container">
          <div className="section-header reveal">
            <span className="eyebrow">Best Sellers</span>
            <h2>Featured Products</h2>
            <div className="divider" />
            <p>Our most loved natural products — trusted by thousands of families.</p>
          </div>
          {loading ? (
            <div className="loader-wrap"><div className="spinner" /></div>
          ) : (
            <div className="grid-3">
              {products.map((p, i) => (
                <div key={p.id} className={`reveal reveal-delay-${Math.min(i + 1, 4)}`}>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          )}
          <div className="reveal" style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Link to="/products" className="btn btn-outline btn-lg">View All Products</Link>
          </div>
        </div>
      </section>

      {/* ── Why Choose Us ── */}
      <section className="section why-section">
        <div className="why-bg" />
        <div className="container">
          <div className="section-header reveal">
            <span className="eyebrow">Why Sri Velva Naturals</span>
            <h2>The Pure Difference</h2>
            <div className="divider" />
          </div>
          <div className="why-grid">
            {FEATURES.map((f, i) => (
              <div key={f.title} className={`why-card reveal reveal-delay-${i + 1}`}>
                <div className="why-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Process Banner ── */}
      <section className="process-banner">
        <div className="container process-inner">
          <div className="process-text">
            <span className="eyebrow" style={{ color: 'var(--honey)' }}>Our Process</span>
            <h2 style={{ color: 'white', fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem,4vw,2.8rem)' }}>
              From Seed to Bottle
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.75)', marginTop: '1rem' }}>
              We source the finest seeds and nuts directly from farmers. Our cold-pressing process retains all the vital nutrients — no heat, no chemicals, just nature.
            </p>
            <Link to="/about" className="btn btn-gold" style={{ marginTop: '1.5rem' }}>
              Learn More
            </Link>
          </div>
          <div className="process-steps">
            {['🌱 Source', '🔄 Cold Press', '🧪 Test', '📦 Pack'].map((s, i) => (
              <div key={i} className="process-step">
                <div className="step-num">{i + 1}</div>
                <span>{s}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="section testimonials-section">
        <div className="container">
          <div className="section-header reveal">
            <span className="eyebrow">Customer Love</span>
            <h2>What They Say</h2>
            <div className="divider" />
          </div>
          <div className="testimonials-grid">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className={`testimonial-card reveal reveal-delay-${i + 1}`}>
                <div className="t-stars">
                  {'⭐'.repeat(t.rating)}
                </div>
                <p>"{t.text}"</p>
                <div className="t-author">
                  <div className="t-avatar">{t.name[0]}</div>
                  <div>
                    <strong>{t.name}</strong>
                    <span>{t.loc}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="cta-banner">
        <div className="container" style={{ textAlign: 'center' }}>
          <h2>Ready to Go Natural?</h2>
          <p>Join 1200+ happy customers living the pure life.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '2rem' }}>
            <Link to="/products" className="btn btn-primary btn-lg">Shop Now</Link>
            <a
              href={waHref}
              target="_blank"
              rel="noreferrer"
              className="btn btn-whatsapp btn-lg"
            >
              WhatsApp Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

