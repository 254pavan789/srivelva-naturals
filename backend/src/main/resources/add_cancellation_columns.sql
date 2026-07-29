-- ============================================================
-- add_cancellation_columns.sql
-- Run ONCE on your existing database to add cancellation fields.
-- Spring Boot (JPA ddl-auto=update) may add these automatically,
-- but run this manually if it doesn't.
--
-- Usage:
--   mysql -u root -p srivelva < add_cancellation_columns.sql
-- ============================================================

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS cancellation_reason TEXT         NULL,
  ADD COLUMN IF NOT EXISTS cancelled_at         DATETIME     NULL,
  ADD COLUMN IF NOT EXISTS refund_status        VARCHAR(30)  NOT NULL DEFAULT 'NOT_APPLICABLE';

-- Backfill: already-cancelled orders (if any) get PENDING refund if they had payment
UPDATE orders
SET refund_status = CASE
    WHEN payment_id IS NOT NULL AND payment_id != '' THEN 'PENDING'
    ELSE 'NOT_APPLICABLE'
  END
WHERE status = 'CANCELLED' AND refund_status = 'NOT_APPLICABLE';

SELECT 'Migration complete. New columns added to orders table.' AS result;
DESCRIBE orders;
