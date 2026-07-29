CREATE TABLE IF NOT EXISTS product_variants (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id     BIGINT        NOT NULL,
    size           VARCHAR(50)   NOT NULL,
    price          DOUBLE        NOT NULL,
    stock_quantity INT           NOT NULL DEFAULT 10,
    CONSTRAINT fk_variant_product
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
