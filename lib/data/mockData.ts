import { ProductItem } from '@/lib/types/ecommerce';

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
    id: 'cat-fragrance',
    name: 'Haute Parfumerie',
    slug: 'fragrance',
    description: 'Rare extrait concentrations aged in charred oak casks with 24-hour sillage.',
    image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1200&auto=format&fit=crop',
    productCount: 2,
    featuredTag: 'Limited Harvest',
  },
  {
    id: 'cat-skincare',
    name: 'Botanical Skincare',
    slug: 'skincare',
    description: 'High-potency cellular serums, barrier restorative balms, and cold-extracted actives.',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=1200&auto=format&fit=crop',
    productCount: 2,
    featuredTag: 'Bestseller',
  },
  {
    id: 'cat-haircare',
    name: 'Hair Care & Scalp',
    slug: 'haircare',
    description: 'Biomimetic ceramides, vegan silk polypeptides, and restorative nectar elixirs.',
    image: 'https://images.unsplash.com/photo-1608248597359-57e3f1638271?q=80&w=1200&auto=format&fit=crop',
    productCount: 3,
  },
  {
    id: 'cat-body',
    name: 'Body & Bath',
    slug: 'body-bath',
    description: 'Sensory mineral body polishes, velvety botanical washes, and restorative botanicals.',
    image: 'https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?q=80&w=1200&auto=format&fit=crop',
    productCount: 2,
  },
  {
    id: 'cat-home',
    name: 'Home & Living',
    slug: 'home-living',
    description: 'Hand-poured ceramic bougies, room mists, and artisanal atmospheric objects.',
    image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=1200&auto=format&fit=crop',
    productCount: 2,
    featuredTag: 'New In',
  },
  {
    id: 'cat-accessories',
    name: 'Accessories & Fine Objects',
    slug: 'accessories',
    description: 'Hand-stitched Italian leather travel cases and 22-momme pure mulberry silk goods.',
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=1200&auto=format&fit=crop',
    productCount: 2,
  },
];

export const PRODUCTS: ProductItem[] = [
  // -------------------------------------------------------------
  // HAUTE PARFUMERIE
  // -------------------------------------------------------------
  {
    id: 'prod-perfume-1',
    title: 'Santal Noir Extrait de Parfum',
    slug: 'santal-noir-extrait-de-parfum',
    subtitle: 'Haute Parfumerie • 32% Rare Essence Concentration',
    summary: 'A brooding, sculptural ode to Mysore sandalwood enveloped in smoky cardamom, violet concrete, and tactile black leather.',
    description: 'Santal Noir is formulated at an uncompromising 32% extrait concentration. It evokes the sensory threshold between ancient Japanese temple woodwork and candlelit midnight salon gatherings in Paris. Lingers on the skin and silk scarves for in excess of twenty-four hours.',
    category: 'Haute Parfumerie',
    basePrice: 280,
    compareAtPrice: 310,
    rating: 5.0,
    reviewCount: 98,
    ingredients: 'Alcohol Denat. (Organic French Wheat), Parfum (Pure Essential Oils & Absolutes), Aqua (Purified Mountain Spring Water), Santalum Album Oil, Farnesol, Coumarin, Limonene, Linalool, Alpha-Isomethyl Ionone.',
    howToUse: 'Mist sparingly onto primary pulse points: the carotid hollow of the neck, wrist tendons, and the nape of the hair. Avoid rubbing wrists together, allowing the volatile top notes to evolve naturally.',
    sourcingEthics: 'Formulated with government-certified sustainable plantation Mysore sandalwood from protected groves. Cruelty-free, vegan, aged in charred French oak barrels for 90 days before cold bottling.',
    attributes: {
      badge: 'Iconic Scent',
      olfactoryFamily: 'Smoky Woody Floral',
      concentration: 'Extrait de Parfum (32%)',
      topNotes: ['Smoked Green Cardamom', 'Violet Leaf Concrete', 'Bergamot Zest'],
      heartNotes: ['Orris Root Butter', 'Cypriol', 'Papyrus', 'Turkish Rose Absolue'],
      baseNotes: ['Mysore Sandalwood', 'Smoked Birch Tar', 'Raw Ambergris Accord', 'Atlas Cedar'],
      flaconOrigin: 'Heavyweight hand-polished smoked flint crystal',
    },
    images: [
      {
        id: 'img-sn-hero',
        url: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1200&auto=format&fit=crop',
        alt: 'Santal Noir crystal flacon in chiaroscuro studio lighting',
        isHero: true,
      },
      {
        id: 'img-sn-texture',
        url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1200&auto=format&fit=crop',
        alt: 'Macro shot of charred sandalwood grain and amber resin crystals',
        isTexture: true,
      },
      {
        id: 'img-sn-lifestyle',
        url: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=1200&auto=format&fit=crop',
        alt: 'Editorial still life with perfume mist and stone slab',
      },
    ],
    variants: [
      {
        id: 'v-sn-100ml',
        sku: 'RY-SN-100',
        title: '100ml / 3.4 fl. oz. Crystal Flacon',
        price: 280,
        inventory: 35,
        attributes: { size: '100ml' },
      },
      {
        id: 'v-sn-50ml',
        sku: 'RY-SN-50',
        title: '50ml / 1.7 fl. oz. Signature Edition',
        price: 185,
        inventory: 20,
        attributes: { size: '50ml' },
      },
    ],
  },
  {
    id: 'prod-perfume-2',
    title: 'Ambre Céleste Extrait de Parfum',
    slug: 'ambre-celeste-extrait-de-parfum',
    subtitle: 'Luminous Solar Amber & White Incense • 28% Concentration',
    summary: 'A transcendent union of sun-bleached driftwood, golden Moroccan benzoin, and sparkling solar neroli.',
    description: 'Capturing the golden hour over Mediterranean limestone cliffs. Ambre Céleste balances creamy vanilla resinoids with high-vibrational sparkling neroli blossom and warm skin musks.',
    category: 'Haute Parfumerie',
    basePrice: 260,
    rating: 4.9,
    reviewCount: 54,
    ingredients: 'Alcohol Denat., Parfum, Citrus Aurantium Amara Flower Water, Benzoin Resin Extract, Labdanum Absolue, Coumarin, Benzyl Benzoate.',
    howToUse: 'Apply to bare shoulders, collarbones, and behind the ears for an expansive, luminous sillage that follows your every step.',
    sourcingEthics: 'Ethically gathered wild labdanum from Spanish Andalusia. Hand-poured in micro-batches under lunar calendar cycles.',
    attributes: {
      badge: 'Limited Reserve',
      olfactoryFamily: 'Solar Amber Floriental',
      concentration: 'Extrait de Parfum (28%)',
      topNotes: ['Tunisian Neroli', 'Pink Peppercorn', 'Bitter Orange Peel'],
      heartNotes: ['Golden Benzoin', 'Solar Jasmine', 'Cistus Labdanum'],
      baseNotes: ['Madagascar Bourbon Vanilla', 'White Ambergris', 'Solar Driftwood'],
    },
    images: [
      {
        id: 'img-ac-hero',
        url: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?q=80&w=1200&auto=format&fit=crop',
        alt: 'Ambre Céleste perfume bottle catching golden natural light',
        isHero: true,
      },
      {
        id: 'img-ac-texture',
        url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1200&auto=format&fit=crop',
        alt: 'Macro golden amber resin and crystalline honeyed texture',
        isTexture: true,
      },
    ],
    variants: [
      {
        id: 'v-ac-100ml',
        sku: 'RY-AC-100',
        title: '100ml / 3.4 fl. oz.',
        price: 260,
        inventory: 19,
        attributes: { size: '100ml' },
      },
      {
        id: 'v-ac-50ml',
        sku: 'RY-AC-50',
        title: '50ml / 1.7 fl. oz.',
        price: 175,
        inventory: 14,
        attributes: { size: '50ml' },
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
        url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=1200&auto=format&fit=crop',
        alt: 'Botanical Radiance Cellular Serum with precision dropper',
        isHero: true,
      },
      {
        id: 'img-br-texture',
        url: 'https://images.unsplash.com/photo-1617897903246-719242758050?q=80&w=1200&auto=format&fit=crop',
        alt: 'Macro golden serum droplet with light refraction',
        isTexture: true,
      },
    ],
    variants: [
      {
        id: 'v-br-50ml',
        sku: 'RY-BRS-50',
        title: '50ml / 1.7 fl. oz. Dropper Flacon',
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
    summary: 'A melt-on-contact night elixir balm that soothes inflammation, locks in moisture, and restores compromised skin barriers while you sleep.',
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
        url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1200&auto=format&fit=crop',
        alt: 'Regenerative Barrier Night Balm in minimalist porcelain jar',
        isHero: true,
      },
      {
        id: 'img-nb-texture',
        url: 'https://images.unsplash.com/photo-1512290900672-1f55b6c00560?q=80&w=1200&auto=format&fit=crop',
        alt: 'Macro silky whipped balm swirl texture',
        isTexture: true,
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
  // HAIR CARE & SCALP
  // -------------------------------------------------------------
  {
    id: 'prod-hair-1',
    title: 'L’Huile Sublime Regenerative Nectar',
    slug: 'l-huile-sublime-regenerative-nectar',
    subtitle: 'Artisanal Botanical Hair Elixir • Thermal Defense & Porosity Repair',
    summary: 'A cold-pressed restorative oil combining Kalahari melon seed, cold-extracted camellia, and bio-fermented peptide lipids for supreme shine and thermal defense up to 450°F.',
    description: 'Engineered over three years in Grasse and Tokyo, L’Huile Sublime penetrates the cuticle layer rather than merely coating it. Micro-fractionated lipids fuse into compromised keratin bonds, restoring tensile elasticity while imparting a mirror-gloss weightless aura.',
    category: 'Hair Care',
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
        url: 'https://images.unsplash.com/photo-1608248597359-57e3f1638271?q=80&w=1200&auto=format&fit=crop',
        alt: 'L’Huile Sublime luxury flacon in dark-field lighting',
        isHero: true,
      },
      {
        id: 'img-hs-texture',
        url: 'https://images.unsplash.com/photo-1617897903246-719242758050?q=80&w=1200&auto=format&fit=crop',
        alt: 'L’Huile Sublime macro golden oil droplet texture with refraction',
        isTexture: true,
      },
      {
        id: 'img-hs-lifestyle',
        url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1200&auto=format&fit=crop',
        alt: 'Application ritual on silk textured hair',
      },
    ],
    variants: [
      {
        id: 'v-hs-100ml',
        sku: 'RY-HN-100',
        title: '100ml / 3.4 fl. oz. Full Flacon',
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
    category: 'Hair Care',
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
        url: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=1200&auto=format&fit=crop',
        alt: 'Crème de Soie minimalist porcelain tub packaging',
        isHero: true,
      },
      {
        id: 'img-cs-texture',
        url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1200&auto=format&fit=crop',
        alt: 'Macro silky whipped emulsion swirl texture',
        isTexture: true,
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
    category: 'Hair Care',
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
        url: 'https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?q=80&w=1200&auto=format&fit=crop',
        alt: 'Velvet Botanique Body Wash sleek amber pump dispenser',
        isHero: true,
      },
      {
        id: 'img-vb-texture',
        url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1200&auto=format&fit=crop',
        alt: 'Silky clear botanical gel texture with fine lather',
        isTexture: true,
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
        url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1200&auto=format&fit=crop',
        alt: 'Exfoliant de Soie in luxurious glass bowl setting',
        isHero: true,
      },
      {
        id: 'img-es-texture',
        url: 'https://images.unsplash.com/photo-1512290900672-1f55b6c00560?q=80&w=1200&auto=format&fit=crop',
        alt: 'Macro shot of pink mineral salt crystals and rich botanical oil',
        isTexture: true,
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
        url: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=1200&auto=format&fit=crop',
        alt: 'Flamme Noire ceramic scented candle with glowing warm flame',
        isHero: true,
      },
      {
        id: 'img-fn-texture',
        url: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?q=80&w=1200&auto=format&fit=crop',
        alt: 'Macro shot of smooth matte ceramic glaze and organic wax surface',
        isTexture: true,
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
        url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1200&auto=format&fit=crop',
        alt: 'Brume d’Intérieur glass mist bottle in tranquil morning light',
        isHero: true,
      },
      {
        id: 'img-bi-texture',
        url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1200&auto=format&fit=crop',
        alt: 'Fine airborne fragrance mist dispersion detail',
        isTexture: true,
      },
    ],
    variants: [
      {
        id: 'v-bi-200ml',
        sku: 'RY-BIM-200',
        title: '200ml / 6.8 fl. oz. Frosted Flacon',
        price: 75,
        inventory: 26,
        attributes: { size: '200ml' },
      },
    ],
  },

  // -------------------------------------------------------------
  // ACCESSORIES & FINE OBJECTS
  // -------------------------------------------------------------
  {
    id: 'prod-acc-1',
    title: 'Artisan Leather Travel Flacon Case',
    slug: 'cuir-artisan-travel-flacon-case',
    subtitle: 'Hand-Stitched Full-Grain Italian Nappa Leather • Obsidian Finish',
    summary: 'A bespoke travel companion sculpted to cradle your 50ml or 100ml fragrance flacon and elixirs during worldwide voyages.',
    description: 'Handcrafted in an artisanal atelier outside Florence from supple vegetable-tanned full-grain Italian Nappa leather. Features hand-painted beveled edges, solid brass hardware with palladium plating, and a padded microfiber interior that safeguards delicate crystal vessels.',
    category: 'Accessories',
    basePrice: 185,
    compareAtPrice: 215,
    rating: 5.0,
    reviewCount: 31,
    ingredients: '100% Certified Full-Grain Tuscan Vegetable-Tanned Nappa Leather, Solid Brass Hardware with Palladium Plating, Protective Suede-Microfiber Lining.',
    howToUse: 'Insert 50ml or 100ml Rycarix crystal flacon securely into the central padded sleeve. Snap magnetic brass clasp to seal. Wipe with soft dry cloth to preserve natural patina.',
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
        url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=1200&auto=format&fit=crop',
        alt: 'Artisan leather travel case with fine saddle stitching detail',
        isHero: true,
      },
      {
        id: 'img-lc-texture',
        url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1200&auto=format&fit=crop',
        alt: 'Macro shot of grain and edge-stitching craftsmanship',
        isTexture: true,
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
        url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=1200&auto=format&fit=crop',
        alt: 'Pure Mulberry Silk Sleep Mask in rich charcoal silk setting',
        isHero: true,
      },
      {
        id: 'img-sm-texture',
        url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1200&auto=format&fit=crop',
        alt: 'Macro silky luster and hand-finished piping detail',
        isTexture: true,
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
    quote: 'From Murano glass flacons to hand-poured Limoges ceramics, every single piece is treated as an enduring work of design.',
    date: 'Design Awards',
  },
  {
    publication: 'GQ Style',
    quote: 'Santal Noir is quite simply one of the finest, most enduring sandalwood extraits formulated in the last decade.',
    date: 'Fragrance Edit',
  },
  {
    publication: 'Harper’s Bazaar',
    quote: 'The Botanical Radiance Serum and Silk Mask transformed our nightly ritual into an unhurried sanctuary.',
    date: 'Beauty Highlights',
  },
];

export const CUSTOMER_REVIEWS: ReviewItem[] = [
  {
    id: 'rev-1',
    author: 'Elena Rostova',
    location: 'Zurich, Switzerland',
    rating: 5,
    productTitle: 'Botanical Radiance Cellular Serum',
    category: 'Botanical Skincare',
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
    category: 'Haute Parfumerie',
    title: 'Monumental sillage and depth',
    comment: 'This is authentic haute perfumery. The smoky cardamom and Mysore sandalwood linger effortlessly into the next morning. Arrived in a stunning presentation box with complimentary samples.',
    verified: true,
    date: '3 weeks ago',
  },
  {
    id: 'rev-3',
    author: 'Clara Delacroix',
    location: 'Paris, France',
    rating: 5,
    productTitle: 'Flamme Noire Artisanal Candle',
    category: 'Home & Living',
    title: 'The Limoges ceramic vessel is exquisite',
    comment: 'The scent throw fills our entire Parisian apartment with warm fig and oud without ever being overpowering. When finished, I will keep the ceramic container for my vanity.',
    verified: true,
    date: '1 month ago',
  },
  {
    id: 'rev-4',
    author: 'Aria Chen',
    location: 'San Francisco, CA',
    rating: 5,
    productTitle: 'L’Huile Sublime Regenerative Nectar',
    category: 'Hair Care',
    title: 'Weightless shine with zero buildup',
    comment: 'Transformed my bleached hair ends. Two drops warm in palms and it absorbs instantly leaving hair like spun silk. Split my purchase with Klarna in 4 payments with zero hassle.',
    verified: true,
    date: '1 month ago',
  },
];
