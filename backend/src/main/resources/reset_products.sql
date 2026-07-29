-- ============================================================
-- reset_products.sql
-- Run this ONCE manually to clean and reset the products table.
-- After running, restart the Spring Boot backend — DataInitializer
-- will seed all 26 canonical products automatically.
--
-- Usage:
--   mysql -u root -p srivelva < reset_products.sql
-- ============================================================

-- Step 1: Remove stale reviews referencing products we're deleting
DELETE FROM reviews
WHERE product_id NOT IN (
    SELECT id FROM products
    WHERE name IN (
        'Cold Pressed Sesame Oil','Virgin Coconut Oil','Cold Pressed Groundnut Oil',
        'Cold Pressed Castor Oil','Almond Oil','Flaxseed Oil','Sunflower Oil',
        'Kumkumadi Face Oil','Natural Turmeric Soap','Herbal Bath Powder',
        'Rose Powder','Neem Face Pack',
        'Brahmi Hair Oil','Shikakai Powder','Rose Hair Oil',
        'Henna Hair Oil','Henna Hair Pack','Hibiscus Powder','Hibiscus Leaf Powder',
        'Turmeric Powder','Sambar Powder','Garam Masala','Coriander Powder',
        'Chili Powder','Idli Podi','Curry Masala Powder'
    )
);

-- Step 2: Delete all non-canonical products
DELETE FROM products
WHERE name NOT IN (
    'Cold Pressed Sesame Oil','Virgin Coconut Oil','Cold Pressed Groundnut Oil',
    'Cold Pressed Castor Oil','Almond Oil','Flaxseed Oil','Sunflower Oil',
    'Kumkumadi Face Oil','Natural Turmeric Soap','Herbal Bath Powder',
    'Rose Powder','Neem Face Pack',
    'Brahmi Hair Oil','Shikakai Powder','Rose Hair Oil',
    'Henna Hair Oil','Henna Hair Pack','Hibiscus Powder','Hibiscus Leaf Powder',
    'Turmeric Powder','Sambar Powder','Garam Masala','Coriander Powder',
    'Chili Powder','Idli Podi','Curry Masala Powder'
);

-- Step 3: Fix image URLs (svg → png) and normalize categories
UPDATE products SET
    image_url = '/assets/products/sesame-oil.png',        category = 'oils'      WHERE name = 'Cold Pressed Sesame Oil';
UPDATE products SET
    image_url = '/assets/products/coconut-oil.png',        category = 'oils'      WHERE name = 'Virgin Coconut Oil';
UPDATE products SET
    image_url = '/assets/products/groundnut-oil.png',      category = 'oils'      WHERE name = 'Cold Pressed Groundnut Oil';
UPDATE products SET
    image_url = '/assets/products/castor-oil.png',         category = 'oils'      WHERE name = 'Cold Pressed Castor Oil';
UPDATE products SET
    image_url = '/assets/products/almond-oil.png',         category = 'oils'      WHERE name = 'Almond Oil';
UPDATE products SET
    image_url = '/assets/products/flaxseed-oil.png',       category = 'oils'      WHERE name = 'Flaxseed Oil';
UPDATE products SET
    image_url = '/assets/products/sunflower-oil.png',      category = 'oils'      WHERE name = 'Sunflower Oil';
UPDATE products SET
    image_url = '/assets/products/kumkumadi-face-oil.png', category = 'skin care' WHERE name = 'Kumkumadi Face Oil';
UPDATE products SET
    image_url = '/assets/products/turmeric-soap.png',      category = 'skin care' WHERE name = 'Natural Turmeric Soap';
UPDATE products SET
    image_url = '/assets/products/herbal-bath-powder.png', category = 'skin care' WHERE name = 'Herbal Bath Powder';
UPDATE products SET
    image_url = '/assets/products/rose-powder.png',        category = 'skin care' WHERE name = 'Rose Powder';
UPDATE products SET
    image_url = '/assets/products/neem-face-pack.png',     category = 'skin care' WHERE name = 'Neem Face Pack';
UPDATE products SET
    image_url = '/assets/products/brahmi-hair-oil.png',    category = 'hair care' WHERE name = 'Brahmi Hair Oil';
UPDATE products SET
    image_url = '/assets/products/shikakai-powder.png',    category = 'hair care' WHERE name = 'Shikakai Powder';
UPDATE products SET
    image_url = '/assets/products/rose-hair-oil.png',      category = 'hair care' WHERE name = 'Rose Hair Oil';
UPDATE products SET
    image_url = '/assets/products/henna-hair-oil.png',     category = 'hair care' WHERE name = 'Henna Hair Oil';
UPDATE products SET
    image_url = '/assets/products/henna-hair-pack.png',    category = 'hair care' WHERE name = 'Henna Hair Pack';
UPDATE products SET
    image_url = '/assets/products/hibiscus-powder.png',    category = 'hair care' WHERE name = 'Hibiscus Powder';
UPDATE products SET
    image_url = '/assets/products/hibiscus-leaf-powder.png', category = 'hair care' WHERE name = 'Hibiscus Leaf Powder';
UPDATE products SET
    image_url = '/assets/products/turmeric-powder.png',    category = 'spices'    WHERE name = 'Turmeric Powder';
UPDATE products SET
    image_url = '/assets/products/sambar-powder.png',      category = 'spices'    WHERE name = 'Sambar Powder';
UPDATE products SET
    image_url = '/assets/products/garam-masala.png',       category = 'spices'    WHERE name = 'Garam Masala';
UPDATE products SET
    image_url = '/assets/products/coriander-powder.png',   category = 'spices'    WHERE name = 'Coriander Powder';
UPDATE products SET
    image_url = '/assets/products/chili-powder.png',       category = 'spices'    WHERE name = 'Chili Powder';
UPDATE products SET
    image_url = '/assets/products/idli-podi.png',          category = 'spices'    WHERE name = 'Idli Podi';
UPDATE products SET
    image_url = '/assets/products/curry-masala-powder.png', category = 'spices'   WHERE name = 'Curry Masala Powder';

-- Step 4: Verify
SELECT id, name, category, price, image_url FROM products ORDER BY category, name;
SELECT COUNT(*) AS total_products FROM products;
