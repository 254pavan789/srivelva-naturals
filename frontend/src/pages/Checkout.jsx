import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiCheck, FiSmartphone } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import { createOrder } from '../utils/api';
import './Checkout.css';

// ── UPI details already configured in the project ─────────────────────────
const UPI_ID   = 'vijaypriya9695@okhdfcbank';
const UPI_NAME = 'Sri Velva Naturals';

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();

  // Step 1 = fill details, Step 2 = pay via UPI, Step 3 = confirm payment done
  const [step, setStep]         = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: '', phone: '', email: '',
    address: '', city: '', pincode: '', notes: '',
  });
  const [errors, setErrors] = useState({});

  const deliveryCharge = total > 499 ? 0 : 49;
  const grandTotal     = total + deliveryCharge;

  // ── Build UPI deep link ────────────────────────────────────────────────
  const buildUpiLink = () => {
    const params = new URLSearchParams({
      pa:  UPI_ID,
      pn:  UPI_NAME,
      am:  grandTotal.toFixed(2),
      cu:  'INR',
      tn:  `Order from Sri Velva Naturals`,
    });
    return `upi://pay?${params.toString()}`;
  };

  // ── Validation ─────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.name.trim())
      e.name    = 'Full name is required';
    if (!form.phone.trim() || !/^[6-9]\d{9}$/.test(form.phone.trim()))
      e.phone   = 'Enter a valid 10-digit Indian mobile number';
    if (!form.email.trim())
      e.email   = 'Email address is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      e.email   = 'Enter a valid email address';
    if (!form.address.trim())
      e.address = 'Delivery address is required';
    if (!form.city.trim())
      e.city    = 'City is required';
    if (!form.pincode.trim() || !/^\d{6}$/.test(form.pincode.trim()))
      e.pincode = 'Enter a valid 6-digit pincode';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
  };

  // ── Step 1 → Step 2: validate form, then show Pay Now ─────────────────
  const handleProceedToPayment = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setStep(2);
    // Scroll to top so user sees QR
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Step 2: open UPI app ───────────────────────────────────────────────
  const handlePayNow = () => {
    const upiLink = buildUpiLink();
    window.location.href = upiLink;
    // After a brief delay, advance to step 3 so the "I have paid" button
    // is ready when the user returns from their UPI app
    setTimeout(() => setStep(3), 1500);
  };

  // ── Step 3: place order after user confirms payment ────────────────────
  const handleOrderConfirm = async () => {
    if (items.length === 0) { toast.error('Your cart is empty!'); return; }
    setSubmitting(true);
    try {
      const fullAddress = `${form.address.trim()}, ${form.city.trim()} - ${form.pincode.trim()}`;
      const orderData = {
        customerName: form.name.trim(),
        phone:        form.phone.trim(),
        email:        form.email.trim(),
        address:      fullAddress,
        notes:        form.notes.trim(),
        totalAmount:  grandTotal,
        items: items.map(i => ({
          productId:   i.id,
          variantId:   i.variantId ?? null,
          productName: i.displayName || i.name,
          size:        i.size ?? null,
          quantity:    i.quantity,
          price:       i.price,
        })),
      };

      const res     = await createOrder(orderData);
      const saved   = res?.data?.data?.id ?? res?.data?.id;
      const orderId = saved ? `SVN${saved}` : `SVN${Date.now().toString().slice(-6)}`;

      toast.success('Order placed! We will verify your payment and confirm shortly.');
      clearCart();
      navigate('/order-success', {
        state: {
          name:      form.name.trim(),
          total:     grandTotal,
          orderId,
          payMethod: 'UPI / QR Payment',
          numericId: saved ?? null,
        },
      });
    } catch (err) {
      console.error('[Checkout] Order error:', err);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Empty cart guard ────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="checkout-empty page-enter">
        <h2>Nothing to checkout</h2>
        <p>Add some products to your cart first.</p>
        <Link to="/products" className="btn btn-primary">Shop Now</Link>
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="checkout-page page-enter">
      <div className="checkout-hero">
        <div className="container">
          {step === 1 ? (
            <Link to="/cart" className="back-btn"><FiArrowLeft size={16}/> Back to Cart</Link>
          ) : (
            <button className="back-btn" onClick={() => setStep(step - 1)}>
              <FiArrowLeft size={16}/> Back
            </button>
          )}
          <h1>Checkout</h1>
          {/* Step indicator */}
          <div className="co-steps-bar">
            <span className={`co-step ${step >= 1 ? 'active' : ''}`}>1. Delivery</span>
            <span className="co-step-sep">›</span>
            <span className={`co-step ${step >= 2 ? 'active' : ''}`}>2. Payment</span>
            <span className="co-step-sep">›</span>
            <span className={`co-step ${step >= 3 ? 'active' : ''}`}>3. Confirm</span>
          </div>
        </div>
      </div>

      <div className="container checkout-layout">

        {/* ── LEFT COLUMN ── */}
        <div className="checkout-form-col">

          {/* ════ STEP 1 — Delivery Details ════ */}
          {step === 1 && (
            <form onSubmit={handleProceedToPayment} noValidate>
              <div className="co-section">
                <h2 className="co-section-title">Delivery Information</h2>

                <div className="co-grid-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="co-name">Full Name *</label>
                    <input
                      id="co-name" className={`form-input ${errors.name ? 'input-err' : ''}`}
                      name="name" type="text" placeholder="Priya Sharma"
                      autoComplete="name" value={form.name} onChange={handleChange}
                    />
                    {errors.name && <span className="field-err">{errors.name}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="co-phone">Phone Number *</label>
                    <input
                      id="co-phone" className={`form-input ${errors.phone ? 'input-err' : ''}`}
                      name="phone" type="tel" placeholder="9876543210"
                      autoComplete="tel-national" maxLength={10}
                      value={form.phone} onChange={handleChange}
                    />
                    {errors.phone && <span className="field-err">{errors.phone}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="co-email">Email Address *</label>
                  <input
                    id="co-email" className={`form-input ${errors.email ? 'input-err' : ''}`}
                    name="email" type="email" placeholder="your@email.com"
                    autoComplete="email" value={form.email} onChange={handleChange}
                  />
                  {errors.email && <span className="field-err">{errors.email}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="co-address">Delivery Address *</label>
                  <textarea
                    id="co-address" className={`form-input ${errors.address ? 'input-err' : ''}`}
                    name="address" rows={3} placeholder="House No., Street, Area / Landmark"
                    autoComplete="street-address" value={form.address} onChange={handleChange}
                    style={{ resize: 'vertical' }}
                  />
                  {errors.address && <span className="field-err">{errors.address}</span>}
                </div>

                <div className="co-grid-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="co-city">City *</label>
                    <input
                      id="co-city" className={`form-input ${errors.city ? 'input-err' : ''}`}
                      name="city" type="text" placeholder="Chennai"
                      autoComplete="address-level2" value={form.city} onChange={handleChange}
                    />
                    {errors.city && <span className="field-err">{errors.city}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="co-pincode">Pincode *</label>
                    <input
                      id="co-pincode" className={`form-input ${errors.pincode ? 'input-err' : ''}`}
                      name="pincode" type="text" inputMode="numeric" placeholder="600001"
                      autoComplete="postal-code" maxLength={6}
                      value={form.pincode} onChange={handleChange}
                    />
                    {errors.pincode && <span className="field-err">{errors.pincode}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="co-notes">Special Instructions (optional)</label>
                  <textarea
                    id="co-notes" className="form-input" name="notes" rows={2}
                    placeholder="Any specific delivery instructions…"
                    value={form.notes} onChange={handleChange}
                    style={{ resize: 'vertical' }}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-lg co-submit-btn">
                Proceed to Payment →
              </button>
            </form>
          )}

          {/* ════ STEP 2 — QR / Pay Now ════ */}
          {(step === 2 || step === 3) && (
            <div className="co-section">
              <h2 className="co-section-title">
                {step === 2 ? 'Complete UPI Payment' : 'Confirm Your Payment'}
              </h2>

              <div className="qr-payment-box">
                {/* QR Image */}
                <div className="qr-image-wrap">
                  <img
                    src="/assets/payment-qr.jpeg"
                    alt="Sri Velva Naturals UPI Payment QR Code"
                    className="qr-image"
                  />
                  <p className="qr-amount-label">Pay ₹{grandTotal}</p>
                  <p className="qr-upi-id">UPI ID: {UPI_ID}</p>
                </div>

                {/* Instructions */}
                <div className="qr-instructions">
                  {step === 2 && (
                    <>
                      <p className="qr-inst-title">How to pay:</p>
                      <ol className="qr-steps">
                        <li>Click <strong>"Pay Now"</strong> below — your UPI app will open automatically</li>
                        <li>Complete ₹{grandTotal} payment in your app</li>
                        <li>Return to this page and click <strong>"I Have Completed Payment"</strong></li>
                      </ol>
                      <p className="qr-alt-text">Or scan the QR code with any UPI app (GPay, PhonePe, Paytm, etc.)</p>

                      <button
                        className="btn-pay-now"
                        onClick={handlePayNow}
                        type="button"
                      >
                        <FiSmartphone size={20}/>
                        Pay Now — ₹{grandTotal}
                      </button>

                      <button
                        className="btn-paid-already"
                        onClick={() => setStep(3)}
                        type="button"
                      >
                        I Have Completed Payment
                      </button>
                    </>
                  )}

                  {step === 3 && (
                    <div className="confirm-payment-box">
                      <div className="confirm-checkmark">✅</div>
                      <p className="confirm-title">Payment Done?</p>
                      <p className="confirm-sub">
                        Once you click <strong>"Place Order"</strong>, your order will be created.
                        Our team will verify your payment and confirm the order shortly.
                      </p>

                      <button
                        className="btn btn-primary btn-lg co-submit-btn"
                        onClick={handleOrderConfirm}
                        disabled={submitting}
                        type="button"
                      >
                        {submitting
                          ? <><span className="co-spinner"/> Placing Order…</>
                          : <><FiCheck size={18}/> Place Order — ₹{grandTotal}</>
                        }
                      </button>

                      <button
                        className="btn-go-back-pay"
                        onClick={() => setStep(2)}
                        type="button"
                        disabled={submitting}
                      >
                        ← Go Back to Payment
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* ── RIGHT COLUMN — Order Summary ── */}
        <aside className="checkout-summary-col">
          <div className="co-summary">
            <h3>Order Summary</h3>
            <div className="co-items">
              {items.map(item => (
                <div key={`${item.id}-${item.variantId ?? ''}`} className="co-item">
                  <div className="co-item-info">
                    <span className="co-item-name">{item.displayName || item.name}</span>
                    <span className="co-item-qty">× {item.quantity}</span>
                  </div>
                  <span className="co-item-price">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
            <div className="co-summary-divider"/>
            <div className="co-summary-row">
              <span>Subtotal</span><span>₹{total.toLocaleString('en-IN')}</span>
            </div>
            <div className="co-summary-row">
              <span>Delivery</span>
              <span className={deliveryCharge === 0 ? 'free-tag' : ''}>
                {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
              </span>
            </div>
            {deliveryCharge === 0 && (
              <p className="co-free-del-note">🎉 Free delivery on orders above ₹499</p>
            )}
            <div className="co-summary-divider"/>
            <div className="co-summary-row co-grand-total">
              <span>Total</span><span>₹{grandTotal.toLocaleString('en-IN')}</span>
            </div>

            {/* Delivery info — only show once form is filled */}
            {step > 1 && form.name && (
              <>
                <div className="co-summary-divider"/>
                <div className="co-delivery-info">
                  <p className="co-delivery-label">Delivering to:</p>
                  <p className="co-delivery-address">
                    {form.name}<br/>
                    {form.address}, {form.city} – {form.pincode}<br/>
                    📞 {form.phone}
                  </p>
                </div>
              </>
            )}

            <div className="co-secure">🔒 Secure checkout · Your data is safe</div>
          </div>
        </aside>

      </div>
    </div>
  );
}
