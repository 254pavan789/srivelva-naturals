import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiPlus, FiMinus, FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import './Cart.css';

const CATEGORY_IMAGES = {
  Oils: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=200&q=70',
  'Skin Care': 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=200&q=70',
  'Hair Care': 'https://images.unsplash.com/photo-1519735777090-ec97162dc266?w=200&q=70',
};

export default function Cart() {
  const { items, total, updateQty, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  const deliveryCharge = total > 499 ? 0 : 49;
  const grandTotal = total + deliveryCharge;

  if (items.length === 0) {
    return (
      <div className="cart-empty-page page-enter">
        <div className="cart-empty-inner">
          <div className="cart-empty-icon">
            <FiShoppingBag size={56} />
          </div>
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added any products yet. Explore our natural collection.</p>
          <Link to="/products" className="btn btn-primary btn-lg">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page page-enter">
      <div className="cart-hero">
        <div className="container">
          <h1>Shopping Cart</h1>
          <p>{items.length} item{items.length > 1 ? 's' : ''} in your cart</p>
        </div>
      </div>

      <div className="container cart-layout">
        {/* Items */}
        <div className="cart-items-col">
          <div className="cart-items-header">
            <span>Product</span>
            <span>Price</span>
            <span>Quantity</span>
            <span>Total</span>
          </div>

          {items.map(item => {
            const imgSrc = item.imageUrl || CATEGORY_IMAGES[item.category] || CATEGORY_IMAGES['Oils'];
            return (
              <div key={item.id} className="cart-item">
                <div className="ci-product">
                  <img src={imgSrc} alt={item.displayName || item.name} className="ci-img" />
                  <div className="ci-info">
                    <h3>
                      {item.displayName || item.name}
                      {item.size && <span style={{fontSize:'0.7rem',background:'var(--mint)',color:'var(--forest)',padding:'2px 8px',borderRadius:'20px',marginLeft:'6px',fontFamily:'var(--font-body)',fontWeight:600,verticalAlign:'middle'}}>{item.size}</span>}
                    </h3>
                    <span className="badge badge-green">{item.category}</span>
                  </div>
                </div>
                <div className="ci-price">₹{item.price?.toLocaleString('en-IN')}</div>
                <div className="ci-qty">
                  <button className="qty-btn" onClick={() => updateQty(item.id, item.variantId, item.quantity - 1)} disabled={item.quantity <= 1}>
                    <FiMinus size={14} />
                  </button>
                  <span className="qty-val">{item.quantity}</span>
                  <button className="qty-btn" onClick={() => updateQty(item.id, item.variantId, item.quantity + 1)}>
                    <FiPlus size={14} />
                  </button>
                </div>
                <div className="ci-total">₹{(item.price * item.quantity).toLocaleString('en-IN')}</div>
                <button className="ci-remove" onClick={() => removeFromCart(item.id, item.variantId)} aria-label="Remove">
                  <FiTrash2 size={16} />
                </button>
              </div>
            );
          })}

          <div className="cart-actions">
            <Link to="/products" className="btn btn-outline">← Continue Shopping</Link>
            <button className="btn btn-outline" style={{ color:'#c0392b', borderColor:'#c0392b' }} onClick={clearCart}>
              Clear Cart
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="cart-summary-col">
          <div className="cart-summary">
            <h2>Order Summary</h2>
            <div className="cs-row">
              <span>Subtotal ({items.length} items)</span>
              <span>₹{total.toLocaleString('en-IN')}</span>
            </div>
            <div className="cs-row">
              <span>Delivery</span>
              <span className={deliveryCharge === 0 ? 'free-tag' : ''}>
                {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
              </span>
            </div>
            {deliveryCharge > 0 && (
              <div className="cs-delivery-note">
                Add ₹{(499 - total).toLocaleString('en-IN')} more for free delivery
              </div>
            )}
            <div className="cs-divider" />
            <div className="cs-row cs-total">
              <span>Total</span>
              <span>₹{grandTotal.toLocaleString('en-IN')}</span>
            </div>
            <button className="btn btn-primary btn-lg cs-checkout-btn" onClick={() => navigate('/checkout')}>
              Proceed to Checkout <FiArrowRight size={16}/>
            </button>
            <div className="cs-safe">
              🔒 Secure checkout · Pay on delivery available
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
