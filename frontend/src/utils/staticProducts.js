/**
 * staticProducts.js
 *
 * Complete list of all 26 Sri Velva Naturals products with correct images,
 * variants (sizes + prices) and descriptions.
 *
 * Used as FALLBACK when the backend API is unavailable (e.g. Vercel static deploy).
 * When the backend IS running, live API data takes priority.
 */

const v = (size, price, stock = 10) => ({ size, price, stockQuantity: stock });

export const STATIC_PRODUCTS = [
  // ── OILS ──────────────────────────────────────────────────────────────────
  {
    id: 1,
    name: 'Cold Pressed Sesame Oil',
    category: 'oils',
    price: 299,
    description: 'Pure traditional sesame oil cold pressed for maximum nutrition. Rich in antioxidants and vitamin E. Perfect for cooking and body massage. Sourced from the finest sesame farms of Tamil Nadu.',
    imageUrl: '/assets/products/sesame-oil.png',
    stockQuantity: 10,
    variants: [v('500ml', 299), v('1 Litre', 599)],
  },
  {
    id: 2,
    name: 'Virgin Coconut Oil',
    category: 'oils',
    price: 249,
    description: 'Extra virgin coconut oil extracted without heat. Great for hair and skin nourishment. Naturally fragrant and pure. Sourced from coastal Tamil Nadu farms.',
    imageUrl: '/assets/products/coconut-oil.png',
    stockQuantity: 10,
    variants: [v('500ml', 249), v('1 Litre', 499)],
  },
  {
    id: 3,
    name: 'Cold Pressed Groundnut Oil',
    category: 'oils',
    price: 199,
    description: 'Farm-fresh groundnut oil cold pressed the traditional way. Rich, aromatic and perfect for South Indian cooking. No refining, no bleaching.',
    imageUrl: '/assets/products/groundnut-oil.png',
    stockQuantity: 10,
    variants: [v('500ml', 199), v('1 Litre', 399)],
  },
  {
    id: 4,
    name: 'Cold Pressed Castor Oil',
    category: 'oils',
    price: 249,
    description: 'Farm-fresh castor seeds cold pressed the traditional way. Rich in ricinoleic acid. Promotes hair growth and nourishes scalp. Also used for skin care.',
    imageUrl: '/assets/products/castor-oil.png',
    stockQuantity: 10,
    variants: [v('500ml', 249), v('1 Litre', 499)],
  },
  {
    id: 5,
    name: 'Almond Oil',
    category: 'oils',
    price: 1499,
    description: 'Pure cold pressed sweet almond oil rich in vitamin E, omega-9 and antioxidants. Excellent for skin and hair nourishment. Light texture, absorbs quickly.',
    imageUrl: '/assets/products/almond-oil.png',
    stockQuantity: 10,
    variants: [v('500ml', 1499), v('1 Litre', 2999)],
  },
  {
    id: 6,
    name: 'Flaxseed Oil',
    category: 'oils',
    price: 1249,
    description: 'Cold pressed flaxseed oil rich in omega-3 fatty acids. Supports heart health and promotes healthy skin and hair. Farm-fresh flaxseeds cold pressed to retain natural goodness.',
    imageUrl: '/assets/products/flaxseed-oil.png',
    stockQuantity: 10,
    variants: [v('500ml', 1249), v('1 Litre', 2499)],
  },
  {
    id: 7,
    name: 'Sunflower Oil',
    category: 'oils',
    price: 199,
    description: 'Cold pressed sunflower oil rich in vitamin E. Light texture, mild flavour. Perfect for cooking and salad dressings. 100% natural, no additives.',
    imageUrl: '/assets/products/sunflower-oil.png',
    stockQuantity: 10,
    variants: [v('500ml', 199), v('1 Litre', 399)],
  },

  // ── SKIN CARE ─────────────────────────────────────────────────────────────
  {
    id: 8,
    name: 'Kumkumadi Face Oil',
    category: 'skin care',
    price: 399,
    description: 'Ancient Ayurvedic blend for radiant glowing skin. Reduces dark spots and improves complexion. Contains saffron, sandalwood and rare botanicals. 30ml bottle.',
    imageUrl: '/assets/products/kumkumadi-face-oil.png',
    stockQuantity: 10,
    variants: [v('30ml', 399)],
  },
  {
    id: 9,
    name: 'Natural Turmeric Soap',
    category: 'skin care',
    price: 149,
    description: 'Handcrafted soap with raw turmeric and coconut oil. Anti-bacterial and brightening for clear skin. No SLS, no parabens. Gentle enough for daily use.',
    imageUrl: '/assets/products/turmeric-soap.png',
    stockQuantity: 10,
    variants: [v('1 Bar', 149)],
  },
  {
    id: 10,
    name: 'Herbal Bath Powder',
    category: 'skin care',
    price: 199,
    description: 'Gentle Ayurvedic bath powder with neem, turmeric, hibiscus, vetiver and rose petals. Cleanses and brightens skin naturally. Suitable for all skin types.',
    imageUrl: '/assets/products/herbal-bath-powder.png',
    stockQuantity: 10,
    variants: [v('500g', 199), v('1 Kg', 349)],
  },
  {
    id: 11,
    name: 'Rose Powder',
    category: 'skin care',
    price: 149,
    description: 'Pure dried rose petal powder for skin brightening and natural glow. Mix with milk or rose water for a face mask. Rich in vitamins and antioxidants.',
    imageUrl: '/assets/products/rose-powder.png',
    stockQuantity: 10,
    variants: [v('500g', 149), v('1 Kg', 249)],
  },
  {
    id: 12,
    name: 'Neem Face Pack',
    category: 'skin care',
    price: 199,
    description: 'Deep cleansing Ayurvedic face pack with neem, turmeric and multani mitti. Controls acne and purifies skin. Regular use gives clear, blemish-free complexion.',
    imageUrl: '/assets/products/neem-face-pack.png',
    stockQuantity: 10,
    variants: [v('500g', 199), v('1 Kg', 349)],
  },

  // ── HAIR CARE ─────────────────────────────────────────────────────────────
  {
    id: 13,
    name: 'Brahmi Hair Oil',
    category: 'hair care',
    price: 299,
    description: 'Traditional Brahmi hair oil blend that strengthens hair roots, reduces hair fall and promotes growth. Rich in herbal extracts including Brahmi, Amla and Bhringraj.',
    imageUrl: '/assets/products/brahmi-hair-oil.png',
    stockQuantity: 10,
    variants: [v('500ml', 299), v('1 Litre', 599)],
  },
  {
    id: 14,
    name: 'Shikakai Powder',
    category: 'hair care',
    price: 199,
    description: 'Natural Shikakai powder for gentle hair cleansing. Promotes hair growth, reduces dandruff and adds natural shine. A traditional South Indian hair care secret.',
    imageUrl: '/assets/products/shikakai-powder.png',
    stockQuantity: 10,
    variants: [v('500g', 199), v('1 Kg', 349)],
  },
  {
    id: 15,
    name: 'Rose Hair Oil',
    category: 'hair care',
    price: 299,
    description: 'Nourishing rose-infused hair oil for soft, shiny and strong hair. Soothes scalp and adds a natural floral fragrance. Ideal for dry and frizzy hair.',
    imageUrl: '/assets/products/rose-hair-oil.png',
    stockQuantity: 10,
    variants: [v('500ml', 299), v('1 Litre', 599)],
  },
  {
    id: 16,
    name: 'Henna Hair Oil',
    category: 'hair care',
    price: 299,
    description: 'Traditional henna hair oil that strengthens hair, reduces breakage and imparts natural colour and shine. Made with pure henna extracts in a nourishing oil base.',
    imageUrl: '/assets/products/henna-hair-oil.png',
    stockQuantity: 10,
    variants: [v('500ml', 299), v('1 Litre', 599)],
  },
  {
    id: 17,
    name: 'Henna Hair Pack',
    category: 'hair care',
    price: 199,
    description: 'Pure henna leaf powder for natural hair colouring and conditioning. Strengthens hair and adds beautiful shine. Free from PPD, ammonia and harsh chemicals.',
    imageUrl: '/assets/products/henna-hair-pack.png',
    stockQuantity: 10,
    variants: [v('500g', 199), v('1 Kg', 349)],
  },
  {
    id: 18,
    name: 'Hibiscus Powder',
    category: 'hair care',
    price: 199,
    description: 'Pure hibiscus flower powder that promotes hair growth, reduces hair fall and adds natural colour and gloss. Rich in vitamin C and amino acids.',
    imageUrl: '/assets/products/hibiscus-powder.png',
    stockQuantity: 10,
    variants: [v('500g', 199), v('1 Kg', 349)],
  },
  {
    id: 19,
    name: 'Hibiscus Leaf Powder',
    category: 'hair care',
    price: 199,
    description: 'Pure hibiscus leaf powder for hair conditioning and scalp nourishment. Reduces dandruff and promotes healthy, lustrous hair growth.',
    imageUrl: '/assets/products/hibiscus-leaf-powder.png',
    stockQuantity: 10,
    variants: [v('500g', 199), v('1 Kg', 349)],
  },

  // ── SPICES ────────────────────────────────────────────────────────────────
  {
    id: 20,
    name: 'Turmeric Powder',
    category: 'spices',
    price: 149,
    description: 'Pure organic turmeric powder with high curcumin content. Stone-ground to preserve aroma and medicinal properties. No additives, no fillers — farm to kitchen quality.',
    imageUrl: '/assets/products/turmeric-powder.png',
    stockQuantity: 10,
    variants: [v('500g', 149), v('1 Kg', 299)],
  },
  {
    id: 21,
    name: 'Sambar Powder',
    category: 'spices',
    price: 199,
    description: 'Authentic South Indian sambar powder made from freshly roasted and ground spices. Rich aroma and deep flavour. The secret behind every perfect pot of sambar.',
    imageUrl: '/assets/products/sambar-powder.png',
    stockQuantity: 10,
    variants: [v('500g', 199), v('1 Kg', 399)],
  },
  {
    id: 22,
    name: 'Garam Masala',
    category: 'spices',
    price: 249,
    description: 'Freshly ground garam masala from whole spices — cardamom, cloves, cinnamon, pepper and more. Rich, complex and deeply aromatic. Elevates every dish it touches.',
    imageUrl: '/assets/products/garam-masala.png',
    stockQuantity: 10,
    variants: [v('500g', 249), v('1 Kg', 499)],
  },
  {
    id: 23,
    name: 'Coriander Powder',
    category: 'spices',
    price: 149,
    description: 'Pure coriander powder freshly ground from farm-fresh seeds. Warm, citrusy aroma that is the backbone of South Indian curries and rice dishes.',
    imageUrl: '/assets/products/coriander-powder.png',
    stockQuantity: 10,
    variants: [v('500g', 149), v('1 Kg', 299)],
  },
  {
    id: 24,
    name: 'Chili Powder',
    category: 'spices',
    price: 199,
    description: 'Pure red chili powder with balanced heat and vibrant colour. Sourced from premium chili farms. No artificial colour, no preservatives — pure spice.',
    imageUrl: '/assets/products/chili-powder.png',
    stockQuantity: 10,
    variants: [v('500g', 199), v('1 Kg', 399)],
  },
  {
    id: 25,
    name: 'Idli Podi',
    category: 'spices',
    price: 199,
    description: 'Traditional South Indian idli podi with the perfect blend of lentils, spices and sesame seeds. A breakfast essential. Mix with sesame oil for the perfect dip.',
    imageUrl: '/assets/products/idli-podi.png',
    stockQuantity: 10,
    variants: [v('500g', 199), v('1 Kg', 399)],
  },
  {
    id: 26,
    name: 'Curry Masala Powder',
    category: 'spices',
    price: 249,
    description: 'Authentic curry masala powder from freshly ground whole spices. Perfect blend for curries and gravies. Made fresh in small batches to preserve maximum flavour.',
    imageUrl: '/assets/products/curry-masala-powder.png',
    stockQuantity: 10,
    variants: [v('500g', 249), v('1 Kg', 499)],
  },
];

/** Filter by category key (case-insensitive). Pass null/'All' for all products. */
export const getStaticProducts = (category = null) => {
  if (!category || category === 'All') return STATIC_PRODUCTS;
  return STATIC_PRODUCTS.filter(
    p => p.category.toLowerCase() === category.toLowerCase()
  );
};

/** Get one product by id (number or string). */
export const getStaticProductById = (id) =>
  STATIC_PRODUCTS.find(p => p.id === Number(id)) ?? null;
