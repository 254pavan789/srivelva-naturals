import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts } from '../utils/api';
import { getStaticProducts } from '../utils/staticProducts';
import ProductCard from '../components/ProductCard';
import ProductSkeleton from '../components/ProductSkeleton';
import EmptyState from '../components/EmptyState';
import './Products.css';

const CATEGORIES = [
  { key: 'All',       label: 'All'       },
  { key: 'oils',      label: 'Oils'      },
  { key: 'skin care', label: 'Skin Care' },
  { key: 'hair care', label: 'Hair Care' },
  { key: 'spices',    label: 'Spices'    },
];

const normalizeCategory = (raw) => {
  if (!raw || raw === 'All') return 'All';
  const lower = raw.trim().toLowerCase();
  const found = CATEGORIES.find(c => c.key === lower);
  return found ? found.key : lower;
};

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  const catParam = searchParams.get('category') || 'All';
  const [active, setActive] = useState(() => normalizeCategory(catParam));

  useEffect(() => {
    setLoading(true);
    const cat = active === 'All' ? null : active;

    getProducts(cat)
      .then(r => {
        const list = r?.data?.data;
        if (Array.isArray(list) && list.length > 0) {
          setProducts(list.map(p => ({
            ...p,
            category: p.category?.toLowerCase?.() ?? p.category,
          })));
          setUsingFallback(false);
        } else {
          // API returned empty — use static fallback
          setProducts(getStaticProducts(cat));
          setUsingFallback(true);
        }
      })
      .catch(() => {
        // Backend unreachable — silently use static product data
        setProducts(getStaticProducts(cat));
        setUsingFallback(true);
      })
      .finally(() => setLoading(false));
  }, [active]);

  const handleCat = (key) => {
    setActive(key);
    if (key === 'All') searchParams.delete('category');
    else searchParams.set('category', key);
    setSearchParams(searchParams);
  };

  return (
    <div className="products-page page-enter">
      <div className="products-hero">
        <div className="container">
          <span className="label">Our Collection</span>
          <h1>Natural Products</h1>
          <p>Pure, chemical-free products crafted with traditional wisdom and cold-pressed goodness.</p>
        </div>
      </div>

      <div className="products-body">
        <div className="container">

          <div className="filter-bar">
            <span className="filter-label">Filter by</span>
            <div className="filter-tabs">
              {CATEGORIES.map(({ key, label }) => (
                <button
                  key={key}
                  className={`filter-tab ${active === key ? 'active' : ''}`}
                  onClick={() => handleCat(key)}
                >
                  {label}
                </button>
              ))}
            </div>
            {!loading && (
              <span className="product-count">
                {products.length} product{products.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {loading ? (
            <ProductSkeleton count={6} />
          ) : products.length === 0 ? (
            <EmptyState
              title="No products found"
              message="We couldn't find anything in this category right now. Try a different filter."
              ctaLabel="View All Products"
              ctaTo="/products"
            />
          ) : (
            <div className="products-grid">
              {products.map((p, i) => (
                <div key={p.id} style={{ animationDelay: `${Math.min(i, 7) * 0.09}s` }}>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
