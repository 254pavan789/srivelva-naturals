import { Link } from 'react-router-dom';
import brand from '../utils/brandConfig';
import JourneyTimeline from '../components/JourneyTimeline';
import './About.css';

const TEAM = [
  { name: 'Velmurugan R.', role: 'Founder & Master Presser', desc: 'Third-generation oil extractor with 20 years of experience in traditional cold-pressing methods.', initial: 'V' },
  { name: 'Kavitha S.', role: 'Head of Quality', desc: 'Ayurvedic practitioner ensuring every product meets the highest purity standards.', initial: 'K' },
];

export default function About() {
  return (
    <div className="about-page page-enter">
      {/* Hero */}
      <section className="about-hero">
        <div className="about-hero-bg"/>
        <div className="container about-hero-inner">
          <div className="about-hero-content">
            <span className="label" style={{ color:'var(--honey)', display:'block', marginBottom:'1rem' }}>Our Story</span>
            <h1>Born from Nature,<br /><em>Built on Trust</em></h1>
            <p>Sri Velva Naturals was born from a simple belief — that the best things in life are pure, natural, and chemical-free. We carry forward the ancient tradition of cold-pressed oils from the heart of Tamil Nadu.</p>
            <Link to="/products" className="btn btn-gold btn-lg" style={{ marginTop:'1.5rem' }}>
              Explore Products
            </Link>
          </div>
          <div className="about-hero-img-wrap">
            <img src="/assets/about/our-story.png" alt="Our Story - Sri Velva Naturals" />
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="section mission-section">
        <div className="container">
          <div className="mission-grid">
            <div className="mission-card">
              <div className="mc-icon">🌱</div>
              <h3>Our Mission</h3>
              <p>To bring the purest, most potent natural oils and care products from Tamil Nadu's rich land directly to your home — preserving tradition and promoting wellness.</p>
            </div>
            <div className="mission-card mission-card-center">
              <div className="mc-icon">🏺</div>
              <h3>Our Method</h3>
              <p>We use wooden and stone cold-press machines just as our ancestors did. No heat, no chemicals, no additives — preserving every drop of natural goodness in each bottle.</p>
            </div>
            <div className="mission-card">
              <div className="mc-icon">💚</div>
              <h3>Our Promise</h3>
              <p>Every product is lab-tested for purity, naturally processed, and delivered fresh. We promise 100% transparency in ingredients and sourcing — always.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="section story-section">
        <div className="container story-grid">
          <div className="story-imgs">
            <img src="/assets/about/family-legacy.png" alt="A Family Legacy of Purity" className="story-img-main" />
            <div className="story-glass-box">
              <img src="/assets/about/glass-3bottle.png" alt="Sri Velva oil collection" className="glass-3bottle-img" />
            </div>
          </div>
          <div className="story-content">
            <span className="eyebrow">The Beginning</span>
            <h2>A Family Legacy of Purity</h2>
            <div className="divider" style={{ margin:'1rem 0' }}/>
            <p>In the small village of Velur, Tamil Nadu, Velmurugan's grandfather ran a traditional oil press (chakki). The aroma of fresh sesame oil and the warmth of the wooden press are childhood memories that never faded.</p>
            <p style={{ marginTop:'1rem' }}>When chemical-laden refined oils began flooding markets, Velmurugan made a decision — to revive the old ways. In 2018, with a single cold-press machine and a deep respect for purity, Sri Velva Naturals was born.</p>
            <p style={{ marginTop:'1rem' }}>Today, we serve thousands of families across India who believe what you put on your skin and into your food matters. Every bottle carries the promise of our heritage.</p>
            <div className="story-stats">
              <div className="stat"><strong>5+</strong><span>Years of purity</span></div>
              <div className="stat"><strong>1200+</strong><span>Happy families</span></div>
              <div className="stat"><strong>7</strong><span>Pure products</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* Journey Timeline */}
      <JourneyTimeline />

      {/* Process */}
      <section className="section process-section">
        <div className="container">
          <div className="section-header">
            <span className="eyebrow">How We Make It</span>
            <h2>The Cold Press Process</h2>
            <div className="divider"/>
            <p>Our traditional cold-pressing method preserves all the natural nutrients, aroma, and potency that modern refining destroys.</p>
          </div>
          <div className="process-steps-grid">
            {[
              { step:'01', icon:'🌱', title:'Source', desc:'Hand-picked seeds and nuts from certified organic farms in Tamil Nadu.' },
              { step:'02', icon:'🫧', title:'Clean', desc:'Washed, dried and sorted to remove any impurities before pressing.' },
              { step:'03', icon:'🔄', title:'Cold Press', desc:'Pressed using traditional wooden/stone press at room temperature. No heat, no solvents.' },
              { step:'04', icon:'🧪', title:'Lab Test', desc:'Each batch tested for purity, acidity and contamination at FSSAI-certified lab.' },
              { step:'05', icon:'📦', title:'Pack & Seal', desc:'Bottled in food-grade dark glass to protect from light and oxidation.' },
              { step:'06', icon:'🚚', title:'Deliver', desc:'Fresh from our press to your door within 5 business days.' },
            ].map(p => (
              <div key={p.step} className="process-step-card">
                <div className="psc-step">{p.step}</div>
                <div className="psc-icon">{p.icon}</div>
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="about-cta">
        <div className="container" style={{ textAlign:'center' }}>
          <h2>Experience the Difference</h2>
          <p>Join 1200+ families who trust Sri Velva Naturals for pure, traditional wellness.</p>
          <div style={{ display:'flex', gap:'1rem', justifyContent:'center', flexWrap:'wrap', marginTop:'2rem' }}>
            <Link to="/products" className="btn btn-primary btn-lg">Shop Now</Link>
            <Link to="/contact"  className="btn btn-outline btn-lg">Get in Touch</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
