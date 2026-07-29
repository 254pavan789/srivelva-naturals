import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { FiCheckCircle, FiShoppingBag, FiPhone, FiXCircle } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { cancelOrder } from '../utils/api';
import CancelOrderModal from '../components/CancelOrderModal';
import './OrderSuccess.css';

// Statuses that allow cancellation
const CANCELLABLE = new Set(['PENDING', 'CONFIRMED', 'PROCESSING']);

export default function OrderSuccess() {
  const { state } = useLocation();
  const name      = state?.name      || 'Customer';
  const total     = state?.total     || 0;
  const orderId   = state?.orderId   || null;   // display: 'SVN50'
  const numericId = state?.numericId || null;   // API: 50 (Long)
  const payMethod = state?.payMethod || 'Cash on Delivery';

  // Track order status locally after cancellation
  const [orderStatus, setOrderStatus] = useState(state?.status || 'PENDING');
  const [showModal,   setShowModal]   = useState(false);
  const [cancelling,  setCancelling]  = useState(false);

  const canCancel = numericId && CANCELLABLE.has(orderStatus?.toUpperCase?.() ?? '');

  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 5);
  const deliveryStr = deliveryDate.toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  const handleCancelConfirm = async (reason) => {
    setCancelling(true);
    try {
      await cancelOrder(numericId, reason);
      setOrderStatus('CANCELLED');
      setShowModal(false);
      toast.success('Your order has been cancelled successfully.');
    } catch (err) {
      const msg = err?.response?.data?.message
        || err?.response?.data?.error
        || 'Could not cancel order. Please contact us.';
      toast.error(msg);
    } finally {
      setCancelling(false);
    }
  };

  const isCancelled = orderStatus?.toUpperCase() === 'CANCELLED';

  return (
    <div className="success-page page-enter">
      <div className="success-card">

        {/* Icon */}
        <div className={`success-icon ${isCancelled ? 'cancelled' : ''}`}>
          {isCancelled
            ? <FiXCircle size={60}/>
            : <FiCheckCircle size={60}/>
          }
        </div>

        {/* Heading */}
        {isCancelled ? (
          <>
            <h1>Order Cancelled</h1>
            <p className="success-sub">
              Your order <strong>#{orderId}</strong> has been cancelled successfully.
              {payMethod !== 'Cash on Delivery' && (
                <> A refund will be initiated within 5–7 business days.</>
              )}
            </p>
          </>
        ) : (
          <>
            <h1>Order Placed!</h1>
            <p className="success-sub">
              Thank you, <strong>{name}</strong>! Your order has been received
              and our team has been notified.
            </p>
          </>
        )}

        {/* Details */}
        <div className="success-details">
          <div className="sd-row">
            <span>Order ID</span>
            <strong>#{orderId || '—'}</strong>
          </div>
          <div className="sd-row">
            <span>Amount</span>
            <strong>₹{total?.toLocaleString?.('en-IN') ?? total}</strong>
          </div>
          <div className="sd-row">
            <span>Payment</span>
            <strong>{payMethod}</strong>
          </div>
          {!isCancelled && (
            <div className="sd-row">
              <span>Est. Delivery</span>
              <strong>{deliveryStr}</strong>
            </div>
          )}
          <div className="sd-row">
            <span>Status</span>
            <strong className={`status-badge status-${orderStatus?.toLowerCase()}`}>
              {orderStatus || 'PENDING'}
            </strong>
          </div>
        </div>

        {/* Info note */}
        {!isCancelled && (
          <p className="success-note">
            Our team will confirm your order shortly. If you have any questions,
            please call us or reach us through the contact page.
          </p>
        )}

        {/* Actions */}
        <div className="success-actions">
          <Link to="/products" className="btn btn-primary btn-lg">
            <FiShoppingBag size={16}/> Continue Shopping
          </Link>
          <Link to="/contact" className="btn btn-outline btn-lg">
            <FiPhone size={16}/> Contact Us
          </Link>
        </div>

        {/* Cancel Order button */}
        {canCancel && !isCancelled && (
          <div className="cancel-order-section">
            <button
              className="cancel-order-btn"
              onClick={() => setShowModal(true)}
            >
              <FiXCircle size={15}/> Cancel This Order
            </button>
            <p className="cancel-note">
              You can cancel orders that are Pending, Confirmed or Processing.
              Once shipped, cancellation is not possible.
            </p>
          </div>
        )}

      </div>

      {/* Cancel confirmation modal */}
      {showModal && (
        <CancelOrderModal
          orderId={orderId}
          onConfirm={handleCancelConfirm}
          onClose={() => !cancelling && setShowModal(false)}
          loading={cancelling}
        />
      )}
    </div>
  );
}
