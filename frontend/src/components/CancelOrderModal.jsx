import { useState } from 'react';
import './CancelOrderModal.css';

/**
 * CancelOrderModal
 * Shows a confirmation modal with optional reason textarea.
 * Props:
 *   orderId   — order number to display
 *   onConfirm(reason) — called with reason string when customer confirms
 *   onClose()          — called when customer dismisses
 *   loading            — true while API call is in progress
 */
export default function CancelOrderModal({ orderId, onConfirm, onClose, loading }) {
  const [reason, setReason] = useState('');

  const handleConfirm = () => onConfirm(reason.trim());

  return (
    <div className="com-overlay" onClick={onClose}>
      <div className="com-modal" onClick={e => e.stopPropagation()}>

        {/* Icon */}
        <div className="com-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        </div>

        <h2 className="com-title">Cancel Order #{orderId}?</h2>
        <p className="com-desc">
          This action cannot be undone. Your order will be marked as cancelled.
          {' '}If you paid online, a refund will be initiated within 5–7 business days.
        </p>

        {/* Reason textarea */}
        <div className="com-field">
          <label htmlFor="cancel-reason">Reason for cancellation <span>(optional)</span></label>
          <textarea
            id="cancel-reason"
            className="com-textarea"
            rows={3}
            maxLength={500}
            placeholder="e.g. Ordered by mistake, found a better price, changed my mind…"
            value={reason}
            onChange={e => setReason(e.target.value)}
            disabled={loading}
          />
          <span className="com-char">{reason.length}/500</span>
        </div>

        {/* Actions */}
        <div className="com-actions">
          <button className="com-btn-cancel" onClick={onClose} disabled={loading}>
            Keep Order
          </button>
          <button className="com-btn-confirm" onClick={handleConfirm} disabled={loading}>
            {loading ? (
              <span className="com-spinner"/>
            ) : (
              'Yes, Cancel Order'
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
