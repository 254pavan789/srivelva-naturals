import './ProductSkeleton.css';

/* One shimmer card that mirrors the shape of ProductCard */
function SkeletonCard() {
  return (
    <div className="skeleton-card" aria-hidden="true">
      <div className="sk-image shimmer" />
      <div className="sk-body">
        <div className="sk-pill shimmer" />
        <div className="sk-line sk-line--title shimmer" />
        <div className="sk-line sk-line--sub shimmer" />
        <div className="sk-line sk-line--sub2 shimmer" />
        <div className="sk-footer">
          <div className="sk-price shimmer" />
          <div className="sk-btn shimmer" />
        </div>
      </div>
    </div>
  );
}

/* Renders `count` skeleton cards in the same grid as the real product grid */
export default function ProductSkeleton({ count = 6 }) {
  return (
    <div className="skeleton-grid" role="status" aria-label="Loading products…">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
