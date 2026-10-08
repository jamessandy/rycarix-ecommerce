# Rycarix Haute Parfumerie & Botanical Care

> **"Artistry and Science, Working in Harmony"**  
> Luxury E-Commerce Platform Architecture & Full-Stack Implementation for [www.rycarix.com](https://www.rycarix.com).

---

## 1. Architectural Highlights

- **Aesthetic Direction**: *"Editorial Elegance & Tactile Transparency"*. Monochromatic base (`Pure White`, `Soft Pearl`, `Deep Onyx/Charcoal`) enriched with secondary neutrals (`Warm Oatmeal`, `Ash Grey`). High-contrast serif headlines (`Playfair Display`) paired with geometric sans-serif utility typography (`Inter`).
- **Scalable E-Commerce Database**: Flexible PostgreSQL + Prisma schema supporting unlimited category hierarchy, dynamic variant attributes (EAV + typed JSON fields) for haircare, perfumes, and future lifestyle/accessories expansions.
- **Klarna Installments Integration**: Frictionless Stripe + Klarna API checkout flow. Real-time PDP On-Site Messaging ("Pay in 4 interest-free payments of $X.XX with Klarna") with interactive installment breakdown modal and client order installment tracking.
- **Tactile Sensory Micro-Interactions**: Horizontal drag-to-scroll carousel featuring an interactive hover image swap that reveals macro texture photography (golden bio-oil droplets, whipped velvet masks, and charred sandalwood resin).
- **Split-Screen PDP**: Sticky vertical high-res image gallery, variant selection matrix, dynamic Klarna pricing, and expandable editorial accordions (*Ingredients & INCI*, *Ritual*, *Ethical Sourcing*).
- **Comprehensive Dual Dashboards**:
  - **Client Sanctuary (User Dashboard)**: Order tracking, Klarna installment visual timeline (payments completed vs remaining due dates), wishlist, and address book.
  - **Executive Atelier (Admin Dashboard)**: Gross Merchandise Value & Klarna settlement telemetry, dynamic product creation interface with JSON attribute schema, and order fulfillment monitor.

---

## 2. Directory Structure

```text
/Users/icon/Downloads/Rycarix
├── app/
│   ├── api/
│   │   ├── checkout/
│   │   │   └── route.ts         # Stripe + Klarna session initialization
│   │   └── webhooks/
│   │       └── stripe/
│   │           └── route.ts     # Asynchronous settlement & installment webhooks
│   ├── dashboard/
│   │   ├── admin/
│   │   │   └── page.tsx         # Executive Admin Dashboard & Catalog Manager
│   │   └── user/
│   │       └── page.tsx         # Client Dashboard & Klarna Installment Tracker
│   ├── products/
│   │   └── [slug]/
│   │       └── page.tsx         # Dynamic Product Detail Page (PDP)
│   ├── globals.css              # Custom monochromatic styles & scrollbars
│   ├── layout.tsx               # Root Layout with Google Fonts & Cart Drawer
│   └── page.tsx                 # Editorial Homepage (Hero, Philosophy, Carousel)
├── components/
│   ├── cart/
│   │   └── CartDrawer.tsx       # Slide-out AJAX Cart with Klarna badges
│   ├── home/
│   │   ├── Hero.tsx             # Full-bleed editorial hero
│   │   ├── Philosophy.tsx       # Numbered 01, 02, 03 ethical sourcing breakdown
│   │   ├── ProductCarousel.tsx  # Drag carousel with macro texture hover swap
│   │   └── TransparencySection.tsx # Documentary-style sourcing narrative
│   ├── klarna/
│   │   └── KlarnaWidget.tsx     # Reusable Klarna On-Site Messaging & modal
│   ├── layout/
│   │   ├── Header.tsx           # Sticky transparent-to-solid header
│   │   └── Footer.tsx           # Editorial newsletter & brand directory
│   └── pdp/
│       └── ProductDetailView.tsx # Split-screen PDP with accordions & zoom
├── lib/
│   ├── data/
│   │   └── mockData.ts          # Luxury product catalogue with macro textures
│   ├── store/
│   │   └── useCartStore.ts      # Zustand cart state with Klarna calculations
│   ├── types/
│   │   └── ecommerce.ts         # Domain TypeScript models
│   └── prisma.ts                # Prisma ORM client singleton
├── prisma/
│   └── schema.prisma            # Scalable database schema with Klarna fields
├── .env.example                 # Environment configuration template
├── next.config.js               # Next.js image optimization settings
├── package.json                 # Core dependencies
├── postcss.config.js            # PostCSS configuration
├── tailwind.config.js           # Custom luxury palette & typography
└── tsconfig.json                # TypeScript compiler configuration
```

---

## 3. Quick Start & Setup

### Prerequisites
- Node.js `v18+` (or `v20+` / `v24+`)
- PostgreSQL database (Local, Supabase, Neon, or RDS)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Provide your PostgreSQL connection string and Stripe/Klarna credentials.

### 3. Generate Database Client & Push Schema
```bash
npx prisma generate
npx prisma db push
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the storefront.

---

## 4. Klarna Payment Flow

1. **Client PDP**: The `KlarnaWidget` dynamically calculates `price / 4` and displays *"4 interest-free payments of $XX.XX with Klarna"*. Clicking opens an informational modal explaining the 6-week schedule.
2. **Slide-Out AJAX Bag**: Cart calculates total and presents the updated installment estimate.
3. **Checkout Initiation**: Calling `/api/checkout` passes `payment_method_types: ['card', 'klarna']` to Stripe.
4. **Asynchronous Settlement**: The webhook `/api/webhooks/stripe` catches `payment_intent.succeeded` and stores the installment breakdown in PostgreSQL.
5. **Client Transparency**: In `/dashboard/user`, customers track which installments are paid and upcoming due dates.
