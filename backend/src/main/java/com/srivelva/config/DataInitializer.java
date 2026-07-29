package com.srivelva.config;

import com.srivelva.model.Product;
import com.srivelva.model.ProductVariant;
import com.srivelva.model.Settings;
import com.srivelva.repository.ProductRepository;
import com.srivelva.repository.ProductVariantRepository;
import com.srivelva.repository.SettingsRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

@Configuration
public class DataInitializer {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    // { name, basePrice, description, imageUrl, category, size1, price1, size2, price2 }
    // size2/price2 = null if single-size product
    private static final Object[][] PRODUCTS = {
        { "Cold Pressed Sesame Oil",    299.0,
          "Pure traditional sesame oil cold pressed for maximum nutrition. Rich in antioxidants and vitamin E. Perfect for cooking and body massage.",
          "/assets/products/sesame-oil.png", "oils",
          "500ml", 299.0, "1 Litre", 599.0 },

        { "Virgin Coconut Oil",         249.0,
          "Extra virgin coconut oil extracted without heat. Great for hair and skin nourishment. Naturally fragrant and pure.",
          "/assets/products/coconut-oil.png", "oils",
          "500ml", 249.0, "1 Litre", 499.0 },

        { "Cold Pressed Groundnut Oil", 199.0,
          "Farm-fresh groundnut oil cold pressed the traditional way. Rich, aromatic and perfect for South Indian cooking.",
          "/assets/products/groundnut-oil.png", "oils",
          "500ml", 199.0, "1 Litre", 399.0 },

        { "Cold Pressed Castor Oil",    249.0,
          "Farm-fresh castor seeds cold pressed the traditional way. Rich in ricinoleic acid. Promotes hair growth and nourishes scalp.",
          "/assets/products/castor-oil.png", "oils",
          "500ml", 249.0, "1 Litre", 499.0 },

        { "Almond Oil",                 1499.0,
          "Pure cold pressed sweet almond oil rich in vitamin E, omega-9 and antioxidants. Excellent for skin and hair nourishment.",
          "/assets/products/almond-oil.png", "oils",
          "500ml", 1499.0, "1 Litre", 2999.0 },

        { "Flaxseed Oil",               1249.0,
          "Cold pressed flaxseed oil rich in omega-3 fatty acids. Supports heart health and promotes healthy skin and hair.",
          "/assets/products/flaxseed-oil.png", "oils",
          "500ml", 1249.0, "1 Litre", 2499.0 },

        { "Sunflower Oil",              199.0,
          "Cold pressed sunflower oil rich in vitamin E. Light texture, mild flavour. Perfect for cooking and salad dressings.",
          "/assets/products/sunflower-oil.png", "oils",
          "500ml", 199.0, "1 Litre", 399.0 },

        { "Kumkumadi Face Oil",         399.0,
          "Ancient Ayurvedic blend for radiant glowing skin. Reduces dark spots and improves complexion. Contains saffron, sandalwood and rare botanicals.",
          "/assets/products/kumkumadi-face-oil.png", "skin care",
          "30ml", 399.0, null, null },

        { "Natural Turmeric Soap",      149.0,
          "Handcrafted soap with raw turmeric and coconut oil. Anti-bacterial and brightening. No SLS, no parabens.",
          "/assets/products/turmeric-soap.png", "skin care",
          "1 Bar", 149.0, null, null },

        { "Herbal Bath Powder",         199.0,
          "Gentle Ayurvedic bath powder with neem, turmeric, hibiscus, vetiver and rose petals. Cleanses and brightens skin naturally.",
          "/assets/products/herbal-bath-powder.png", "skin care",
          "500g", 199.0, "1 Kg", 349.0 },

        { "Rose Powder",                149.0,
          "Pure dried rose petal powder for skin brightening and natural glow. Mix with milk or rose water for a face mask.",
          "/assets/products/rose-powder.png", "skin care",
          "500g", 149.0, "1 Kg", 249.0 },

        { "Neem Face Pack",             199.0,
          "Deep cleansing Ayurvedic face pack with neem, turmeric and multani mitti. Controls acne and purifies skin.",
          "/assets/products/neem-face-pack.png", "skin care",
          "500g", 199.0, "1 Kg", 349.0 },

        { "Brahmi Hair Oil",            299.0,
          "Traditional Brahmi hair oil blend that strengthens hair roots, reduces hair fall and promotes growth. Rich in herbal extracts.",
          "/assets/products/brahmi-hair-oil.png", "hair care",
          "500ml", 299.0, "1 Litre", 599.0 },

        { "Shikakai Powder",            199.0,
          "Natural Shikakai powder for gentle hair cleansing. Promotes hair growth, reduces dandruff and adds natural shine.",
          "/assets/products/shikakai-powder.png", "hair care",
          "500g", 199.0, "1 Kg", 349.0 },

        { "Rose Hair Oil",              299.0,
          "Nourishing rose-infused hair oil for soft, shiny and strong hair. Soothes scalp and adds natural fragrance.",
          "/assets/products/rose-hair-oil.png", "hair care",
          "500ml", 299.0, "1 Litre", 599.0 },

        { "Henna Hair Oil",             299.0,
          "Traditional henna hair oil that strengthens hair, reduces breakage and imparts natural colour and shine.",
          "/assets/products/henna-hair-oil.png", "hair care",
          "500ml", 299.0, "1 Litre", 599.0 },

        { "Henna Hair Pack",            199.0,
          "Pure henna leaf powder for natural hair colouring and conditioning. Strengthens hair and adds beautiful shine.",
          "/assets/products/henna-hair-pack.png", "hair care",
          "500g", 199.0, "1 Kg", 349.0 },

        { "Hibiscus Powder",            199.0,
          "Pure hibiscus flower powder that promotes hair growth, reduces hair fall and adds natural colour and gloss.",
          "/assets/products/hibiscus-powder.png", "hair care",
          "500g", 199.0, "1 Kg", 349.0 },

        { "Hibiscus Leaf Powder",       199.0,
          "Pure hibiscus leaf powder for hair conditioning and scalp nourishment. Reduces dandruff and promotes healthy hair.",
          "/assets/products/hibiscus-leaf-powder.png", "hair care",
          "500g", 199.0, "1 Kg", 349.0 },

        { "Turmeric Powder",            149.0,
          "Pure organic turmeric powder with high curcumin content. Perfect for cooking and traditional remedies.",
          "/assets/products/turmeric-powder.png", "spices",
          "500g", 149.0, "1 Kg", 299.0 },

        { "Sambar Powder",              199.0,
          "Authentic South Indian sambar powder made from freshly roasted and ground spices. Rich aroma and deep flavour.",
          "/assets/products/sambar-powder.png", "spices",
          "500g", 199.0, "1 Kg", 399.0 },

        { "Garam Masala",               249.0,
          "Freshly ground garam masala from whole spices. Aromatic blend for authentic Indian cooking.",
          "/assets/products/garam-masala.png", "spices",
          "500g", 249.0, "1 Kg", 499.0 },

        { "Coriander Powder",           149.0,
          "Pure coriander powder freshly ground from farm-fresh seeds. Essential spice for Indian cooking.",
          "/assets/products/coriander-powder.png", "spices",
          "500g", 149.0, "1 Kg", 299.0 },

        { "Chili Powder",               199.0,
          "Pure red chili powder with balanced heat and colour. No artificial colour or preservatives.",
          "/assets/products/chili-powder.png", "spices",
          "500g", 199.0, "1 Kg", 399.0 },

        { "Idli Podi",                  199.0,
          "Traditional South Indian idli podi with the perfect blend of lentils, spices and sesame. A breakfast essential.",
          "/assets/products/idli-podi.png", "spices",
          "500g", 199.0, "1 Kg", 399.0 },

        { "Curry Masala Powder",        249.0,
          "Authentic curry masala powder from freshly ground whole spices. Perfect for curries and gravies.",
          "/assets/products/curry-masala-powder.png", "spices",
          "500g", 249.0, "1 Kg", 499.0 },
    };

    @Bean
    CommandLineRunner initData(ProductRepository productRepo,
                               ProductVariantRepository variantRepo,
                               SettingsRepository settingsRepo) {
        return args -> {
          try {
            // Seed default settings
            if (settingsRepo.count() == 0) {
                Settings s = new Settings();
                s.setWhatsappNumber("9999999999");
                settingsRepo.save(s);
            }

            // Seed products + variants only on empty DB
            if (productRepo.count() == 0) {
                for (Object[] row : PRODUCTS) {
                    String name     = (String) row[0];
                    Double basePrice= (Double) row[1];
                    String desc     = (String) row[2];
                    String img      = (String) row[3];
                    String cat      = (String) row[4];
                    String size1    = (String) row[5];
                    Double price1   = (Double) row[6];
                    String size2    = (String) row[7];
                    Double price2   = (Double) row[8];

                    Product p = new Product(name, basePrice, desc, img, cat);
                    p = productRepo.save(p);

                    variantRepo.save(new ProductVariant(size1, price1, 10, p));
                    if (size2 != null) {
                        variantRepo.save(new ProductVariant(size2, price2, 10, p));
                    }
                }
            } else {
                // Existing DB: add missing variants for products that have none
                List<Product> allProducts = productRepo.findAll();
                for (Object[] row : PRODUCTS) {
                    String name  = (String) row[0];
                    Double price1= (Double) row[6];
                    String size1 = (String) row[5];
                    String size2 = (String) row[7];
                    Double price2= (Double) row[8];

                    allProducts.stream()
                        .filter(p -> p.getName().equalsIgnoreCase(name))
                        .findFirst()
                        .ifPresent(p -> {
                            try {
                                if (variantRepo.findByProductIdOrderByPriceAsc(p.getId()).isEmpty()) {
                                    variantRepo.save(new ProductVariant(size1, price1, p.getStockQuantity(), p));
                                    if (size2 != null) {
                                        variantRepo.save(new ProductVariant(size2, price2, p.getStockQuantity(), p));
                                    }
                                    p.setPrice(price1);
                                    productRepo.save(p);
                                }
                            } catch (Exception e) {
                                // variant table may not exist yet — skip silently
                            }
                        });
                }
            }
          } catch (Exception e) {
            log.error("[DataInitializer] Seeding failed: {}", e.getMessage(), e);
          }
        };
    }
}
