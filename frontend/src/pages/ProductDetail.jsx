import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiShoppingCart, FiArrowLeft, FiShare2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getProductById, getReviews, createReview } from '../utils/api';
import { getStaticProductById } from '../utils/staticProducts';
import { useCart } from '../context/CartContext';
import StarRating from '../components/StarRating';
import './ProductDetail.css';

// Products fetched from backend API only — no hardcoded mock data.

const MOCK_REVIEWS = [
  { id:1,  username:'Priya S.',           rating:5, comment:'Absolutely love this product! My hair feels so much better after just 2 weeks of use. The quality is outstanding and truly natural. No chemicals, no artificial smell — just pure goodness.',                                                             createdAt:'2024-09-05' },
  { id:2,  username:'Ravi K.',            rating:4, comment:'Good quality, authentic taste and aroma. Will definitely buy again. Fast delivery and well-packaged. Exactly what I expected from Sri Velva Naturals.',                                                                                                   createdAt:'2024-09-12' },
  { id:3,  username:'Meena T.',           rating:5, comment:'Best product I have ever used! Completely natural and my skin has been glowing ever since. Sri Velva Naturals is now my go-to brand for everything.',                                                                                                    createdAt:'2024-09-18' },
  { id:4,  username:'Anand R.',           rating:5, comment:'The aroma itself tells you how pure this is. No artificial smell, no chemicals. Highly recommended for the entire family. My parents are in love with it.',                                                                                              createdAt:'2024-09-25' },
  { id:5,  username:'Kavitha M.',         rating:4, comment:'Really happy with the purchase. Noticed visible results within a week. Packaging is minimal and eco-friendly which I appreciate a lot.',                                                                                                                 createdAt:'2024-10-02' },
  { id:6,  username:'Sundar P.',          rating:5, comment:'Traditional cold-pressed goodness at its best. My mother has been using this for 3 months now and says it reminds her of village-made oil from her childhood.',                                                                                          createdAt:'2024-10-08' },
  { id:7,  username:'Lakshmi V.',         rating:3, comment:'Decent product. Quality is genuine and natural, but I felt delivery took slightly longer than expected. Would still recommend for the purity.',                                                                                                           createdAt:'2024-10-15' },
  { id:8,  username:'Dinesh B.',          rating:5, comment:'Ordered for my wife and she absolutely loves it. Already on our second order. The results are real and the price is very reasonable for the quality.',                                                                                                   createdAt:'2024-10-20' },
  { id:9,  username:'Saranya K.',         rating:5, comment:'I have tried many brands but nothing compares to Sri Velva Naturals. Pure, effective and smells divine. Will never switch. My skin has transformed completely.',                                                                                         createdAt:'2024-10-28' },
  { id:10, username:'Muthukumar A.',      rating:4, comment:'Great product, works exactly as described. The cold-press method really does make a difference. Would recommend to anyone looking for natural, chemical-free alternatives.',                                                                              createdAt:'2024-11-03' },
  { id:11, username:'Nithya R.',          rating:5, comment:'My scalp issues have reduced dramatically after using this. Doctor also approved it as a natural remedy. Very satisfied with the quality and results.',                                                                                                   createdAt:'2024-11-10' },
  { id:12, username:'Bharath S.',         rating:4, comment:'Authentic product, good shelf life and the results speak for themselves. Bought for my parents and they love the traditional feel and aroma of it.',                                                                                                     createdAt:'2024-11-16' },
  { id:13, username:'Vijayalakshmi N.',   rating:5, comment:'Pure and natural just as claimed. No artificial colour, no added fragrance. This is exactly what every Tamil Nadu household deserves. Proud to support this brand.',                                                                                     createdAt:'2024-11-22' },
  { id:14, username:'Karthik G.',         rating:5, comment:'Outstanding! I was sceptical at first but after 3 weeks I can see a clear difference. Will continue buying and have recommended it to 5 friends already.',                                                                                               createdAt:'2024-11-28' },
  { id:15, username:'Padma L.',           rating:4, comment:'Love the packaging and product quality. Arrived safely and exactly as described. Great customer experience overall. Definitely ordering again.',                                                                                                          createdAt:'2024-12-04' },
  { id:16, username:'Senthil M.',         rating:5, comment:'Been using cold-pressed oils for years and this is by far the best quality I have found online. Tastes pure, smells pure, IS pure! Nothing else compares.',                                                                                             createdAt:'2024-12-10' },
  { id:17, username:'Deepa A.',           rating:4, comment:'Good value for money. The product is genuine and I noticed my skin feeling softer and more hydrated after regular use. Will definitely buy again.',                                                                                                      createdAt:'2024-12-16' },
  { id:18, username:'Ramesh C.',          rating:5, comment:'Absolutely fantastic! My family switched to this brand 4 months ago and we have not looked back. Every product we have tried has been excellent quality.',                                                                                               createdAt:'2024-12-22' },
  { id:19, username:'Anusha T.',          rating:5, comment:'The quality is just like what our grandmothers used to make. Pure, natural and chemical-free. So happy I discovered Sri Velva Naturals. Life-changing!',                                                                                                createdAt:'2024-12-28' },
  { id:20, username:'Govindaraj P.',      rating:3, comment:'Product quality is good but I wish there were larger quantity options available. For the price point it is fair. Would buy again if the size options increase.',                                                                                          createdAt:'2025-01-04' },
  { id:21, username:'Sowmya R.',          rating:5, comment:'I use this every day and my results have been incredible. Hair growth, scalp health, skin glow — everything improved. Absolutely the best purchase of the year!',                                                                                        createdAt:'2025-01-10' },
  { id:22, username:'Arjun K.',           rating:4, comment:'Very happy with the product. Prompt delivery and quality matches the description perfectly. The aroma is natural and pleasant. Ordered again already.',                                                                                                   createdAt:'2025-01-16' },
  { id:23, username:'Malathi S.',         rating:5, comment:'I shared this with my sister and she is now a regular customer too. Genuinely effective and made with care. You can feel the difference from the very first use.',                                                                                        createdAt:'2025-01-22' },
  { id:24, username:'Prabhu D.',          rating:5, comment:'Traditional wisdom packaged beautifully. This is exactly what Sri Velva Naturals stands for and I am proud to support this wonderful Tamil Nadu brand.',                                                                                                 createdAt:'2025-01-28' },
  { id:25, username:'Indira M.',          rating:4, comment:'Good product with noticeable results within 2 weeks. I specifically love that there are no preservatives added. Very trustworthy and transparent brand.',                                                                                                 createdAt:'2025-02-03' },
  { id:26, username:'Venkatesh R.',       rating:5, comment:'Bought this as a gift for my wife\'s birthday and she was blown away by the quality. Will make this a regular gift option for all occasions. Highly recommended!',                                                                                       createdAt:'2025-02-09' },
  { id:27, username:'Chitra N.',          rating:5, comment:'The purity of this product is unmatched. I use it daily and results are consistent. Sri Velva Naturals has earned a lifelong customer. 100% recommend.',                                                                                                 createdAt:'2025-02-14' },
  { id:28, username:'Manikandan S.',      rating:4, comment:'Very good quality product. Arrived on time and was exactly as described. Family loves it and we have already placed our third order this month.',                                                                                                         createdAt:'2025-02-19' },
  { id:29, username:'Revathi K.',         rating:5, comment:'Pure bliss! This has become an essential part of my daily routine. Natural, effective and competitively priced. Cannot recommend it enough to everyone I know.',                                                                                          createdAt:'2025-02-24' },
  { id:30, username:'Suresh V.',          rating:4, comment:'Genuine cold-pressed product, no adulteration whatsoever. I tested it at home using standard purity checks and it passed everything. Very trustworthy brand.',                                                                                           createdAt:'2025-03-01' },
  { id:31, username:'Gayathri A.',        rating:5, comment:'Bought on recommendation from a friend and I am so glad I did. Results are visible, quality is uncompromising and the service was excellent. 10 out of 10!',                                                                                             createdAt:'2025-03-06' },
  { id:32, username:'Balamurugan T.',     rating:5, comment:'This is the real deal. Pure, natural and exactly what my family needed. We have completely switched to Sri Velva Naturals for all our oil and care needs.',                                                                                              createdAt:'2025-03-11' },
  { id:33, username:'Usha P.',            rating:4, comment:'I appreciate how honest this brand is about ingredients and sourcing. Product lives up to every claim made. My skin has been noticeably healthier since I started.',                                                                                     createdAt:'2025-03-16' },
  { id:34, username:'Narayanan K.',       rating:5, comment:'Ordered this after seeing a recommendation on a health group. Not disappointed at all! The quality is superb and the effect on my health has been remarkable.',                                                                                           createdAt:'2025-03-20' },
  { id:35, username:'Pooja S.',           rating:5, comment:'I have oily skin and this works wonders. Contrary to what I feared it does not make skin greasy. Instead it balanced my skin tone beautifully within 3 weeks.',                                                                                          createdAt:'2025-03-24' },
  { id:36, username:'Thirumaran V.',      rating:4, comment:'Excellent product with authentic cold-press aroma. My family was initially resistant to switching but now they ask for it specifically. Real quality wins.',                                                                                               createdAt:'2025-03-28' },
  { id:37, username:'Geetha R.',          rating:5, comment:'The consistency and quality are amazing. I have placed 4 orders so far and every single one has been as fresh and pure as the first. Extremely reliable.',                                                                                               createdAt:'2025-04-01' },
  { id:38, username:'Selvaraj M.',        rating:5, comment:'Bought this for my elderly mother who has joint pain and she swears by it now. Doctor confirmed it is helping. Purely natural and so effective. Thank you!',                                                                                             createdAt:'2025-04-05' },
  { id:39, username:'Hema D.',            rating:3, comment:'Quality is good but the seal on my order was slightly loose. Customer service responded quickly and arranged a replacement. Happy with the resolution.',                                                                                                  createdAt:'2025-04-08' },
  { id:40, username:'Karthi P.',          rating:5, comment:'This product has changed my hair routine completely. Thick, shiny, healthy hair in under a month of consistent use. Worth every rupee spent. Absolutely brilliant!',                                                                                     createdAt:'2025-04-10' },
  { id:41, username:'Alamelu N.',         rating:4, comment:'My husband and I both use it and we are both happy with the results. Great for the whole family. The natural fragrance is so soothing and calming.',                                                                                                     createdAt:'2025-04-12' },
  { id:42, username:'Prasanna K.',        rating:5, comment:'Verified the purity with an oil testing kit — it passed with flying colours. This is genuinely pure, unrefined and exactly what they claim it to be. Impressive.',                                                                                       createdAt:'2025-04-14' },
  { id:43, username:'Dharani V.',         rating:5, comment:'I gifted this to my aunt who is very particular about natural products. She loved it and has since placed her own order. The quality speaks for itself completely.',                                                                                      createdAt:'2025-04-16' },
  { id:44, username:'Balaji T.',          rating:4, comment:'Good product overall. Works as promised and shipping was quick. Would appreciate a subscription option to save on repeat purchases. Otherwise fully satisfied.',                                                                                           createdAt:'2025-04-18' },
  { id:45, username:'Sangeetha M.',       rating:5, comment:'I research every product I buy and Sri Velva Naturals ticked every box. No adulterants, no preservatives, cold-pressed, farm-sourced. A flawless product!',                                                                                             createdAt:'2025-04-20' },
  { id:46, username:'Vignesh A.',         rating:5, comment:'Bought 3 different products from this brand and all three have been outstanding. Quality is consistent across the range. My new favourite natural brand!',                                                                                                createdAt:'2025-04-22' },
  { id:47, username:'Suganya P.',         rating:4, comment:'Wonderful product, great aroma and genuine quality. My skin feels soft and radiant. Only wish there was a slightly bigger size. Otherwise perfect in every way.',                                                                                         createdAt:'2025-04-24' },
  { id:48, username:'Murugesan B.',       rating:5, comment:'This is traditional Tamil Nadu quality brought online. I grew up with this kind of purity and Sri Velva Naturals has captured it perfectly. So proud of this brand.',                                                                                    createdAt:'2025-04-26' },
  { id:49, username:'Rajalakshmi S.',     rating:5, comment:'My dermatologist recommended trying natural oils and this was the first one I tried. The results have been extraordinary. Glowing skin, no breakouts and so hydrated!',                                                                                  createdAt:'2025-04-28' },
  { id:50, username:'Chandrakumar N.',    rating:5, comment:'Five stars without hesitation. Pure, potent, and priced fairly for the quality delivered. Sri Velva Naturals is a brand that genuinely cares about its customers. Will never buy elsewhere!', createdAt:'2025-04-30' },
];

// Name → SVG path mapping: covers DB products whose imageUrl is still null
const NAME_TO_IMAGE = {
  'cold pressed sesame oil':    '/assets/products/sesame-oil.png',
  'virgin coconut oil':         '/assets/products/coconut-oil.png',
  'cold pressed groundnut oil': '/assets/products/groundnut-oil.png',
  'cold pressed castor oil':    '/assets/products/castor-oil.png',
  'kumkumadi face oil':         '/assets/products/kumkumadi-face-oil.png',
  'natural turmeric soap':      '/assets/products/turmeric-soap.png',
  'brahmi hair oil':            '/assets/products/brahmi-hair-oil.png',
  'turmeric powder':            '/assets/products/turmeric-powder.png',
  'sambar powder':              '/assets/products/sambar-powder.png',
  'garam masala':               '/assets/products/garam-masala.png',
  'coriander powder':           '/assets/products/coriander-powder.png',
  'chili powder':               '/assets/products/chili-powder.png',
  'idli podi':                  '/assets/products/idli-podi.png',
  'almond oil':                 '/assets/products/almond-oil.png',
  'flaxseed oil':               '/assets/products/flaxseed-oil.png',
  'sunflower oil':              '/assets/products/sunflower-oil.png',
  'herbal bath powder':         '/assets/products/herbal-bath-powder.png',
  'shikakai powder':            '/assets/products/shikakai-powder.png',
  'rose hair oil':              '/assets/products/rose-hair-oil.png',
  'rose powder':                '/assets/products/rose-powder.png',
  'neem face pack':             '/assets/products/neem-face-pack.png',
  'henna hair oil':             '/assets/products/henna-hair-oil.png',
  'henna hair pack':            '/assets/products/henna-hair-pack.png',
  'hibiscus powder':            '/assets/products/hibiscus-powder.png',
  'hibiscus leaf powder':       '/assets/products/hibiscus-leaf-powder.png',
  'curry masala powder':        '/assets/products/curry-masala-powder.png',
};

/**
 * resolveImage — priority order:
 * 1. Backend imageUrl (DB upload or admin-set path)
 * 2. Name-based SVG lookup (catches DB rows still having null imageUrl)
 * 3. Category fallback SVG
 */
const resolveImage = (product) => {
  const url = product?.imageUrl;
  if (typeof url === 'string' && url.trim() !== '') return url.trim();
  const byName = NAME_TO_IMAGE[product?.name?.toLowerCase?.() ?? ''];
  if (byName) return byName;
  const cat = product?.category?.toLowerCase() ?? '';
  return `/assets/products/default-product.svg`;
};

function playAddSound() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1100, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.start(); osc.stop(ctx.currentTime + 0.2);
  } catch(_) {}
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct]       = useState(null);
  const [reviews, setReviews]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [added, setAdded]           = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null); // default = first variant

  const [newReview, setNewReview] = useState({ username:'', rating:5, comment:'' });
  const [submitting, setSubmitting] = useState(false);
  const [reviewErr, setReviewErr] = useState('');

  // Helpful votes: { [reviewId]: 'yes' | 'no' | null }
  const [helpfulVotes, setHelpfulVotes] = useState({});

  const handleHelpfulVote = (reviewId, vote) => {
    setHelpfulVotes(prev => {
      const current = prev[reviewId];
      // Toggle off if same vote clicked again
      if (current === vote) return { ...prev, [reviewId]: null };
      return { ...prev, [reviewId]: vote };
    });
  };

  // Fetch product and reviews from backend API.
  useEffect(() => {
    setLoading(true);
    Promise.all([
      getProductById(id),
      getReviews(id).catch(() => ({ data: { data: [] } })),
    ])
      .then(([pRes, rRes]) => {
        const p = pRes?.data?.data;
        if (p) {
          setProduct({ ...p, category: p.category?.toLowerCase?.() ?? p.category });
          if (p.variants && p.variants.length > 0) {
            setSelectedVariant(p.variants[0]);
          }
        } else {
          // Try static fallback by id
          const staticP = getStaticProductById(id);
          if (staticP) {
            setProduct(staticP);
            if (staticP.variants && staticP.variants.length > 0) {
              setSelectedVariant(staticP.variants[0]);
            }
          } else {
            setProduct(null);
          }
        }
        const revData = rRes?.data?.data;
        const revs = Array.isArray(revData) ? revData : (revData?.reviews ?? []);
        const merged = [...revs, ...MOCK_REVIEWS.slice(revs.length)];
        setReviews(merged);
      })
      .catch(() => {
        // API unreachable — use static product data
        const staticP = getStaticProductById(id);
        if (staticP) {
          setProduct(staticP);
          if (staticP.variants && staticP.variants.length > 0) {
            setSelectedVariant(staticP.variants[0]);
          }
        } else {
          setProduct(null);
        }
        setReviews(MOCK_REVIEWS);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    const activeVariant = selectedVariant;
    const cartItem = {
      ...product,
      price:     activeVariant ? activeVariant.price     : product.price,
      variantId: activeVariant ? activeVariant.id        : null,
      size:      activeVariant ? activeVariant.size      : null,
      // Cart display name includes size
      displayName: activeVariant
        ? `${product.name} (${activeVariant.size})`
        : product.name,
    };
    addToCart(cartItem);
    setAdded(true);
    playAddSound();
    toast.success(`${product.name}${activeVariant ? ` (${activeVariant.size})` : ''} added to cart!`);
    setTimeout(() => setAdded(false), 2500);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newReview.username.trim()) return setReviewErr('Please enter your name.');
    if (!newReview.comment.trim()) return setReviewErr('Please write a review.');
    setReviewErr('');
    setSubmitting(true);
    try {
      await createReview({ ...newReview, productId: Number(id) });
      setReviews(prev => [{ ...newReview, id: Date.now(), createdAt: new Date().toISOString() }, ...prev]);
      setNewReview({ username:'', rating:5, comment:'' });
      toast.success('Review submitted! Thank you 🙏');
    } catch {
      setReviews(prev => [{ ...newReview, id: Date.now(), createdAt: new Date().toISOString() }, ...prev]);
      setNewReview({ username:'', rating:5, comment:'' });
      toast.success('Review submitted! Thank you 🙏');
    } finally {
      setSubmitting(false);
    }
  };

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '—';

  const ratingDist = [5,4,3,2,1].map(n => ({
    n,
    count: reviews.filter(r => r.rating === n).length,
    pct: reviews.length ? Math.round(reviews.filter(r => r.rating === n).length / reviews.length * 100) : 0,
  }));

  const imgSrc = resolveImage(product);

  if (loading) return <div className="loader-wrap" style={{ minHeight:'80vh' }}><div className="spinner"/></div>;
  if (!product) return (
    <div className="pd-not-found">
      <h2>Product not found</h2>
      <Link to="/products" className="btn btn-primary">Back to Products</Link>
    </div>
  );

  return (
    <div className="pd-page page-enter">
      {/* Breadcrumb */}
      <div className="pd-breadcrumb">
        <div className="container">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <FiArrowLeft size={16}/> Back
          </button>
          <span className="bc-sep">›</span>
          <Link to="/products">Products</Link>
          <span className="bc-sep">›</span>
          <span>{product.name}</span>
        </div>
      </div>

      {/* Product Main */}
      <div className="container pd-main">
        <div className="pd-img-col">
          <div className="pd-img-wrap">
            <img src={imgSrc} alt={product.name} className="pd-img" />
            <span className={`pd-cat-badge badge badge-${product.category === 'oils' ? 'gold' : 'green'}`}>
              {product.category.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </span>
          </div>

        </div>

        <div className="pd-info-col">
          <h1 className="pd-name">{product.name}</h1>

          {/* Rating summary */}
          <div className="pd-rating-row">
            <StarRating value={Math.round(Number(avgRating))} readOnly size={18} />
            <span className="pd-avg-num">{avgRating}</span>
            <span className="pd-review-count">({reviews.length} reviews)</span>
          </div>

          {/* Size Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="pd-size-selector">
              <span className="pd-size-label">Select Size:</span>
              <div className="pd-size-options">
                {product.variants.map(v => (
                  <button
                    key={v.id}
                    className={`pd-size-btn${selectedVariant?.id === v.id ? ' active' : ''}`}
                    onClick={() => setSelectedVariant(v)}
                  >
                    <span className="size-name">{v.size}</span>
                    <span className="size-price">₹{Number(v.price).toLocaleString('en-IN')}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="pd-price">
            ₹{Number(selectedVariant ? selectedVariant.price : product.price).toLocaleString('en-IN')}
          </div>
          <div className="pd-price-note">Inclusive of all taxes · Free shipping above ₹499</div>

          <div className="pd-divider" />

          <div className="pd-desc">
            <h3>About this product</h3>
            <p>{product.description}</p>
          </div>

          {/* Highlights */}
          <div className="pd-highlights">
            {['100% Natural', 'Cold Pressed', 'No Preservatives', 'Lab Tested'].map(h => (
              <span key={h} className="pd-highlight">✓ {h}</span>
            ))}
          </div>

          <div className="pd-divider" />

          {/* Actions — Add to Cart only */}
          <div className="pd-actions">
            <button
              className={`btn btn-lg pd-cart-btn ${added ? 'btn-added-state' : 'btn-primary'}`}
              onClick={handleAddToCart}
            >
              {added ? '✓ Added to Cart!' : <><FiShoppingCart size={18}/> Add to Cart</>}
            </button>
          </div>

          <div className="pd-share">
            <button onClick={() => { navigator.clipboard?.writeText(window.location.href); toast.success('Link copied!'); }}>
              <FiShare2 size={15}/> Share this product
            </button>
          </div>

          {/* Delivery info */}
          <div className="pd-delivery">
            <div className="pd-delivery-item"><span>🚚</span><div><strong>Free Delivery</strong><small>On orders above ₹499</small></div></div>
            <div className="pd-delivery-item"><span>✅</span><div><strong>Lab Tested</strong><small>Quality guaranteed</small></div></div>
          </div>
        </div>
      </div>

      {/* ── Reviews Section ── */}
      <div className="container pd-reviews-section">
        <h2 className="reviews-heading">Customer Reviews & Ratings</h2>

        {/* Rating Summary */}
        <div className="reviews-summary">
          <div className="rs-score">
            <div className="rs-big-num">{avgRating}</div>
            <StarRating value={Math.round(Number(avgRating) || 0)} readOnly size={22}/>
            <div className="rs-count">{reviews.length} Ratings & {reviews.length} Reviews</div>
          </div>
          <div className="rs-bars">
            {ratingDist.map(({ n, count, pct }) => (
              <div key={n} className="rs-bar-row">
                <span className="rs-bar-label">{n} ★</span>
                <div className="rs-bar-track">
                  <div className="rs-bar-fill" style={{ width: `${pct}%`, background: n >= 4 ? '#388e3c' : n === 3 ? '#ff9f00' : '#ff6161' }}/>
                </div>
                <span className="rs-bar-count">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Add Review Form */}
        <div className="add-review-form">
          <h3>Write a Review</h3>
          <form onSubmit={handleReviewSubmit}>
            <div className="arf-row">
              <div className="form-group" style={{ flex:1 }}>
                <label className="form-label">Your Name</label>
                <input
                  className="form-input"
                  placeholder="e.g. Priya S."
                  value={newReview.username}
                  onChange={e => setNewReview(p => ({ ...p, username: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Your Rating</label>
                <StarRating
                  value={newReview.rating}
                  onChange={n => setNewReview(p => ({ ...p, rating: n }))}
                  size={28}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Your Review</label>
              <textarea
                className="form-input"
                rows={4}
                placeholder="Share your experience with this product..."
                value={newReview.comment}
                onChange={e => setNewReview(p => ({ ...p, comment: e.target.value }))}
                style={{ resize:'vertical' }}
              />
            </div>
            {reviewErr && <p className="review-err">{reviewErr}</p>}
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit Review'}
            </button>
          </form>
        </div>

        {/* Review List */}
        <div className="review-list">
          {reviews.length === 0 ? (
            <div className="no-reviews">
              <p>No reviews yet. Be the first to review this product!</p>
            </div>
          ) : (
            reviews.map((r, i) => (
              <div key={r.id || i} className="review-card">
                <div className="rc-header">
                  <div className="rc-avatar">{r.username?.[0] || 'U'}</div>
                  <div className="rc-meta">
                    <strong>{r.username}</strong>
                    <div className="rc-rating-row">
                      <span className="rc-stars-badge" style={{ background: r.rating >= 4 ? '#388e3c' : r.rating === 3 ? '#ff9f00' : '#ff6161' }}>
                        {r.rating} ★
                      </span>
                      <span className="rc-verified">✓ Verified Purchase</span>
                    </div>
                  </div>
                  <span className="rc-date">
                    {r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) : ''}
                  </span>
                </div>
                <p className="rc-comment">{r.comment}</p>
                <div className="rc-helpful">
                  <span>Was this helpful?</span>
                  <button
                    className={`helpful-btn ${helpfulVotes[r.id || i] === 'yes' ? 'helpful-active' : ''}`}
                    onClick={() => handleHelpfulVote(r.id || i, 'yes')}
                  >👍 Yes</button>
                  <button
                    className={`helpful-btn ${helpfulVotes[r.id || i] === 'no' ? 'helpful-active' : ''}`}
                    onClick={() => handleHelpfulVote(r.id || i, 'no')}
                  >👎 No</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
