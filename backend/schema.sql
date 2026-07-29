-- ============================================================
--  Sri Velva Naturals — MySQL Schema
--  Run once to create database + tables.
--  Hibernate ddl-auto=update keeps schema in sync after that.
-- ============================================================

-- ── 1. Database ───────────────────────────────────────────────
CREATE DATABASE IF NOT EXISTS srivelva
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE srivelva;

-- ── 2. products ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
    id            BIGINT        NOT NULL AUTO_INCREMENT,
    name          VARCHAR(200)  NOT NULL,
    price         DOUBLE        NOT NULL,
    description   TEXT          NOT NULL,
    image_url     VARCHAR(500)  NULL,
    category      VARCHAR(100)  NOT NULL,
    stock_quantity INT           NOT NULL DEFAULT 10,
    created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_product_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Migration: add stock_quantity if products table already exists
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS stock_quantity INT NOT NULL DEFAULT 10;

-- ── 3. orders ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
    id                 BIGINT        NOT NULL AUTO_INCREMENT,
    customer_name      VARCHAR(200)  NOT NULL,
    phone              VARCHAR(15)   NOT NULL,
    email              VARCHAR(200)  NULL,
    address            TEXT          NOT NULL,
    notes              TEXT          NULL,
    total_amount       DOUBLE        NOT NULL,
    items_json         TEXT          NULL       COMMENT 'Cart items as JSON array',
    status             VARCHAR(50)   NOT NULL   DEFAULT 'PENDING',
    payment_status     VARCHAR(50)   NOT NULL   DEFAULT 'PENDING_VERIFICATION'
                                                COMMENT 'PENDING_VERIFICATION | VERIFIED | REJECTED',
    cancellation_reason TEXT         NULL,
    cancelled_at       DATETIME      NULL,
    refund_status      VARCHAR(30)   NULL       DEFAULT 'NOT_APPLICABLE',
    created_at         DATETIME      NOT NULL   DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_order_created (created_at),
    INDEX idx_order_status  (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Razorpay columns removed — payments via QR/UPI

-- ── 4. reviews ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
    id          BIGINT        NOT NULL AUTO_INCREMENT,
    product_id  BIGINT        NOT NULL,
    username    VARCHAR(150)  NOT NULL,
    rating      INT           NOT NULL  CHECK (rating BETWEEN 1 AND 5),
    comment     TEXT          NOT NULL,
    created_at  DATETIME      NOT NULL  DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_review_product (product_id),
    INDEX idx_review_created (created_at),
    CONSTRAINT fk_review_product
        FOREIGN KEY (product_id) REFERENCES products (id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 5. settings ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS settings (
    id                BIGINT        NOT NULL AUTO_INCREMENT,
    whatsapp_number   VARCHAR(20)   NULL,
    email             VARCHAR(200)  NULL,
    updated_at        DATETIME      NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
--  SEED DATA (safe to run multiple times)
-- ============================================================

INSERT IGNORE INTO settings (id, whatsapp_number, email)
VALUES (1, '9944268288', 'info@srivelvanaturals.com');

INSERT INTO products (name, price, description, image_url, category)
SELECT 'Cold Pressed Sesame Oil', 299.00,
  'Pure traditional sesame oil cold pressed for maximum nutrition. Rich in antioxidants and vitamin E. Perfect for cooking and body massage. Sourced from the finest sesame farms of Tamil Nadu.',
  NULL, 'Oils'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Cold Pressed Sesame Oil');

INSERT INTO products (name, price, description, image_url, category)
SELECT 'Virgin Coconut Oil', 349.00,
  'Extra virgin coconut oil extracted without heat. Great for hair and skin nourishment. Naturally fragrant and pure. Sourced from coastal Tamil Nadu farms.',
  NULL, 'Oils'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Virgin Coconut Oil');

INSERT INTO products (name, price, description, image_url, category)
SELECT 'Cold Pressed Groundnut Oil', 249.00,
  'Farm-fresh groundnut oil cold pressed the traditional way. Rich, aromatic and perfect for South Indian cooking. No refining, no bleaching.',
  NULL, 'Oils'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Cold Pressed Groundnut Oil');

INSERT INTO products (name, price, description, image_url, category)
SELECT 'Kumkumadi Face Oil', 699.00,
  'Ancient ayurvedic blend of 16 natural oils for radiant, glowing skin. Reduces dark spots and improves complexion. Contains saffron, sandalwood and lotus.',
  NULL, 'Skin Care'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Kumkumadi Face Oil');

INSERT INTO products (name, price, description, image_url, category)
SELECT 'Natural Turmeric Soap', 149.00,
  'Handcrafted soap with raw turmeric and coconut oil. Anti-bacterial and brightening for clear skin. No SLS, no parabens.',
  NULL, 'Skin Care'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Natural Turmeric Soap');

INSERT INTO products (name, price, description, image_url, category)
SELECT 'Brahmi Hair Oil', 399.00,
  'Traditional herb-infused oil for scalp health, hair growth and strength. Made by slow-infusing brahmi, amla, hibiscus, bhringraj and neem in a coconut oil base.',
  NULL, 'Hair Care'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Brahmi Hair Oil');

INSERT INTO products (name, price, description, image_url, category)
SELECT 'Neem Hair Mask', 249.00,
  'Deep conditioning hair mask with neem, fenugreek and coconut. For dandruff-free, shiny hair. Apply to scalp and lengths, leave 30 minutes.',
  NULL, 'Hair Care'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Neem Hair Mask');

-- ── MIGRATION: normalize ALL categories to lowercase ──────────────
-- Fixes any legacy Title Case rows: 'Spices'→'spices', 'Oils'→'oils', etc.
-- Safe to run multiple times — LOWER(already_lowercase) is a no-op.
UPDATE products SET category = LOWER(category) WHERE category != LOWER(category);

-- ── IMAGE URL UPDATES (spices) ────────────────────────────────
UPDATE products SET image_url='/assets/products/turmeric-powder.svg'  WHERE name='Turmeric Powder';
UPDATE products SET image_url='/assets/products/pepper-powder.svg'    WHERE name='Pepper Powder';
UPDATE products SET image_url='/assets/products/sambar-powder.svg'    WHERE name='Sambar Powder';
UPDATE products SET image_url='/assets/products/garam-masala.svg'     WHERE name='Garam Masala';
UPDATE products SET image_url='/assets/products/coriander-powder.svg' WHERE name='Coriander Powder';

INSERT INTO products (name, price, description, image_url, category)
SELECT 'Turmeric Powder', 79.00,
  'High-curcumin turmeric sourced from Tamil Nadu farms, stone-ground to preserve aroma and medicinal properties. The golden spice for cooking, wellness, and skin care. No additives, no fillers — pure farm-to-kitchen quality.',
  '/assets/products/turmeric-powder.svg', 'spices'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Turmeric Powder');

INSERT INTO products (name, price, description, image_url, category)
SELECT 'Pepper Powder', 149.00,
  'Bold, pungent black pepper sourced from the Western Ghats and ground to order. Essential for South Indian rasam, curries, and marinades. No blends, no fillers — 100% pure black pepper.',
  '/assets/products/pepper-powder.svg', 'spices'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Pepper Powder');

INSERT INTO products (name, price, description, image_url, category)
SELECT 'Sambar Powder', 99.00,
  'Authentic South Indian sambar masala blended from sun-dried chillies, coriander, cumin, pepper, and curry leaves. Slow-roasted for deep flavour. The secret behind every perfect pot of sambar.',
  '/assets/products/sambar-powder.svg', 'spices'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Sambar Powder');

INSERT INTO products (name, price, description, image_url, category)
SELECT 'Garam Masala', 119.00,
  'A hand-blended mix of whole spices — cardamom, cloves, cinnamon, pepper, and more — ground fresh. Rich, complex, and deeply aromatic. Elevates every dish it touches.',
  '/assets/products/garam-masala.svg', 'spices'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Garam Masala');

INSERT INTO products (name, price, description, image_url, category)
SELECT 'Coriander Powder', 75.00,
  'Fresh coriander seeds slow-roasted and finely ground. Warm, citrusy aroma that is the backbone of South Indian curries and rice dishes. 100% pure, no fillers.',
  '/assets/products/coriander-powder.svg', 'spices'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Coriander Powder');

-- ── MIGRATION: add payment_status + cancellation columns (existing databases) ──
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS payment_status      VARCHAR(50)  NOT NULL DEFAULT 'PENDING_VERIFICATION'
        COMMENT 'PENDING_VERIFICATION | VERIFIED | REJECTED',
  ADD COLUMN IF NOT EXISTS cancellation_reason TEXT         NULL,
  ADD COLUMN IF NOT EXISTS cancelled_at        DATETIME     NULL,
  ADD COLUMN IF NOT EXISTS refund_status       VARCHAR(30)  NULL DEFAULT 'NOT_APPLICABLE';
