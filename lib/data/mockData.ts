import { ProductItem, Product } from '@/lib/types/ecommerce';
import { normalizeCategorySlug } from '@/lib/utils/categoryUtils';

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  productCount: number;
  featuredTag?: string;
}

export interface ReviewItem {
  id: string;
  author: string;
  location: string;
  rating: number;
  productTitle: string;
  category: string;
  title: string;
  comment: string;
  verified: boolean;
  date: string;
}

export interface PressMention {
  publication: string;
  quote: string;
  date: string;
}

export const CATEGORIES: CategoryItem[] = [
  {
    id: 'cat-haircare',
    name: 'Hair',
    slug: 'hair',
    description: 'Biomimetic ceramides, vegan silk polypeptides, and restorative nectar oils.',
    image: '/images/products/hair-nectar-oil.jpg',
    productCount: 3,
    featuredTag: 'Bestseller',
  },
  {
    id: 'cat-fragrance',
    name: 'Parfum',
    slug: 'fragrance',
    description: 'Rare extrait concentrations aged in charred oak casks with 24-hour sillage.',
    image: '/images/perfumes/princess-reef.jpg',
    productCount: 8,
    featuredTag: 'Limited Harvest',
  },
  {
    id: 'cat-skincare',
    name: 'Skincare',
    slug: 'skincare',
    description: 'High-potency cellular serums, barrier restorative balms, and cold-extracted actives.',
    image: '/images/products/botanical-serum.jpg',
    productCount: 2,
  },
  {
    id: 'cat-body',
    name: 'Body & Bath',
    slug: 'body-bath',
    description: 'Sensory mineral body polishes, velvety botanical washes, and restorative botanicals.',
    image: '/images/products/body-wash.jpg',
    productCount: 2,
  },
  {
    id: 'cat-home',
    name: 'Home & Candles',
    slug: 'home-living',
    description: 'Hand-poured ceramic candles, room mists, and luxury home goods.',
    image: '/images/products/scented-candle.jpg',
    productCount: 2,
    featuredTag: 'New In',
  },
  {
    id: 'cat-accessories',
    name: 'Accessories',
    slug: 'accessories',
    description: 'Hand-stitched Italian leather travel cases and 22-momme pure mulberry silk goods.',
    image: '/images/products/leather-travel-case.jpg',
    productCount: 2,
  },
];

export const PRODUCTS: ProductItem[] = [
  // HAIR (TOP SELLER)
  // -------------------------------------------------------------
  {
    id: 'prod-hair-1',
    title: 'L’Huile Sublime Regenerative Nectar',
    slug: 'l-huile-sublime-regenerative-nectar',
    subtitle: 'Artisanal Botanical Hair Oil • Thermal Defense & Porosity Repair',
    summary: 'A cold-pressed restorative oil combining Kalahari melon seed, cold-extracted camellia, and bio-fermented peptide lipids for supreme shine and thermal defense up to 450°F.',
    description: 'Engineered over three years in Grasse and Tokyo, L’Huile Sublime penetrates the cuticle layer rather than merely coating it. Micro-fractionated lipids fuse into compromised keratin bonds, restoring tensile elasticity while imparting a mirror-gloss weightless aura.',
    category: 'Hair',
    basePrice: 135,
    compareAtPrice: 160,
    rating: 4.9,
    reviewCount: 142,
    ingredients: 'Camellia Japonica Seed Oil, Citrullus Lanatus (Kalahari Melon) Seed Oil, Hydrogenated Ethylhexyl Olivate, Squalane (Ecocert), Ceramide NG, Boswellia Carterii (Frankincense) Resin Extract, Tocopherol (Pure Vitamin E), Fragrance (Natural Artisanal Isolate). Silicone-Free. Paraben-Free.',
    howToUse: 'Warm 2 to 3 drops between palms to activate the botanical terpenes. Smooth over damp mid-lengths to ends before heat styling, or massage into scalp overnight as an intensive ritual.',
    sourcingEthics: 'Cold-pressed in zero-waste cooperative micro-farms in the Namibian desert. Packaged in uv-protective, heavyweight violet glass blown in Murano, Italy. 100% biodegradable formulation.',
    attributes: {
      badge: 'Award Winner',
      hairType: ['Straight', 'Wavy', 'Curly', 'Coiled / High Porosity'],
      siliconeFree: true,
      sulfateFree: true,
      volumeMl: 100,
      ritualTime: 'Morning Polish & Night Repair',
    },
    images: [
      {
        id: 'img-hs-hero',
        url: '/images/products/hair-nectar-oil.jpg',
        alt: 'L’Huile Sublime luxury hair oil bottle on travertine stone',
        isHero: true,
      },
    ],
    variants: [
      {
        id: 'v-hs-100ml',
        sku: 'RY-HN-100',
        title: '100ml / 3.4 fl. oz. Full Bottle',
        price: 135,
        compareAtPrice: 160,
        inventory: 48,
        attributes: { size: '100ml' },
      },
      {
        id: 'v-hs-50ml',
        sku: 'RY-HN-50',
        title: '50ml / 1.7 fl. oz. Travel Edition',
        price: 85,
        inventory: 24,
        attributes: { size: '50ml' },
      },
      {
        id: 'v-hs-duo',
        sku: 'RY-HN-DUO',
        title: 'The Ritual Duo (100ml + 50ml Refill)',
        price: 195,
        compareAtPrice: 220,
        inventory: 15,
        attributes: { size: 'Duo' },
      },
    ],
  },
  {
    id: 'prod-hair-2',
    title: 'Crème de Soie Keratin Restorative Mask',
    slug: 'creme-de-soie-keratin-restorative-mask',
    subtitle: 'Deep Cellular Bonding Hair Mask • Biomimetic Silk Proteins',
    summary: 'An opulent whipped velvet treatment that reconstructs fractured disulfide bonds, infusing fragile hair with structural density and fluid cashmere movement.',
    description: 'Infused with hydrolysed vegan silk polypeptides and micro-encapsulated hyaluronic acids, Crème de Soie acts as a biomimetic exoskeleton for distressed cuticles. Reverses structural chemical degradation from bleach and environmental heat stress.',
    category: 'Hair',
    basePrice: 110,
    compareAtPrice: 125,
    rating: 4.8,
    reviewCount: 76,
    ingredients: 'Aqua, Cetearyl Alcohol, Behentrimonium Methosulfate, Hydrolyzed Vegetable Silk Protein, Astrocaryum Murumuru Seed Butter, Hydrolyzed Hyaluronic Acid, Argania Spinosa Kernel Oil, Lactic Acid, Natural Aroma.',
    howToUse: 'Following cleansing, gently squeeze excess moisture from tresses. Distribute evenly with a wide-tooth comb. Indulge for 10 to 15 minutes before rinsing with tepid water.',
    sourcingEthics: 'Murumuru butter wild-harvested along the Amazon river basin through fair-trade certified indigenous micro-collectives. Refillable ceramic pot with recyclable aluminum inner vessel.',
    attributes: {
      hairType: ['Bleached', 'Chemically Treated', 'Dry', 'Color-Treated'],
      siliconeFree: true,
      volumeMl: 250,
      ritualTime: 'Weekly Intensive Salon Protocol',
    },
    images: [
      {
        id: 'img-cs-hero',
        url: '/images/products/keratin-hair-mask.jpg',
        alt: 'Crème de Soie minimalist porcelain keratin hair mask jar',
        isHero: true,
      },
    ],
    variants: [
      {
        id: 'v-cs-250ml',
        sku: 'RY-CDS-250',
        title: '250ml / 8.5 oz. Porcelain Vessel',
        price: 110,
        compareAtPrice: 125,
        inventory: 62,
        attributes: { size: '250ml' },
      },
    ],
  },
  {
    id: 'prod-hair-3',
    title: 'Bespoke HD Lace Wavy Bob',
    slug: 'bespoke-hd-lace-wavy-bob-chocolate',
    subtitle: 'Premium Virgin Hair • Glueless Transparent HD Lace',
    summary: 'A meticulously handcrafted chocolate brown wavy bob featuring invisible HD lace for a seamless, undetectable hairline and natural volume.',
    description: 'Expertly constructed using 100% premium virgin hair, this bouncy wavy bob offers effortless styling and a natural luster. The ultra-thin HD lace melts seamlessly into any skin tone, while the pre-plucked hairline and bleached knots ensure a hyper-realistic finish straight out of the box.',
    category: 'Hair',
    basePrice: 450,
    compareAtPrice: 520,
    rating: 5.0,
    reviewCount: 34,
    ingredients: '100% Premium Virgin Human Hair, Ultra-Thin Swiss HD Lace, Adjustable Breathable Cap with Security Combs.',
    howToUse: 'Secure the adjustable band for a glueless fit, or apply your preferred lace adhesive for extended wear. Style with low heat and define the waves with a lightweight serum for optimal bounce.',
    sourcingEthics: 'Ethically sourced raw virgin hair, carefully hand-tied by master artisans. Crafted to last 2+ years with proper maintenance.',
    attributes: {
      badge: 'New Arrival',
      hairType: ['Wavy', 'Voluminous', 'Medium Density'],
      laceType: 'Transparent Swiss HD Lace',
      length: '12" / 30cm',
      capSize: 'Medium (Adjustable)',
    },
    images: [
      {
        id: 'img-wb-hero',
        url: '/images/media_1791069473262.jpg',
        alt: 'Bespoke Wavy Bob Hairpiece on model',
        isHero: true,
      },
      {
        id: 'img-wb-texture',
        url: '/images/media_1791069473302.jpg',
        alt: 'Multiple angles of the chocolate brown wavy bob',
        isTexture: true,
      },
      {
        id: 'img-wb-detail1',
        url: '/images/media_1791069473275.jpg',
        alt: 'Side profile showing volume and bounce',
      },
      {
        id: 'img-wb-detail2',
        url: '/images/media_1791069473307.jpg',
        alt: 'Close up of the HD lace hairline',
      },
      {
        id: 'img-wb-detail3',
        url: '/images/media_1791069473355.jpg',
        alt: 'Side angle of the wavy bob',
      },
    ],
    variants: [
      {
        id: 'v-wb-12inch',
        sku: 'RY-WB-12',
        title: '12" Chocolate Brown',
        price: 450,
        compareAtPrice: 520,
        inventory: 15,
        attributes: { size: '12 inch' },
      },
      {
        id: 'v-wb-14inch',
        sku: 'RY-WB-14',
        title: '14" Chocolate Brown',
        price: 480,
        inventory: 10,
        attributes: { size: '14 inch' },
      },
    ],
  },

  // -------------------------------------------------------------
  // PARFUM
  // -------------------------------------------------------------
  {
    id: 'prod_1794079987326_bs41',
    title: "Princess Reef Parfum 100ml",
    slug: 'princess-reef-parfum-100ml-87326',
    subtitle: "Elegance, Confidence and Feminine Luxury",
    summary: "Princess Reef is an elegant and captivating feminine fragrance that combines sparkling bergamot and mandarin with the romantic beauty of Damask rose. Its warm base of amber, vanilla and leather creates a sophisticated, sensual finish. Beautifully presented in a luxurious pink bottle with a decorative ribbon and crystal pendant, it is a fragrance that celebrates confidence and timeless femininity.",
    description: "# Princess Reef Parfum 100ml – REEF Perfumes\n\n**Subtitle:** Elegance, Confidence and Feminine Luxury\n\n### Short Summary\nPrincess Reef is an elegant and captivating feminine fragrance that combines sparkling bergamot and mandarin with the romantic beauty of Damask rose. Its warm base of amber, vanilla and leather creates a sophisticated, sensual finish. Beautifully presented in a luxurious pink bottle with a decorative ribbon and crystal pendant, it is a fragrance that celebrates confidence and timeless femininity.\n\n### Full Product Description\nDiscover the beauty of feminine elegance with Princess Reef by REEF Perfumes. Composed by renowned master perfumer Hamid Merati-Kashani, this luxurious fragrance captures the perfect balance between radiant freshness, delicate florals and warm sensuality.\n\nThe fragrance opens with a refreshing burst of bergamot and mandarin, creating a bright and uplifting first impression. At its heart, exquisite Damask rose unfolds, adding a rich, velvety floral character that feels romantic and sophisticated.\n\nAs the fragrance develops, warm amber, smooth vanilla and refined leather create a beautiful, sensual dry-down that leaves an elegant and memorable impression.\n\nPresented in a stunning blush-pink bottle featuring a decorative floral ribbon and crystal pendant, Princess Reef is more than a perfume; it is an expression of grace, beauty and confidence.\n\nPerfect for women who appreciate luxurious fragrances with a distinctive and elegant character.\n\n### Fragrance Notes\n- **Top Notes:** Bergamot, Mandarin\n- **Heart Note:** Damask Rose\n- **Base Notes:** Amber, Vanilla, Leather\n\n### Longevity & Performance\n- **Estimated Longevity:** 8–10 hours.\n- **Projection:** Moderate to strong.\n- **Projection Duration:** Approximately 2–3 hours.\n- **Sillage:** Moderate to strong.\n- **Best Performance:** Daytime elegance, evening outings and special occasions.\n\n*Performance estimates vary depending on skin chemistry, application and environment.*\n\n### Product Details\n- **Brand:** REEF Perfumes\n- **Fragrance:** Princess Reef\n- **Volume:** 100ml\n- **Concentration:** Eau de Parfum (EDP)\n- **Fragrance Family:** Citrus, Floral and Amber\n- **Gender:** Women\n- **Origin:** Saudi Arabia\n- **Perfumer:** Hamid Merati-Kashani\n- **Special Features:** Decorative floral ribbon and crystal pendant.\n\n### Best For\nRomantic dates, weddings, elegant daytime wear, evening occasions and luxury gifting.\n\n### Why You'll Love It\n- Beautiful combination of citrus, rose and warm vanilla.\n- Elegant feminine fragrance character.\n- Sophisticated amber and leather finish.\n- Luxurious pink presentation with a decorative crystal pendant.\n- A beautiful gift for someone special.",
    category: 'Parfum',
    basePrice: 39.99,
    compareAtPrice: 45,
    rating: 5.0,
    reviewCount: 30,
    ingredients: 'Alcohol Denat., Parfum (Fine Fragrance Compounds), Aqua (Demineralized Water), Limonene, Linalool, Citronellol, Coumarin, Benzyl Benzoate.',
    howToUse: 'Mist directly onto pulse points including wrists, neck, and behind ears. Allow to settle naturally on the skin without rubbing to preserve the top and heart notes.',
    sourcingEthics: 'Artisanal perfume compound formulated with pure fragrance essences. Bottled in premium UV-protective flacons.',
    attributes: {
      badge: 'Bestseller',
      olfactoryFamily: 'Oriental Luxury Oud & Amber',
      concentration: 'Eau de Parfum',
    },
    images: [
      {
        id: 'img-prod_1794079987326_bs41-1',
        url: '/images/perfumes/princess-reef.jpg',
        alt: "Princess Reef Parfum 100ml",
        isHero: true,
      },
    ],
    variants: [
      {
        id: 'v-prod_1794079987326_bs41',
        sku: 'RYC-6_BS41',
        title: 'Full Bottle Edition',
        price: 39.99,
        inventory: 15,
      },
    ],
  },

  {
    id: 'prod_1794083526216_lgvi',
    title: "Ignite Oud EDP 60ml – Ahmed Al Maghribi",
    slug: 'ignite-oud-edp-60ml-ahmed-al-maghribi-26216',
    subtitle: "A Bold, Powerful Expression of Woody Luxury",
    summary: "Ignite Oud is a captivating unisex fragrance that combines the richness of leather, aromatic geranium, earthy patchouli and smooth cedarwood. Its warm amber, musk and sandalwood base creates a sophisticated woody finish, leaving a memorable scent trail. Perfect for those who appreciate bold, distinctive and luxurious fragrances.",
    description: "Ignite Oud EDP 60ml – Ahmed Al Maghribi\n\nSubtitle: A Bold, Powerful Expression of Woody Luxury\n\nShort Summary\n\nIgnite Oud is a captivating unisex fragrance that combines the richness of leather, aromatic geranium, earthy patchouli and smooth cedarwood. Its warm amber, musk and sandalwood base creates a sophisticated woody finish, leaving a memorable scent trail. Perfect for those who appreciate bold, distinctive and luxurious fragrances.\n\nFull Product Description\n\nMake a lasting impression with Ignite Oud by Ahmed Al Maghribi. This distinctive fragrance brings together bold aromatic notes and rich woody accords to create a scent that radiates confidence, strength and sophistication.\n\nThe fragrance opens with an intriguing combination of fresh geranium and smooth leather, delivering an aromatic and slightly smoky introduction. As it develops, cedarwood and patchouli bring earthy depth and warmth, creating a beautifully balanced heart.\n\nThe dry-down reveals a luxurious blend of moss, musk, amber and creamy sandalwood, leaving a warm, elegant and long-lasting impression.\n\nDesigned for both men and women, Ignite Oud is an excellent choice for fragrance lovers who enjoy woody, leathery and sophisticated scents.\n\nFragrance Notes\n\nTop Notes: Geranium, Leather\n\nHeart Notes: Cedarwood, Patchouli\n\nBase Notes: Moss, Musk, Amber, Sandalwood\n\nLongevity & Performance\n\nEstimated Longevity: Approximately 8 hours (some wearers report 10–12 hours).\n\nProjection: Moderate to strong.\n\nSillage: Strong.\n\nOpening Projection: Particularly noticeable during the first 2–4 hours, according to wearer reports.\n\nBest Performance: Evening wear, special occasions and cooler weather.\n\nProduct Details\n\nBrand: Ahmed Al Maghribi\n\nFragrance: Ignite Oud\n\nVolume: 60ml\n\nConcentration: Eau de Parfum (EDP)\n\nFragrance Family: Woody, Leather and Oriental\n\nGender: Unisex\n\nOrigin: United Arab Emirates\n\nBest For\n\nEvening outings, formal events, special occasions and anyone who enjoys bold, sophisticated woody fragrances.",
    category: 'Parfum',
    basePrice: 39,
    compareAtPrice: 55,
    rating: 5.0,
    reviewCount: 30,
    ingredients: 'Alcohol Denat., Parfum (Fine Fragrance Compounds), Aqua (Demineralized Water), Limonene, Linalool, Citronellol, Coumarin, Benzyl Benzoate.',
    howToUse: 'Mist directly onto pulse points including wrists, neck, and behind ears. Allow to settle naturally on the skin without rubbing to preserve the top and heart notes.',
    sourcingEthics: 'Artisanal perfume compound formulated with pure fragrance essences. Bottled in premium UV-protective flacons.',
    attributes: {
      badge: 'Bestseller',
      olfactoryFamily: 'Oriental Luxury Oud & Amber',
      concentration: 'Eau de Parfum',
    },
    images: [
      {
        id: 'img-prod_1794083526216_lgvi-1',
        url: '/images/perfumes/ignite-oud.jpg',
        alt: "Ignite Oud EDP 60ml – Ahmed Al Maghribi",
        isHero: true,
      },
    ],
    variants: [
      {
        id: 'v-prod_1794083526216_lgvi',
        sku: 'RYC-6_LGVI',
        title: 'Full Bottle Edition',
        price: 39,
        inventory: 10,
      },
    ],
  },

  {
    id: 'prod_1794083831474_et70',
    title: "Island Dreams Extrait de Parfum 100ml – Khadlaj",
    slug: 'island-dreams-extrait-de-parfum-100ml-khadlaj-31474',
    subtitle: "A Refreshing Escape into Citrus Freshness and Modern Elegance",
    summary: "Experience the refreshing elegance of Island Dreams by Khadlaj. This vibrant unisex fragrance blends sparkling bergamot, aromatic ginger and juicy grapefruit with a smooth base of ambroxan and musk. Fresh, uplifting and effortlessly sophisticated, it is perfect for those who enjoy clean citrus fragrances with a modern touch.",
    description: "Island Dreams Extrait de Parfum 100ml – Khadlaj\n\nSubtitle: A Refreshing Escape into Citrus Freshness and Modern Elegance\n\nShort Summary\n\nExperience the refreshing elegance of Island Dreams by Khadlaj. This vibrant unisex fragrance blends sparkling bergamot, aromatic ginger and juicy grapefruit with a smooth base of ambroxan and musk. Fresh, uplifting and effortlessly sophisticated, it is perfect for those who enjoy clean citrus fragrances with a modern touch.\n\nFull Product Description\n\nEscape into a world of freshness with Island Dreams by Khadlaj. This captivating Extrait de Parfum brings together bright citrus notes, aromatic spices and sensual musky accords to create an uplifting fragrance that feels both refreshing and luxurious.\n\nThe fragrance opens with sparkling bergamot and invigorating ginger, delivering a fresh, zesty introduction with a subtle spicy warmth.\n\nAt its heart, juicy grapefruit adds a vibrant citrus character, creating a refreshing and energetic scent that feels like a gentle tropical breeze.\n\nAs the fragrance settles, ambroxan and soft musk create a clean, smooth and subtly sensual finish, leaving a sophisticated impression on the skin.\n\nDesigned for both men and women, Island Dreams is an excellent choice for fragrance lovers who appreciate fresh, modern and versatile scents.\n\nFragrance Notes\n\nTop Notes\n\nBergamot\n\nGinger\n\nHeart Notes\n\nGrapefruit Accord\n\nBase Notes\n\nAmbroxan\n\nMusk\n\nLongevity & Performance\n\nEstimated Longevity: Approximately 6–8 hours on skin.\n\nProjection: Moderate to strong, particularly during the opening.\n\nSillage: Moderate to noticeable.\n\nDry-Down: Clean, musky and refreshing.\n\nBest Performance: Spring, summer and warm-weather occasions.\n\nPerformance varies depending on skin chemistry, application and environment.\n\nProduct Details\n\nBrand: Khadlaj Perfumes\n\nFragrance: Island Dreams\n\nVolume: 100ml\n\nConcentration: Extrait de Parfum\n\nFragrance Family: Citrus, Aromatic and Musky\n\nGender: Unisex\n\nOrigin: United Arab Emirates\n\nBest For\n\nEveryday wear, office settings, holidays, outdoor activities, casual outings and daytime occasions.\n\nWhy You'll Love It\n\nFresh and energising citrus opening.\n\nBeautiful balance of bergamot and ginger.\n\nJuicy grapefruit heart.\n\nClean and sophisticated musky finish.\n\nVersatile unisex fragrance suitable for warmer weather.",
    category: 'Parfum',
    basePrice: 32,
    
    rating: 5.0,
    reviewCount: 30,
    ingredients: 'Alcohol Denat., Parfum (Fine Fragrance Compounds), Aqua (Demineralized Water), Limonene, Linalool, Citronellol, Coumarin, Benzyl Benzoate.',
    howToUse: 'Mist directly onto pulse points including wrists, neck, and behind ears. Allow to settle naturally on the skin without rubbing to preserve the top and heart notes.',
    sourcingEthics: 'Artisanal perfume compound formulated with pure fragrance essences. Bottled in premium UV-protective flacons.',
    attributes: {
      badge: 'Bestseller',
      olfactoryFamily: 'Oriental Luxury Oud & Amber',
      concentration: 'Eau de Parfum',
    },
    images: [
      {
        id: 'img-prod_1794083831474_et70-1',
        url: '/images/perfumes/island-dreams.jpg',
        alt: "Island Dreams Extrait de Parfum 100ml – Khadlaj",
        isHero: true,
      },
    ],
    variants: [
      {
        id: 'v-prod_1794083831474_et70',
        sku: 'RYC-4_ET70',
        title: 'Full Bottle Edition',
        price: 32,
        inventory: 10,
      },
    ],
  },

  {
    id: 'prod_1794085327396_i42q',
    title: "Smoked Oud & Vanilla Eau de Parfum 100ml – Maison Alhambra",
    slug: 'smoked-oud-vanilla-eau-de-parfum-100ml-maison-alhambra-27396',
    subtitle: "Deep, Smoky Elegance with a Creamy Vanilla Finish",
    summary: "Indulge in the captivating warmth of Smoked Oud & Vanilla by Maison Alhambra. This luxurious unisex fragrance blends exotic saffron and coriander with rich coffee, delicate florals and a deep, smoky base of vanilla, suede, tobacco and mahogany. A bold yet smooth fragrance for those who appreciate warm, sweet and sophisticated scents.",
    description: "Smoked Oud & Vanilla Eau de Parfum 100ml – Maison Alhambra\n\nSubtitle: Deep, Smoky Elegance with a Creamy Vanilla Finish\n\nShort Summary\n\nIndulge in the captivating warmth of Smoked Oud & Vanilla by Maison Alhambra. This luxurious unisex fragrance blends exotic saffron and coriander with rich coffee, delicate florals and a deep, smoky base of vanilla, suede, tobacco and mahogany. A bold yet smooth fragrance for those who appreciate warm, sweet and sophisticated scents.\n\nFull Product Description\n\nDiscover a fragrance that makes a statement with Smoked Oud & Vanilla by Maison Alhambra. This distinctive Eau de Parfum combines smoky warmth, aromatic spices and creamy sweetness to create an irresistible fragrance with depth and character.\n\nThe fragrance opens with an intriguing blend of coriander and saffron, delivering a warm, spicy introduction with an elegant touch.\n\nAt its heart, roasted coffee and smooth barley create a rich, comforting aroma, beautifully balanced by the delicate floral character of frangipani and narcissus.\n\nAs the fragrance develops, creamy vanilla blends with soft suede, smoky tobacco and rich mahogany, creating a warm, sensual and sophisticated finish that leaves a memorable impression.\n\nPerfectly suited to both men and women, Smoked Oud & Vanilla is an excellent choice for fragrance lovers who enjoy bold, warm and distinctive scents.\n\nFragrance Notes\n\nTop Notes\n\nCoriander\n\nSaffron\n\nHeart Notes\n\nCoffee\n\nFrangipani\n\nBarley\n\nNarcissus\n\nBase Notes\n\nVanilla\n\nSuede\n\nTobacco\n\nMahogany\n\nLongevity & Performance\n\nEstimated Longevity: Approximately 7–10 hours on skin.\n\nClothing Longevity: Can last longer depending on fabric.\n\nProjection: Moderate to strong, particularly during the opening.\n\nSillage: Noticeable and warm.\n\nBest Performance: Autumn, winter and cooler evenings.\n\nProduct Details\n\nBrand: Maison Alhambra\n\nFragrance: Smoked Oud & Vanilla\n\nVolume: 100ml\n\nConcentration: Eau de Parfum (EDP)\n\nFragrance Family: Woody, Smoky, Amber and Gourmand\n\nGender: Unisex\n\nOrigin: United Arab Emirates\n\nBest For\n\nEvening outings, romantic dates, formal occasions, winter wear and special celebrations.\n\nWhy You'll Love It\n\nRich combination of smoky woods and creamy vanilla.\n\nWarm coffee and spicy accords.\n\nSmooth tobacco and suede finish.\n\nUnisex fragrance with a distinctive personality.\n\nIdeal for customers who enjoy bold, comforting and luxurious scents.",
    category: 'Parfum',
    basePrice: 22,
    compareAtPrice: 29,
    rating: 5.0,
    reviewCount: 30,
    ingredients: 'Alcohol Denat., Parfum (Fine Fragrance Compounds), Aqua (Demineralized Water), Limonene, Linalool, Citronellol, Coumarin, Benzyl Benzoate.',
    howToUse: 'Mist directly onto pulse points including wrists, neck, and behind ears. Allow to settle naturally on the skin without rubbing to preserve the top and heart notes.',
    sourcingEthics: 'Artisanal perfume compound formulated with pure fragrance essences. Bottled in premium UV-protective flacons.',
    attributes: {
      badge: 'Bestseller',
      olfactoryFamily: 'Oriental Luxury Oud & Amber',
      concentration: 'Eau de Parfum',
    },
    images: [
      {
        id: 'img-prod_1794085327396_i42q-1',
        url: '/images/perfumes/smoked-oud-vanilla.jpg',
        alt: "Smoked Oud & Vanilla Eau de Parfum 100ml – Maison Alhambra",
        isHero: true,
      },
    ],
    variants: [
      {
        id: 'v-prod_1794085327396_i42q',
        sku: 'RYC-6_I42Q',
        title: 'Full Bottle Edition',
        price: 22,
        inventory: 15,
      },
    ],
  },

  {
    id: 'prod_1794093703109_a8mu',
    title: "Arabs of Obaiah Eau de Parfum 100ml",
    slug: 'arabs-of-obaiah-eau-de-parfum-100ml-03109',
    subtitle: "A Bold Expression of Arabian Luxury and Refined Elegance",
    summary: "Discover the captivating character of Arabs of Obaiah by REEF Perfumes. This sophisticated unisex fragrance blends the juicy sweetness of pineapple with luxurious leather and deep, smoky oud. Bold, distinctive and effortlessly elegant, it is designed for individuals who appreciate fragrances that make a lasting impression.",
    description: "Arabs of Obaiah Eau de Parfum 100ml – REEF Perfumes\n\nSubtitle: A Bold Expression of Arabian Luxury and Refined Elegance\n\nShort Summary\n\nDiscover the captivating character of Arabs of Obaiah by REEF Perfumes. This sophisticated unisex fragrance blends the juicy sweetness of pineapple with luxurious leather and deep, smoky oud. Bold, distinctive and effortlessly elegant, it is designed for individuals who appreciate fragrances that make a lasting impression.\n\nFull Product Description\n\nExperience the essence of Arabian luxury with Arabs of Obaiah from REEF Perfumes' exclusive Arabs Collection. Inspired by royalty, confidence and timeless Arabian heritage, this captivating Eau de Parfum combines vibrant fruity freshness with rich leather and precious oud.\n\nThe fragrance opens with a burst of juicy pineapple, creating a bright, refreshing and slightly sweet introduction that immediately captures attention.\n\nAs the scent develops, luxurious leather emerges at the heart, adding warmth, depth and a smooth, sophisticated character.\n\nThe fragrance settles into a rich oud base, delivering a deep, woody and subtly smoky finish that creates an elegant and memorable scent trail.\n\nCrafted for both men and women, Arabs of Obaiah is perfect for those who appreciate distinctive Arabian fragrances with a balance of freshness, strength and sophistication.\n\nFragrance Notes\n\nTop Note: Pineapple\n\nHeart Note: Leather\n\nBase Note: Oud\n\nLongevity & Performance\n\nEstimated Longevity: Approximately 6–8 hours on skin.\n\nProjection: Moderate to strong.\n\nSillage: Noticeable and distinctive.\n\nCharacter: Fruity, leathery, woody and smoky.\n\nBest Performance: Evening wear, cooler weather and special occasions.\n\nActual performance varies depending on skin chemistry, application and environment.\n\nProduct Details\n\nBrand: REEF Perfumes\n\nFragrance: Arabs of Obaiah\n\nCollection: Arabs Collection\n\nVolume: 100ml\n\nConcentration: Eau de Parfum (EDP)\n\nFragrance Family: Fruity, Leather and Oud\n\nGender: Unisex\n\nOrigin: Saudi Arabia\n\nBest For\n\nEvening outings, weddings, formal events, romantic occasions and everyday luxury.\n\nWhy You'll Love It\n\nRefreshing pineapple opening.\n\nRich and sophisticated leather heart.\n\nDeep Arabian oud finish.\n\nDistinctive unisex fragrance.\n\nBeautiful balance of fruity freshness and woody warmth.",
    category: 'Parfum',
    basePrice: 44.99,
    compareAtPrice: 59,
    rating: 5.0,
    reviewCount: 30,
    ingredients: 'Alcohol Denat., Parfum (Fine Fragrance Compounds), Aqua (Demineralized Water), Limonene, Linalool, Citronellol, Coumarin, Benzyl Benzoate.',
    howToUse: 'Mist directly onto pulse points including wrists, neck, and behind ears. Allow to settle naturally on the skin without rubbing to preserve the top and heart notes.',
    sourcingEthics: 'Artisanal perfume compound formulated with pure fragrance essences. Bottled in premium UV-protective flacons.',
    attributes: {
      badge: 'Bestseller',
      olfactoryFamily: 'Oriental Luxury Oud & Amber',
      concentration: 'Eau de Parfum',
    },
    images: [
      {
        id: 'img-prod_1794093703109_a8mu-1',
        url: '/images/perfumes/arabs-of-obaiah.jpg',
        alt: "Arabs of Obaiah Eau de Parfum 100ml",
        isHero: true,
      },
    ],
    variants: [
      {
        id: 'v-prod_1794093703109_a8mu',
        sku: 'RYC-9_A8MU',
        title: 'Full Bottle Edition',
        price: 44.99,
        inventory: 5,
      },
    ],
  },

  {
    id: 'prod_1794095029852_8cmd',
    title: "Oud Nuclear Eau de Parfum 60m",
    slug: 'oud-nuclear-eau-de-parfum-60m-29852',
    subtitle: "An Intense Fusion of Spicy Oud, Leather and Luxurious Woods",
    summary: "Discover Oud Nuclear by Fragrance World, a captivating unisex fragrance that combines warm saffron, aromatic cardamom and nutmeg with an elegant floral heart of jasmine, rose and osmanthus. Its rich base of oud, leather, patchouli, cedar and tonka bean creates a deep, smoky and sophisticated finish. Bold, distinctive and memorable, it is designed for fragrance lovers who appreciate powerful scents.",
    description: "Oud Nuclear Eau de Parfum 60ml – Fragrance World\n\nSubtitle: An Intense Fusion of Spicy Oud, Leather and Luxurious Woods\n\nShort Summary\n\nDiscover Oud Nuclear by Fragrance World, a captivating unisex fragrance that combines warm saffron, aromatic cardamom and nutmeg with an elegant floral heart of jasmine, rose and osmanthus. Its rich base of oud, leather, patchouli, cedar and tonka bean creates a deep, smoky and sophisticated finish. Bold, distinctive and memorable, it is designed for fragrance lovers who appreciate powerful scents.\n\nFull Product Description\n\nMake a lasting impression with Oud Nuclear by Fragrance World. This luxurious Eau de Parfum delivers an intriguing combination of oriental spices, elegant florals and deep woody accords, creating a fragrance that radiates confidence and sophistication.\n\nThe fragrance opens with an intense blend of cardamom, saffron and Indonesian nutmeg, delivering a warm, spicy introduction with an unmistakably luxurious character.\n\nAt its heart, delicate jasmine and Turkish rose blend with the subtly fruity, apricot-like aroma of osmanthus, adding floral richness and smoothness to the composition.\n\nAs the fragrance develops, a powerful base of precious oud, rich leather, earthy patchouli, cedarwood and creamy tonka bean creates a deep, smoky and sensual finish that leaves a memorable scent trail.\n\nDesigned for both men and women, Oud Nuclear is an excellent choice for those who appreciate bold Arabian fragrances with depth, warmth and character.\n\nFragrance Notes\n\nTop Notes\n\n* Cardamom\n* Saffron\n* Indonesian Nutmeg\n\nHeart Notes\n\n* Osmanthus\n* Jasmine\n* Turkish Rose\n\nBase Notes\n\n* Oud (Agarwood)\n* Leather\n* Patchouli\n* Cedarwood\n* Tonka Bean\n\nLongevity & Performance\n\n* Estimated Longevity: Approximately 8–10 hours on skin.\n* Clothing Longevity: Can last longer depending on fabric.\n* Projection: Strong, particularly during the opening.\n* Sillage: Noticeable and rich.\n* Best Performance: Autumn, winter and cooler evenings.\n\nPerformance varies depending on skin chemistry, application and environment.\n\nProduct Details\n\n* Brand: Fragrance World\n* Fragrance: Oud Nuclear\n* Volume: 60ml\n* Concentration: Eau de Parfum (EDP)\n* Fragrance Family: Oriental, Woody and Spicy\n* Gender: Unisex\n* Origin: United Arab Emirates\n\nBest For\n\nEvening outings, weddings, formal events, special occasions, romantic dates and cooler-weather wear.\n\nWhy You’ll Love It\n\n* Rich and luxurious Arabian fragrance character.\n* Bold combination of saffron, cardamom and nutmeg.\n* Elegant floral heart with rose and jasmine.\n* Deep oud, leather and woody dry-down.\n* Strong projection and impressive reported longevity.\n* Perfect for those who enjoy distinctive statement fragrances.",
    category: 'Parfum',
    basePrice: 20,
    compareAtPrice: 23,
    rating: 5.0,
    reviewCount: 30,
    ingredients: 'Alcohol Denat., Parfum (Fine Fragrance Compounds), Aqua (Demineralized Water), Limonene, Linalool, Citronellol, Coumarin, Benzyl Benzoate.',
    howToUse: 'Mist directly onto pulse points including wrists, neck, and behind ears. Allow to settle naturally on the skin without rubbing to preserve the top and heart notes.',
    sourcingEthics: 'Artisanal perfume compound formulated with pure fragrance essences. Bottled in premium UV-protective flacons.',
    attributes: {
      badge: 'Bestseller',
      olfactoryFamily: 'Oriental Luxury Oud & Amber',
      concentration: 'Eau de Parfum',
    },
    images: [
      {
        id: 'img-prod_1794095029852_8cmd-1',
        url: '/images/perfumes/oud-nuclear.jpg',
        alt: "Oud Nuclear Eau de Parfum 60m",
        isHero: true,
      },
    ],
    variants: [
      {
        id: 'v-prod_1794095029852_8cmd',
        sku: 'RYC-2_8CMD',
        title: 'Full Bottle Edition',
        price: 20,
        inventory: 15,
      },
    ],
  },

  {
    id: 'prod_1794175252508_0fas',
    title: "REEF 33 Eau de Parfum 100ml – REEF Perfumes",
    slug: 'reef-33-eau-de-parfum-100ml-reef-perfumes-52508',
    subtitle: "The Power of Royal Saffron, Aromatic Freshness and Deep Oud",
    summary: "Discover REEF 33, a distinctive unisex fragrance that combines the luxurious warmth of Indian saffron, the refreshing aroma of rosemary and the deep richness of precious oud. Bold, elegant and captivating, this sophisticated composition creates a memorable scent for those who appreciate refined Arabian perfumery.",
    description: "REEF 33 Eau de Parfum 100ml – REEF Perfumes\n\nSubtitle: The Power of Royal Saffron, Aromatic Freshness and Deep Oud\n\nShort Summary\n\nDiscover REEF 33, a distinctive unisex fragrance that combines the luxurious warmth of Indian saffron, the refreshing aroma of rosemary and the deep richness of precious oud. Bold, elegant and captivating, this sophisticated composition creates a memorable scent for those who appreciate refined Arabian perfumery.\n\nFull Product Description\n\nMake an unforgettable impression with REEF 33 by REEF Perfumes. Inspired by the atmosphere of a cool, rainy November evening, this luxurious fragrance captures the perfect balance between aromatic freshness, warm spices and rich woody depth.\n\nThe fragrance opens with royal Indian saffron, delivering a warm, subtly spicy introduction that immediately creates an impression of elegance and sophistication.\n\nAt its heart, fresh rosemary introduces an invigorating herbal character, beautifully balancing the warmth of saffron with aromatic freshness.\n\nAs the fragrance develops, luxurious oud emerges, creating a deep, smoky and woody finish that adds richness, character and a distinctive scent trail.\n\nCrafted for both men and women, REEF 33 is an excellent choice for individuals who appreciate bold, sophisticated fragrances with a luxurious Arabian identity.\n\nFragrance Notes\n\nTop Note\n\nIndian Saffron\n\nHeart Note\n\nFresh Rosemary\n\nBase Note\n\nPrecious Oud (Agarwood)\n\nLongevity & Performance\n\nEstimated Longevity: Approximately 6–8 hours on skin.\n\nClothing Longevity: May last considerably longer depending on fabric.\n\nProjection: Above average to strong.\n\nSillage: Noticeable and distinctive.\n\nBest Performance: Evening wear, cooler weather and special occasions.\n\nProduct Details\n\nBrand: REEF Perfumes\n\nFragrance: REEF 33\n\nVolume: 100ml\n\nConcentration: Eau de Parfum (EDP)\n\nFragrance Family: Oriental, Woody and Aromatic\n\nGender: Unisex\n\nOrigin: Saudi Arabia\n\nPerfumer: Kevin Mathys\n\nBest For\n\nFormal events, evening outings, business meetings, special occasions and everyday signature wear.\n\nWhy You'll Love It\n\nLuxurious Indian saffron opening.\n\nFresh and aromatic rosemary heart.\n\nDeep, sophisticated oud finish.\n\nDistinctive unisex fragrance.\n\nElegant balance of spicy warmth and woody freshness.\n\nPerfect for lovers of premium Arabian fragrances.",
    category: 'Parfum',
    basePrice: 42,
    compareAtPrice: 55,
    rating: 5.0,
    reviewCount: 30,
    ingredients: 'Alcohol Denat., Parfum (Fine Fragrance Compounds), Aqua (Demineralized Water), Limonene, Linalool, Citronellol, Coumarin, Benzyl Benzoate.',
    howToUse: 'Mist directly onto pulse points including wrists, neck, and behind ears. Allow to settle naturally on the skin without rubbing to preserve the top and heart notes.',
    sourcingEthics: 'Artisanal perfume compound formulated with pure fragrance essences. Bottled in premium UV-protective flacons.',
    attributes: {
      badge: 'Bestseller',
      olfactoryFamily: 'Oriental Luxury Oud & Amber',
      concentration: 'Eau de Parfum',
    },
    images: [
      {
        id: 'img-prod_1794175252508_0fas-1',
        url: '/images/perfumes/reef-33.jpg',
        alt: "REEF 33 Eau de Parfum 100ml – REEF Perfumes",
        isHero: true,
      },
    ],
    variants: [
      {
        id: 'v-prod_1794175252508_0fas',
        sku: 'RYC-8_0FAS',
        title: 'Full Bottle Edition',
        price: 42,
        inventory: 10,
      },
    ],
  },

  {
    id: 'prod_1794255618877_2882',
    title: "Dirham Gold Eau de Parfum 100ml – Ard Al Zaafaran",
    slug: 'dirham-gold-eau-de-parfum-100ml-ard-al-zaafaran-18877',
    subtitle: "A Golden Blend of Fruity Freshness, Floral Elegance and Warm Woods",
    summary: "Discover Dirham Gold by Ard Al Zaafaran, a sophisticated unisex fragrance that combines refreshing pineapple and bergamot with a rich floral heart of rose, jasmine, vanilla and aromatic spices. Its smooth base of sandalwood, tonka bean and vetiver creates a warm, creamy and elegant finish. A versatile fragrance for those who appreciate fresh, sweet and woody scents.",
    description: "Dirham Gold Eau de Parfum 100ml – Ard Al Zaafaran\n\nSubtitle: A Golden Blend of Fruity Freshness, Floral Elegance and Warm Woods\n\nShort Summary\n\nDiscover Dirham Gold by Ard Al Zaafaran, a sophisticated unisex fragrance that combines refreshing pineapple and bergamot with a rich floral heart of rose, jasmine, vanilla and aromatic spices. Its smooth base of sandalwood, tonka bean and vetiver creates a warm, creamy and elegant finish. A versatile fragrance for those who appreciate fresh, sweet and woody scents.\n\nFull Product Description\n\nExperience everyday luxury with Dirham Gold by Ard Al Zaafaran. This captivating Eau de Parfum brings together vibrant fruity notes, delicate florals and warm woody accords to create a beautifully balanced fragrance.\n\nThe fragrance opens with refreshing herbal notes, juicy pineapple and sparkling bergamot, delivering a bright and uplifting first impression.\n\nAt its heart, creamy vanilla, aromatic pepper, elegant jasmine, romantic rose and delicate carnation create a beautiful combination of floral sweetness and subtle spice.\n\nAs the fragrance settles, smooth sandalwood blends with tonka bean and earthy vetiver, leaving a warm, creamy and sophisticated scent trail.\n\nDesigned for both men and women, Dirham Gold is an excellent choice for fragrance lovers who appreciate elegant, versatile scents that balance freshness with warmth.\n\nFragrance Notes\n\nTop Notes\n\nHerbal Notes\n\nPineapple\n\nBergamot\n\nHeart Notes\n\nVanilla\n\nBlack Pepper\n\nJasmine\n\nRose\n\nCarnation\n\nBase Notes\n\nSandalwood\n\nTonka Bean\n\nVetiver\n\nLongevity & Performance\n\nEstimated Longevity: Approximately 5–8 hours on skin.\n\nClothing Longevity: May last longer depending on fabric.\n\nProjection: Moderate, particularly during the opening.\n\nSillage: Moderate and noticeable.\n\nDry-Down: Smooth, warm, creamy and woody.\n\nBest Performance: Everyday wear, office settings and casual occasions.\n\nPerformance varies depending on skin chemistry, application and environment. Some retailers report longer wear times.\n\nProduct Details\n\nBrand: Ard Al Zaafaran\n\nFragrance: Dirham Gold\n\nVolume: 100ml\n\nConcentration: Eau de Parfum (EDP)\n\nFragrance Family: Fruity, Floral and Woody\n\nGender: Unisex\n\nOrigin: United Arab Emirates\n\nBest For\n\nEveryday wear, office settings, casual outings, daytime events, romantic occasions and gifting.\n\nWhy You'll Love It\n\nRefreshing pineapple and bergamot opening.\n\nBeautiful floral combination of rose and jasmine.\n\nCreamy vanilla and warm spicy character.\n\nSmooth sandalwood and tonka bean finish.\n\nVersatile fragrance suitable for men and women.\n\nExcellent option for everyday fragrance lovers.",
    category: 'Parfum',
    basePrice: 2,
    compareAtPrice: 10,
    rating: 5.0,
    reviewCount: 30,
    ingredients: 'Alcohol Denat., Parfum (Fine Fragrance Compounds), Aqua (Demineralized Water), Limonene, Linalool, Citronellol, Coumarin, Benzyl Benzoate.',
    howToUse: 'Mist directly onto pulse points including wrists, neck, and behind ears. Allow to settle naturally on the skin without rubbing to preserve the top and heart notes.',
    sourcingEthics: 'Artisanal perfume compound formulated with pure fragrance essences. Bottled in premium UV-protective flacons.',
    attributes: {
      badge: 'Bestseller',
      olfactoryFamily: 'Oriental Luxury Oud & Amber',
      concentration: 'Eau de Parfum',
    },
    images: [
      {
        id: 'img-prod_1794255618877_2882-1',
        url: '/images/perfumes/dirham-gold.jpg',
        alt: "Dirham Gold Eau de Parfum 100ml – Ard Al Zaafaran",
        isHero: true,
      },
    ],
    variants: [
      {
        id: 'v-prod_1794255618877_2882',
        sku: 'RYC-7_2882',
        title: 'Full Bottle Edition',
        price: 2,
        inventory: 1,
      },
    ],
  },

  // -------------------------------------------------------------
  // BOTANICAL SKINCARE
  // -------------------------------------------------------------
  {
    id: 'prod-skin-1',
    title: 'Botanical Radiance Cellular Serum',
    slug: 'botanical-radiance-cellular-serum',
    subtitle: 'Quadruple Hyaluronic Actives • Cold-Extracted Rosehip & Marine Algae',
    summary: 'A potent, multi-molecular weight hydrating serum designed to firm, restore cellular bounce, and illuminate fatigued skin with zero greasy residue.',
    description: 'Formulated with ultra-low and high-molecular weight bio-fermented hyaluronic acid, cold-pressed Chilean rosehip seed, and Brittany brown algae extract. Delivers multi-depth hydration while shielding delicate lipid barriers against modern urban pollutants.',
    category: 'Botanical Skincare',
    basePrice: 145,
    compareAtPrice: 170,
    rating: 4.9,
    reviewCount: 168,
    ingredients: 'Aqua, Rosa Canina (Rosehip) Seed Extract, Sodium Hyaluronate Multi-Molecular Complex, Laminaria Ochroleuca Extract, Niacinamide (5%), Camellia Sinensis Leaf Extract, Glycerin, Ferulic Acid, Ubiquinone (CoQ10).',
    howToUse: 'Dispense 4 to 5 drops onto clean fingertips each morning and evening. Press gently into face, neck, and décolletage using upward gliding motions before applying your restorative cream.',
    sourcingEthics: 'Wildcrafted rosehip harvested at dawn in Chilean Patagonia. Eco-certified ocean kelp from marine conservation reserves. Housed in recyclable heavyweight biophotonic violet glass.',
    attributes: {
      badge: 'Bestseller',
      skinType: ['All Skin Types', 'Dehydrated', 'Sensitive', 'Mature'],
      keyActives: 'Quadruple Hyaluronic Acid, 5% Niacinamide, CoQ10, Marine Kelp',
      texture: 'Weightless micro-emulsion',
      volumeMl: 50,
    },
    images: [
      {
        id: 'img-br-hero',
        url: '/images/products/botanical-serum.jpg',
        alt: 'Botanical Radiance Cellular Serum with precision dropper',
        isHero: true,
      },
    ],
    variants: [
      {
        id: 'v-br-50ml',
        sku: 'RY-BRS-50',
        title: '50ml / 1.7 fl. oz. Dropper Bottle',
        price: 145,
        compareAtPrice: 170,
        inventory: 42,
        attributes: { size: '50ml' },
      },
      {
        id: 'v-br-30ml',
        sku: 'RY-BRS-30',
        title: '30ml / 1.0 fl. oz. Discovery Size',
        price: 95,
        inventory: 28,
        attributes: { size: '30ml' },
      },
    ],
  },
  {
    id: 'prod-skin-2',
    title: 'Regenerative Barrier Night Balm',
    slug: 'regenerative-barrier-night-balm',
    subtitle: 'Blue Tansy, Fermented Reishi & Ceramide Barrier Therapy',
    summary: 'A melt-on-contact night balm that soothes inflammation, locks in moisture, and restores compromised skin barriers while you sleep.',
    description: 'Transformative overnight lipid therapy. Moroccan blue tansy and adaptogenic reishi mushroom extract neutralize daily environmental damage, while biomimetic ceramides reinforce the natural skin envelope for waking with calm, plump, velvety skin.',
    category: 'Botanical Skincare',
    basePrice: 125,
    rating: 4.9,
    reviewCount: 89,
    ingredients: 'Butyrospermum Parkii (Shea) Butter, Simmondsia Chinensis (Jojoba) Seed Oil, Tanacetum Annuum (Blue Tansy) Flower Oil, Ganoderma Lucidum (Reishi) Extract, Ceramide NP, Squalane, Bisabolol, Helichrysum Italicum Extract.',
    howToUse: 'Warm a pea-sized portion between clean fingertips to transform the rich balm into a silky golden oil. Press gently over face as the sealing step of your evening ritual.',
    sourcingEthics: 'Organic Moroccan blue tansy ethically distilled in the Atlas Mountains. Zero synthetic fragrances, silicones, or petroleum derivatives.',
    attributes: {
      badge: 'Editor’s Choice',
      skinType: ['Dry', 'Sensitive', 'Compromised Barrier', 'Redness-Prone'],
      keyActives: 'Moroccan Blue Tansy, Fermented Reishi, Ceramide NP',
      texture: 'Velvet balm-to-oil',
      volumeMl: 60,
    },
    images: [
      {
        id: 'img-nb-hero',
        url: '/images/products/night-balm.jpg',
        alt: 'Regenerative Barrier Night Balm in minimalist porcelain jar',
        isHero: true,
      },
    ],
    variants: [
      {
        id: 'v-nb-60ml',
        sku: 'RY-RBN-60',
        title: '60ml / 2.0 oz. Porcelain Jar',
        price: 125,
        inventory: 31,
        attributes: { size: '60ml' },
      },
    ],
  },

  // -------------------------------------------------------------
  // -------------------------------------------------------------
  // BODY & BATH
  // -------------------------------------------------------------
  {
    id: 'prod-body-1',
    title: 'Velvet Botanique Nourishing Body Wash',
    slug: 'velvet-botanique-nourishing-body-wash',
    subtitle: 'Cold-Pressed Jojoba, Atlas Cedarwood & Calabrian Bergamot',
    summary: 'A low-foaming, gentle conditioning body wash that transforms daily showers into an invigorating sensory ritual without stripping essential skin lipids.',
    description: 'Enriched with cold-pressed organic jojoba, sweet almond oil, and pure botanical isolates. Cleanses delicately while enveloping the senses in grounding cedarwood, bright bergamot zest, and comforting warm amber.',
    category: 'Body & Bath',
    basePrice: 65,
    rating: 4.8,
    reviewCount: 112,
    ingredients: 'Aqua, Cocamidopropyl Hydroxysultaine, Disodium Cocoamphodiacetate, Simmondsia Chinensis Seed Oil, Prunus Amygdalus Dulcis Oil, Cedrus Atlantica Bark Oil, Citrus Aurantium Bergamia Fruit Oil, Tocopherol, Citric Acid.',
    howToUse: 'Dispense into palms or natural sea sponge. Work into a silky, low-foaming emulsion across wet skin. Inhale deeply the uplifting aromatic vapours and rinse thoroughly.',
    sourcingEthics: 'Formulated with cold-extracted Mediterranean citrus and sustainably managed Moroccan cedar groves. Housed in 100% post-consumer recycled luxury amber bottle.',
    attributes: {
      badge: 'Daily Essential',
      scentProfile: 'Crisp Cedar, Bergamot & Golden Amber',
      sulfateFree: true,
      volumeMl: 500,
    },
    images: [
      {
        id: 'img-vb-hero',
        url: '/images/products/body-wash.jpg',
        alt: 'Velvet Botanique Body Wash sleek amber pump dispenser',
        isHero: true,
      },
    ],
    variants: [
      {
        id: 'v-vb-500ml',
        sku: 'RY-VBW-500',
        title: '500ml / 16.9 fl. oz. Pump Bottle',
        price: 65,
        inventory: 54,
        attributes: { size: '500ml' },
      },
      {
        id: 'v-vb-refill',
        sku: 'RY-VBW-REF',
        title: '1000ml Refill Pouch (Eco-Pack)',
        price: 98,
        compareAtPrice: 130,
        inventory: 30,
        attributes: { size: '1000ml' },
      },
    ],
  },
  {
    id: 'prod-body-2',
    title: 'Exfoliant de Soie Mineral Body Polish',
    slug: 'exfoliant-soie-mineral-body-polish',
    subtitle: 'Dead Sea Minerals, French Pink Clay & Sweet Almond Oil',
    summary: 'A polishing mineral treatment that gently buffs away dull cellular debris, revealing velvety smooth, radiant, and intensely hydrated skin.',
    description: 'Fine Dead Sea salt crystals suspended in a nourishing matrix of organic sweet almond oil and mineral-rich French pink clay. Melting gently against warm skin, it leaves an invisible, supple veil of hydration and a delicate veil of crushed fig and neroli.',
    category: 'Body & Bath',
    basePrice: 85,
    rating: 4.9,
    reviewCount: 63,
    ingredients: 'Maris Sal (Dead Sea Salts), Helianthus Annuus Seed Oil, Prunus Amygdalus Dulcis Oil, Kaolin (French Pink Clay), Rosa Damascena Flower Oil, Citrus Aurantium Dulcis Peel Oil, Tocopherol.',
    howToUse: 'Massage gently into damp skin using circular sweeping motions, paying special attention to dry areas like elbows, knees, and heels. Rinse with warm water and pat dry.',
    sourcingEthics: 'Unrefined solar-evaporated Dead Sea salts harvested ethically. Packaged in a reusable weighted matte glass jar.',
    attributes: {
      badge: 'Spa Ritual',
      texture: 'Rich mineral salt-in-oil paste',
      volumeMl: 300,
    },
    images: [
      {
        id: 'img-es-hero',
        url: '/images/products/body-polish.jpg',
        alt: 'Exfoliant de Soie in weighted matte glass jar',
        isHero: true,
      },
    ],
    variants: [
      {
        id: 'v-es-300g',
        sku: 'RY-ESP-300',
        title: '300g / 10.5 oz. Glass Vessel',
        price: 85,
        inventory: 40,
        attributes: { size: '300g' },
      },
    ],
  },

  // -------------------------------------------------------------
  // HOME & LIVING
  // -------------------------------------------------------------
  {
    id: 'prod-home-1',
    title: 'Flamme Noire Artisanal Scented Candle',
    slug: 'flamme-noire-scented-candle',
    subtitle: 'Smoked Oud, Fig Leaf & Vetiver • Hand-Poured Ceramic Vessel',
    summary: 'A sophisticated atmospheric candle blending mineral wax, organic beeswax, and pure fragrance oils, poured by hand into matte-glazed ceramic.',
    description: 'Flamme Noire transforms living spaces into an intimate sanctuary. Notes of sun-warmed wild fig leaf and dry green cypress give way to a brooding heart of smoked oud, Haitian vetiver, and black tea leaves. Clean, slow burn with double unbleached cotton wicks.',
    category: 'Home & Living',
    basePrice: 95,
    rating: 5.0,
    reviewCount: 47,
    ingredients: '100% Non-GMO Soy & Organic Beeswax Blend, Lead-Free Cotton Wicks, Pure Botanical Isolates and Perfume-Grade Fragrance Oils. Clean Burning.',
    howToUse: 'On initial burn, allow the wax pool to reach the vessel perimeter (approx. 2 hours) to avoid tunneling. Trim wick to 5mm before every lighting. Burn time approximately 65 hours.',
    sourcingEthics: 'Vessels handcrafted in micro-batches by master potters in Limoges, France. Designed to be repurposed as an espresso cup, vanity cup, or planter once candle concludes.',
    attributes: {
      badge: 'New In',
      burnTime: 'Approx. 65 Hours',
      waxType: 'Botanical Soy & Beeswax Blend',
      vesselMaterial: 'Handcrafted Limoges Ceramic (Matte Onyx)',
      fragranceNotes: ['Wild Fig Leaf', 'Smoked Cambodian Oud', 'Haitian Vetiver', 'Black Tea'],
    },
    images: [
      {
        id: 'img-fn-hero',
        url: '/images/products/scented-candle.jpg',
        alt: 'Flamme Noire ceramic scented candle with glowing warm flame',
        isHero: true,
      },
    ],
    variants: [
      {
        id: 'v-fn-320g',
        sku: 'RY-FNC-320',
        title: '320g / 11.3 oz. Handcrafted Ceramic',
        price: 95,
        inventory: 38,
        attributes: { size: '320g' },
      },
    ],
  },
  {
    id: 'prod-home-2',
    title: 'Brume d’Intérieur Atmosphere & Linen Mist',
    slug: 'brume-d-interieur-linen-room-mist',
    subtitle: 'White Tea, French Lavender & Roman Chamomile • Calming Atmosphere',
    summary: 'An ethereal room and textile mist that gently scents bed linens, living spaces, and woollen throws with soothing notes of white tea, sage, and iris.',
    description: 'Formulated with organic distilled witch hazel and high-altitude French lavender, Brume d’Intérieur refreshes home textiles and instantly settles evening living spaces into tranquil serenity without synthetic aerosols.',
    category: 'Home & Living',
    basePrice: 75,
    rating: 4.8,
    reviewCount: 38,
    ingredients: 'Aqua, Organic Hamamelis Virginiana (Witch Hazel) Water, Lavandula Angustifolia Oil, Salvia Sclarea (Clary Sage) Oil, Anthemis Nobilis Flower Oil, Iris Pallida Root Extract.',
    howToUse: 'Mist liberally into the center of any room or lightly across bed linens, cushions, and curtains from 30cm away. Suitable for all natural fabrics.',
    sourcingEthics: 'Distilled using mountain spring water and organic French essential oils. Hand-bottled in frosted recycled glass with precision micro-fine mist actuator.',
    attributes: {
      volumeMl: 200,
      notes: 'White Tea, High-Altitude Lavender, Clary Sage, Florentine Iris',
    },
    images: [
      {
        id: 'img-bi-hero',
        url: '/images/products/linen-mist.jpg',
        alt: 'Brume d’Intérieur glass mist bottle in morning light',
        isHero: true,
      },
    ],
    variants: [
      {
        id: 'v-bi-200ml',
        sku: 'RY-BIM-200',
        title: '200ml / 6.8 fl. oz. Frosted Bottle',
        price: 75,
        inventory: 26,
        attributes: { size: '200ml' },
      },
    ],
  },

  // -------------------------------------------------------------
  // ACCESSORIES
  // -------------------------------------------------------------
  {
    id: 'prod-acc-1',
    title: 'Artisan Leather Travel Case',
    slug: 'cuir-artisan-travel-flacon-case',
    subtitle: 'Hand-Stitched Full-Grain Italian Nappa Leather • Obsidian Finish',
    summary: 'A bespoke travel companion sculpted to cradle your 50ml or 100ml fragrance bottle and essentials during worldwide voyages.',
    description: 'Handcrafted outside Florence from supple vegetable-tanned full-grain Italian Nappa leather. Features hand-painted beveled edges, solid brass hardware with palladium plating, and a padded microfiber interior that safeguards delicate crystal vessels.',
    category: 'Accessories',
    basePrice: 185,
    compareAtPrice: 215,
    rating: 5.0,
    reviewCount: 31,
    ingredients: '100% Certified Full-Grain Tuscan Vegetable-Tanned Nappa Leather, Solid Brass Hardware with Palladium Plating, Protective Suede-Microfiber Lining.',
    howToUse: 'Insert 50ml or 100ml Rycarix crystal bottle securely into the central padded sleeve. Snap magnetic brass clasp to seal. Wipe with soft dry cloth to preserve natural patina.',
    sourcingEthics: 'Vegetable-tanned with tree bark tannins without toxic chromium. Crafted by third-generation Tuscan leather artisans operating under fair wage standards.',
    attributes: {
      badge: 'Artisan Craft',
      material: 'Vegetable-Tanned Italian Nappa Leather',
      origin: 'Florence, Italy',
      dimensions: '14cm H x 7cm W x 7cm D',
      hardware: 'Palladium-Plated Solid Brass',
    },
    images: [
      {
        id: 'img-lc-hero',
        url: '/images/products/leather-travel-case.jpg',
        alt: 'Artisan leather travel case with fine saddle stitching detail',
        isHero: true,
      },
    ],
    variants: [
      {
        id: 'v-lc-obsidian',
        sku: 'RY-LTC-OBS',
        title: 'Obsidian Black / Palladium',
        price: 185,
        compareAtPrice: 215,
        inventory: 18,
        attributes: { color: 'Obsidian Black' },
      },
      {
        id: 'v-lc-cognac',
        sku: 'RY-LTC-COG',
        title: 'Saddle Cognac / Warm Gold',
        price: 185,
        compareAtPrice: 215,
        inventory: 12,
        attributes: { color: 'Saddle Cognac' },
      },
    ],
  },
  {
    id: 'prod-acc-2',
    title: 'Pure Mulberry Silk Slumber Mask',
    slug: 'pure-mulberry-silk-sleep-mask',
    subtitle: 'Grade 6A 22-Momme Mulberry Silk • Zero Friction Slumber',
    summary: 'An ultra-soft, light-blocking luxury sleep mask designed to protect delicate eye-contour skin and eyelashes while inducing profound restorative slumber.',
    description: 'Woven from 100% long-strand Grade 6A organic mulberry silk at a substantial 22-momme weight. Naturally non-absorbent, it ensures your nightly botanical skincare and eye serums remain in the skin rather than soaking into bedding.',
    category: 'Accessories',
    basePrice: 68,
    rating: 4.9,
    reviewCount: 74,
    ingredients: '100% Grade 6A Organic Long-Strand Mulberry Silk (Outer and Fill), OEKO-TEX Standard 100 Certified Non-Toxic Natural Dyes.',
    howToUse: 'Slip over eyes before sleep or long-haul travel. Hand wash in cool water with gentle silk detergent and air dry flat in shade.',
    sourcingEthics: 'OEKO-TEX Standard 100 certified free from harmful chemical residues. Delivered in a signature keepsake embossed slide box.',
    attributes: {
      badge: 'Best Travel',
      material: '100% 22-Momme Grade 6A Mulberry Silk',
      certification: 'OEKO-TEX Standard 100',
      care: 'Hand wash cold, line dry in shade',
    },
    images: [
      {
        id: 'img-sm-hero',
        url: '/images/products/silk-sleep-mask.jpg',
        alt: 'Pure Mulberry Silk Sleep Mask in rich charcoal silk setting',
        isHero: true,
      },
    ],
    variants: [
      {
        id: 'v-sm-charcoal',
        sku: 'RY-MSM-CHR',
        title: 'Deep Charcoal / One Size',
        price: 68,
        inventory: 45,
        attributes: { color: 'Deep Charcoal' },
      },
      {
        id: 'v-sm-pearl',
        sku: 'RY-MSM-PRL',
        title: 'Soft Pearl Champagne / One Size',
        price: 68,
        inventory: 35,
        attributes: { color: 'Pearl Champagne' },
      },
    ],
  },
];

export const PRESS_MENTIONS: PressMention[] = [
  {
    publication: 'Vogue International',
    quote: 'Rycarix demonstrates that modern luxury e-commerce can achieve both supreme efficacy and poetic sensory grace.',
    date: 'Autumn Issue',
  },
  {
    publication: 'Wallpaper*',
    quote: 'From luxury glass bottles to hand-poured ceramics, every single piece is treated as an enduring work of design.',
    date: 'Design Awards',
  },
  {
    publication: 'GQ Style',
    quote: 'Santal Noir is quite simply one of the finest, most enduring sandalwood parfums created in the last decade.',
    date: 'Fragrance Edit',
  },
  {
    publication: 'Harper’s Bazaar',
    quote: 'The Botanical Radiance Serum and Silk Mask transformed our nightly ritual into an unhurried retreat.',
    date: 'Beauty Highlights',
  },
];

export const CUSTOMER_REVIEWS: ReviewItem[] = [
  {
    id: 'rev-1',
    author: 'Elena Rostova',
    location: 'Edinburgh, UK',
    rating: 5,
    productTitle: 'Botanical Radiance Cellular Serum',
    category: 'Skincare',
    title: 'Cellular restoration that truly delivers',
    comment: 'Within ten days of using this serum morning and evening, my skin texture underwent a visible transformation. The packaging and Klarna checkout were completely seamless.',
    verified: true,
    date: '2 weeks ago',
  },
  {
    id: 'rev-2',
    author: 'Julian M. Thorne',
    location: 'London, UK',
    rating: 5,
    productTitle: 'Santal Noir Extrait de Parfum',
    category: 'Parfum',
    title: 'Monumental scent and depth',
    comment: 'This is authentic artisanal parfum. The smoky cardamom and Mysore sandalwood linger effortlessly into the next morning. Arrived in a stunning presentation box with complimentary samples.',
    verified: true,
    date: '3 weeks ago',
  },
  {
    id: 'rev-3',
    author: 'Clara Delacroix',
    location: 'Bath, UK',
    rating: 5,
    productTitle: 'Flamme Noire Artisanal Candle',
    category: 'Home & Candles',
    title: 'The Limoges ceramic vessel is exquisite',
    comment: 'The scent throw fills our entire Bath townhouse with warm fig and oud without ever being overpowering. When finished, I will keep the ceramic container for my vanity.',
    verified: true,
    date: '1 month ago',
  },
  {
    id: 'rev-4',
    author: 'Aria Chen',
    location: 'Manchester, UK',
    rating: 5,
    productTitle: 'L’Huile Sublime Regenerative Nectar',
    category: 'Hair',
    title: 'Weightless shine with zero buildup',
    comment: 'Transformed my bleached hair ends. Two drops warm in palms and it absorbs instantly leaving hair like spun silk. Split my purchase with Klarna in 3 payments with zero hassle.',
    verified: true,
    date: '1 month ago',
  },
];

export const mockProducts: Product[] = PRODUCTS.map((p) => ({
  id: p.id,
  name: p.title,
  title: p.title,
  slug: p.slug,
  description: p.description || p.summary || p.subtitle || '',
  price: Number(p.basePrice),
  compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : undefined,
  stock: Number(p.variants?.[0]?.inventory ?? 20),
  category: normalizeCategorySlug(p.category),
  images: Array.isArray(p.images)
    ? p.images.map((img) => (typeof img === 'string' ? img : img.url))
    : ['/images/media_1791069473262.jpg'],
  featured: true,
  rating: Number(p.rating ?? 5.0),
  reviewsCount: Number(p.reviewCount ?? 0),
  sku: p.variants?.[0]?.sku || `RYC-${p.id.slice(0, 6).toUpperCase()}`,
  createdAt: new Date().toISOString(),
}));

