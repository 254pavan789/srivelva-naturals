import { useEffect, useRef } from 'react';
import './JourneyTimeline.css';

const MILESTONES = [
  {
    year: '1971',
    title: 'Legacy Begins',
    desc: 'Our grandfather started a traditional wooden oil press (chakku) in the village of Velur, Tamil Nadu — a dream rooted in purity.',
    icon: '🌱',
  },
  {
    year: '1985',
    title: 'Community Roots',
    desc: 'Expanded to serve neighboring villages, becoming the most trusted local oil press for sesame and groundnut oils across the region.',
    icon: '🏺',
  },
  {
    year: '2000',
    title: 'Second Generation',
    desc: 'Velmurugan took the reins, preserving ancient cold-press traditions while elevating quality standards for a new era.',
    icon: '🤝',
  },
  {
    year: '2010',
    title: 'Growing Demand',
    desc: 'Word spread across Tamil Nadu — our pure cold-pressed oils became a regional name, trusted by thousands of families.',
    icon: '🌿',
  },
  {
    year: '2018',
    title: 'Sri Velva Naturals Born',
    desc: 'Officially launched as a heritage brand, merging time-honoured cold-press craftsmanship with modern packaging and hygiene.',
    icon: '✨',
  },
  {
    year: '2020',
    title: 'Lab Certified Purity',
    desc: 'Received FSSAI quality certification, confirming our promise — chemical-free, preservative-free purity in every drop.',
    icon: '🏅',
  },
  {
    year: '2022',
    title: '1000+ Families',
    desc: 'Crossed 1,000 happy families who trust our pure oils daily — a milestone built on love, not marketing.',
    icon: '💚',
  },
  {
    year: '2024',
    title: 'India-Wide Delivery',
    desc: 'Launched our digital store, bringing authentic cold-pressed oils from Tamil Nadu to doorsteps across India.',
    icon: '🚀',
  },
  {
    year: '2026',
    title: 'Expanding Horizons',
    desc: 'Growing our family to include skin care, hair care, and traditional spices — all rooted in the same natural purity.',
    icon: '🌸',
  },
];

export default function JourneyTimeline() {
  const sectionRef = useRef(null);
  const cardRefs = useRef([]);
  const vineRef = useRef(null);

  useEffect(() => {
    // Intersection Observer for card reveal
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('jt-visible');
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );

    cardRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    // Vine draw animation on scroll
    const handleScroll = () => {
      if (!vineRef.current || !sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const windowH = window.innerHeight;
      const sectionH = sectionRef.current.offsetHeight;
      const scrolled = Math.max(0, windowH - rect.top);
      const progress = Math.min(1, scrolled / (sectionH + windowH * 0.5));
      const path = vineRef.current.querySelector('.jt-vine-path');
      if (path) {
        const length = path.getTotalLength();
        path.style.strokeDashoffset = length * (1 - progress);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <section className="jt-section" ref={sectionRef}>
      {/* Subtle botanical watermark */}
      <div className="jt-watermark" aria-hidden="true">
        <svg viewBox="0 0 800 900" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="400" cy="450" rx="320" ry="400" stroke="#2D5016" strokeWidth="1" opacity="0.04"/>
          <path d="M400 50 Q500 200 400 400 Q300 600 400 850" stroke="#2D5016" strokeWidth="1.5" opacity="0.04" fill="none"/>
          <path d="M400 200 Q480 160 520 100" stroke="#2D5016" strokeWidth="1" opacity="0.04" fill="none"/>
          <path d="M400 200 Q320 160 280 100" stroke="#2D5016" strokeWidth="1" opacity="0.04" fill="none"/>
          <path d="M400 350 Q490 300 540 240" stroke="#2D5016" strokeWidth="1" opacity="0.04" fill="none"/>
          <path d="M400 350 Q310 300 260 240" stroke="#2D5016" strokeWidth="1" opacity="0.04" fill="none"/>
          <path d="M400 520 Q500 470 555 400" stroke="#2D5016" strokeWidth="1" opacity="0.04" fill="none"/>
          <path d="M400 520 Q300 470 245 400" stroke="#2D5016" strokeWidth="1" opacity="0.04" fill="none"/>
          <path d="M400 680 Q490 630 540 560" stroke="#2D5016" strokeWidth="1" opacity="0.04" fill="none"/>
          <path d="M400 680 Q310 630 260 560" stroke="#2D5016" strokeWidth="1" opacity="0.04" fill="none"/>
          {/* Leaf shapes */}
          <ellipse cx="530" cy="90" rx="28" ry="14" transform="rotate(-40 530 90)" stroke="#2D5016" strokeWidth="0.8" opacity="0.04"/>
          <ellipse cx="270" cy="90" rx="28" ry="14" transform="rotate(40 270 90)" stroke="#2D5016" strokeWidth="0.8" opacity="0.04"/>
          <ellipse cx="550" cy="230" rx="30" ry="14" transform="rotate(-35 550 230)" stroke="#2D5016" strokeWidth="0.8" opacity="0.04"/>
          <ellipse cx="250" cy="230" rx="30" ry="14" transform="rotate(35 250 230)" stroke="#2D5016" strokeWidth="0.8" opacity="0.04"/>
          <ellipse cx="565" cy="390" rx="30" ry="14" transform="rotate(-30 565 390)" stroke="#2D5016" strokeWidth="0.8" opacity="0.04"/>
          <ellipse cx="235" cy="390" rx="30" ry="14" transform="rotate(30 235 390)" stroke="#2D5016" strokeWidth="0.8" opacity="0.04"/>
          <ellipse cx="550" cy="550" rx="28" ry="13" transform="rotate(-35 550 550)" stroke="#2D5016" strokeWidth="0.8" opacity="0.04"/>
          <ellipse cx="250" cy="550" rx="28" ry="13" transform="rotate(35 250 550)" stroke="#2D5016" strokeWidth="0.8" opacity="0.04"/>
        </svg>
      </div>

      <div className="jt-container">
        {/* Header */}
        <div className="jt-header">
          <span className="jt-eyebrow">Est. 1971 · Tamil Nadu</span>
          <h2 className="jt-title">Our Journey</h2>
          <div className="jt-title-ornament">
            <span className="jt-orn-line"/>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2 C12 2 8 6 8 10 C8 14 10 16 12 22 C14 16 16 14 16 10 C16 6 12 2 12 2Z" fill="#B8860B" opacity="0.9"/>
              <path d="M12 8 C12 8 7 10 5 13 C8 13 10 12 12 14 C14 12 16 13 19 13 C17 10 12 8 12 8Z" fill="#2D5016" opacity="0.7"/>
            </svg>
            <span className="jt-orn-line"/>
          </div>
          <p className="jt-subtitle">
            Five decades of heritage, handcraft, and heartfelt purity — from a single wooden press to thousands of families across India.
          </p>
        </div>

        {/* Timeline */}
        <div className="jt-timeline">
          {/* Animated vine SVG — straight vertical line, NO branches */}
          <div className="jt-vine-wrap" ref={vineRef} aria-hidden="true">
            <svg
              className="jt-vine-svg"
              viewBox="0 0 120 2400"
              preserveAspectRatio="xMidYMid meet"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Straight vertical stem — NO branches, NO leaves */}
              <path
                className="jt-vine-path"
                d="M60 0 L60 2400"
                stroke="#3D6B20"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Milestone cards */}
          {MILESTONES.map((m, i) => (
            <div
              key={i}
              className={`jt-item ${i % 2 === 0 ? 'jt-left' : 'jt-right'}`}
              ref={(el) => (cardRefs.current[i] = el)}
            >
              {/* Gold dot on vine */}
              <div className="jt-dot">
                <div className="jt-dot-inner"/>
                <div className="jt-dot-pulse"/>
              </div>

              {/* Card */}
              <div className="jt-card">
                <div className="jt-card-year-wrap">
                  <span className="jt-card-icon">{m.icon}</span>
                  <span className="jt-card-year">{m.year}</span>
                </div>
                <h3 className="jt-card-title">{m.title}</h3>
                <p className="jt-card-desc">{m.desc}</p>
                <div className="jt-card-leaf" aria-hidden="true">
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                    <path d="M20 4 C20 4 10 14 10 22 C10 30 14 34 20 38 C26 34 30 30 30 22 C30 14 20 4 20 4Z" fill="#2D5016" opacity="0.06"/>
                  </svg>
                </div>
              </div>
            </div>
          ))}

          {/* End flourish */}
          <div className="jt-end">
            <div className="jt-end-dot">
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                <circle cx="18" cy="18" r="17" stroke="#B8860B" strokeWidth="1.2" opacity="0.4"/>
                <path d="M18 6 C18 6 12 12 12 18 C12 24 15 27 18 32 C21 27 24 24 24 18 C24 12 18 6 18 6Z" fill="#B8860B" opacity="0.7"/>
                <path d="M18 14 C18 14 11 17 9 21 C12 21 15 20 18 22 C21 20 24 21 27 21 C25 17 18 14 18 14Z" fill="#2D5016" opacity="0.6"/>
              </svg>
            </div>
            <p className="jt-end-label">Still Growing · Still Pure</p>
          </div>
        </div>
      </div>
    </section>
  );
}
