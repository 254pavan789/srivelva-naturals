-- Migration: Force update ALL product image_url to .png
-- Run this on your existing database.
-- This will override ANY existing path (svg, null, or empty) with correct .png paths.

UPDATE products SET image_url = '/assets/products/sesame-oil.png'        WHERE name = 'Cold Pressed Sesame Oil';
UPDATE products SET image_url = '/assets/products/coconut-oil.png'        WHERE name = 'Virgin Coconut Oil';
UPDATE products SET image_url = '/assets/products/groundnut-oil.png'      WHERE name = 'Cold Pressed Groundnut Oil';
UPDATE products SET image_url = '/assets/products/kumkumadi-face-oil.png' WHERE name = 'Kumkumadi Face Oil';
UPDATE products SET image_url = '/assets/products/turmeric-soap.png'      WHERE name = 'Natural Turmeric Soap';
UPDATE products SET image_url = '/assets/products/brahmi-hair-oil.png'    WHERE name = 'Brahmi Hair Oil';
UPDATE products SET image_url = '/assets/products/neem-hair-mask.png'     WHERE name = 'Neem Hair Mask';
UPDATE products SET image_url = '/assets/products/turmeric-powder.png'    WHERE name = 'Turmeric Powder';
UPDATE products SET image_url = '/assets/products/pepper-powder.png'      WHERE name = 'Pepper Powder';
UPDATE products SET image_url = '/assets/products/sambar-powder.png'      WHERE name = 'Sambar Powder';
UPDATE products SET image_url = '/assets/products/garam-masala.png'       WHERE name = 'Garam Masala';
UPDATE products SET image_url = '/assets/products/coriander-powder.png'   WHERE name = 'Coriander Powder';

-- Catch-all: any remaining .svg → .png
UPDATE products SET image_url = REPLACE(image_url, '.svg', '.png') WHERE image_url LIKE '%.svg';
