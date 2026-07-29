-- Run this on existing databases to add variant support
-- New installs: Hibernate auto-creates the table (spring.jpa.hibernate.ddl-auto=update)

CREATE TABLE IF NOT EXISTS product_variants (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id     BIGINT        NOT NULL,
    size           VARCHAR(50)   NOT NULL,
    price          DOUBLE        NOT NULL,
    stock_quantity INT           NOT NULL DEFAULT 10,
    CONSTRAINT fk_variant_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_variant_product ON product_variants(product_id);

-- Also add size to order items json (no schema change needed — stored as JSON text)
