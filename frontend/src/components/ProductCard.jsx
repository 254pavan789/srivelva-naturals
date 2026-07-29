import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiArrowRight } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import './ProductCard.css';

/* Name → image mapping for DB products with null imageUrl */
const NAME_TO_IMAGE = {
  'cold pressed sesame oil':    '/assets/products/sesame-oil.png',
  'virgin coconut oil':         '/assets/products/coconut-oil.png',
  'cold pressed groundnut oil': '/assets/products/groundnut-oil.png',
  'kumkumadi face oil':         '/assets/products/kumkumadi-face-oil.png',
  'natural turmeric soap':      '/assets/products/turmeric-soap.png',
  'brahmi hair oil':            '/assets/products/brahmi-hair-oil.png',
  'turmeric powder':            '/assets/products/turmeric-powder.png',
  'pepper powder':              '/assets/products/pepper-powder.png',
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
  'cold pressed castor oil':    '/assets/products/castor-oil.png',
  'rose powder':                '/assets/products/rose-powder.png',
  'neem face pack':             '/assets/products/neem-face-pack.png',
  'henna hair oil':             '/assets/products/henna-hair-oil.png',
  'henna hair pack':            '/assets/products/henna-hair-pack.png',
  'hibiscus powder':            '/assets/products/hibiscus-powder.png',
  'hibiscus leaf powder':       '/assets/products/hibiscus-leaf-powder.png',
  'curry masala powder':        '/assets/products/curry-masala-powder.png',
};

const resolveImage = (product) => {
  const url = product?.imageUrl;
  if (typeof url === 'string' && url.trim() !== '') return url.trim();
  const byName = NAME_TO_IMAGE[product?.name?.toLowerCase?.() ?? ''];
  if (byName) return byName;
  return '/assets/products/default-product.svg';
};

function playCartSound() {
  try {
    const ctx  = new AudioContext();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.28);
  } catch (_) {}
}

export default function ProductCard({ product }) {
  const navigate      = useNavigate();
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const imgSrc      = resolveImage(product);
  const stockQty    = product?.stockQuantity ?? 10;
  const isOutOfStock = stockQty === 0;
  const isLowStock   = stockQty > 0 && stockQty <= 5;

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (added || isOutOfStock) return;
    addToCart(product);
    setAdded(true);
    playCartSound();
    toast.success(`${product.name} added to cart!`);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <article
      className="product-card"
      onClick={() => navigate(`/product/${product.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/product/${product.id}`)}
      aria-label={`View ${product.name}`}
    >
      {/* ── Image ── */}
      <div className="pc-image-wrap">
        <img
          src={imgSrc}
          alt={product.name}
          className={`pc-image ${isOutOfStock ? 'pc-image--oos' : ''}`}
          loading="lazy"
          draggable={false}
          onError={(e) => { e.target.onerror = null; e.target.src = '/assets/products/default-product.png'; }}
        />

        {/* Out of Stock badge over image */}
        {isOutOfStock && (
          <span className="pc-oos-badge">Out of Stock</span>
        )}

        {/* Category pill */}
        {!isOutOfStock && (
          <span className={`pc-category-pill ${product.category?.toLowerCase() === 'oils' ? 'pill-gold' : 'pill-green'}`}>
            {product.category}
          </span>
        )}

        {/* Hover overlay */}
        {!isOutOfStock && (
          <div className="pc-overlay" aria-hidden="true">
            <span className="pc-overlay-cta">
              <FiArrowRight size={14} />
              View Details
            </span>
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div className="pc-body">
        <h3 className="pc-name">{product.name}</h3>

        <p className="pc-desc">
          {product.description?.substring(0, 72)}…
        </p>

        {/* Low stock warning */}
        {isLowStock && (
          <p className="pc-low-stock">Only {stockQty} left</p>
        )}

        <div className="pc-footer">
          {product.variants && product.variants.length > 1
            ? <span className="pc-price" style={{fontFamily:'var(--font-body)'}}>
                ₹{Number(product.variants[0].price).toLocaleString('en-IN')}
                <span style={{color:'var(--bark)',fontSize:'0.8em',margin:'0 3px'}}>–</span>
                ₹{Number(product.variants[product.variants.length-1].price).toLocaleString('en-IN')}
              </span>
            : <span className="pc-price" style={{fontFamily:'var(--font-body)'}}>
                ₹{Number(product.variants?.[0]?.price ?? product.price).toLocaleString('en-IN')}
              </span>
          }

          {isOutOfStock ? (
            <button
              className="pc-cart-btn pc-cart-btn--unavailable"
              disabled
              aria-label="Out of stock"
              title="Unavailable"
              onClick={e => e.stopPropagation()}
            >
              Unavailable
            </button>
          ) : (
            <button
              className={`pc-cart-btn ripple-host ${added ? 'pc-cart-btn--added' : ''}`}
              onClick={handleAddToCart}
              aria-label={added ? 'Added to cart' : `Add ${product.name} to cart`}
              title={added ? 'Added!' : 'Add to Cart'}
            >
              {added
                ? <><span className="pc-btn-check">✓</span> Added</>
                : <><FiShoppingCart size={14} /> Add to Cart</>
              }
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
