# Full-Stack E-Commerce Application Blueprint

> **Complete feature reference for replicating this project architecture.**
> Tech Stack: React + TypeScript (Vite) | Node.js + Express | PostgreSQL + Prisma | Docker + Nginx

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Tech Stack & Dependencies](#tech-stack--dependencies)
3. [Database Schema & Models](#database-schema--models)
4. [Backend API — Complete Endpoint Reference](#4-backend-api--complete-endpoint-reference)
5. [Frontend Features — Complete Functional Reference](#5-frontend-features--complete-functional-reference)
6. [Authentication & Security — Complete Functional Detail](#6-authentication--security--complete-functional-detail)
7. [Payment Integration — Complete Functional Detail](#7-payment-integration--complete-functional-detail)
8. [Email & Notifications — Complete Functional Detail](#8-email--notifications--complete-functional-detail)
9. [Admin Panel — Complete Permission & Feature Matrix](#9-admin-panel--complete-permission--feature-matrix)
10. [DevOps & Deployment](#devops--deployment)
11. [Environment Configuration](#environment-configuration)
12. [Project Structure](#project-structure)
12. [Project Structure](#project-structure)

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        NGINX (Reverse Proxy + SSL)           │
│                   Port 80/443 → Certbot auto-renewal        │
├─────────────────────────┬───────────────────────────────────┤
│   Frontend (React SPA)  │       Backend (Express API)       │
│   Vite + TailwindCSS    │       /api/v1/* routes            │
│   Redux Toolkit (State) │       Prisma ORM                  │
│   React Router v6       │       JWT Auth                    │
└─────────────────────────┴──────────────┬────────────────────┘
                                         │
                              ┌──────────▼──────────┐
                              │  PostgreSQL 16       │
                              │  (Docker container)  │
                              └─────────────────────┘
```

**Key Architectural Patterns:**
- Monorepo (root `package.json` orchestrates client + backend)
- API versioning: all routes under `/api/v1/`
- Docker Compose orchestration (4 services: postgres, backend, frontend, nginx + certbot)
- End-to-end RSA encryption (optional, toggle via env)
- Guest checkout support (no account required)
- Role-based admin permissions with permission groups

---

## 2. Tech Stack & Dependencies

### Frontend
| Category | Technology |
|----------|-----------|
| Framework | React 18 + TypeScript |
| Build Tool | Vite 5 |
| State Management | Redux Toolkit + Redux Persist |
| Routing | React Router DOM v6 |
| Styling | TailwindCSS 3 |
| HTTP Client | Axios (with interceptors) |
| Animations | Framer Motion |
| Icons | Lucide React |
| Carousel/Slider | Swiper |
| Rich Text Editor | React Quill |
| OAuth | @react-oauth/google |
| Notifications | React Hot Toast |
| SEO | React Helmet Async |
| Utilities | clsx, tailwind-merge |

### Backend
| Category | Technology |
|----------|-----------|
| Runtime | Node.js (ES Modules) |
| Framework | Express 4 |
| ORM | Prisma 6 (PostgreSQL) |
| Auth | JWT (jsonwebtoken), bcrypt/bcryptjs |
| Email | Nodemailer (multi-provider) |
| Payments | TransactPay, Paystack, Stripe-ready |
| File Upload | Multer |
| Encryption | node-forge (RSA) |
| Excel/CSV | xlsx, csv-parser |
| OAuth | google-auth-library |
| IDs | uuid |

### Infrastructure
| Category | Technology |
|----------|-----------|
| Database | PostgreSQL 16 Alpine |
| Containerization | Docker + Docker Compose |
| Reverse Proxy | Nginx Alpine |
| SSL | Let's Encrypt + Certbot (auto-renewal) |
| Process Restart | Docker `restart: unless-stopped` |

---

## 3. Database Schema & Models

### Core Models (18 total)

| Model | Purpose |
|-------|---------|
| **User** | Customer accounts (email, password, profile, verification) |
| **AdminUser** | Admin role linkage + permission group assignment |
| **PermissionGroup** | Named groups with JSON permission maps |
| **Address** | User shipping addresses (multiple per user) |
| **Product** | Catalog items (variants, pricing, images, SEO metadata) |
| **Category** | Product categories (slug, icon, display order) |
| **Cart / CartItem** | Shopping cart (per user, product+quantity) |
| **Order / OrderItem** | Orders with guest support, delivery/pickup types |
| **Coupon** | Discount codes (percentage/fixed/free-shipping) |
| **Inventory** | Stock tracking with reservations |
| **InventoryAdjustment** | Stock change audit trail |
| **Review** | Product reviews (rating, title, content) |
| **WishlistItem** | User wishlists |
| **Media** | Uploaded files (images, documents) |
| **Banner** | Site banners (promotional, regular, carousel) |
| **HeroSlide** | Homepage hero slider with full customization |
| **Notification** | In-app notifications (typed, actionable) |
| **Newsletter** | Email subscribers |
| **Contact** | Contact form submissions |
| **FAQ** | FAQ entries (categorized, per-page, helpfulness tracking) |
| **FormSchema / FormSubmission** | Dynamic forms |
| **Settings** | Key-value site settings |
| **StoreLocation** | Physical stores for pickup orders |
| **PaymentConfiguration** | Payment method toggles |
| **TaxConfiguration** | Tax rate settings |
| **ShippingConfiguration** | Shipping zones, rates, thresholds |
| **EditHistory** | Order edit audit trail (admin) |
| **ReportJob** | Async report generation tracking |
| **OTP** | One-time passwords for registration/reset/guest tracking |

### Enums
```
OrderStatus: PENDING | PROCESSING | SHIPPED | DELIVERED | CANCELLED | RETURNED
PaymentStatus: PENDING | COMPLETED | FAILED | REFUNDED
PaymentMethod: ONLINE_PAYMENT | PAY_ON_DELIVERY
DeliveryType: DELIVERY | PICKUP
DiscountType: PERCENTAGE | FIXED | FREE_SHIPPING
NotificationType: INFO | SUCCESS | WARNING | ERROR
ReportStatus: PENDING | PROCESSING | COMPLETED | FAILED | CANCELLED
```

---

## 4. Backend API — Complete Endpoint Reference

### 4.1 Authentication & OTP (`/api/v1/auth`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Login with email/password → JWT access + refresh tokens |
| POST | `/auth/register` | Register new user with email/password |
| POST | `/auth/google` | Google OAuth login (verify ID token, create/login user) |
| POST | `/auth/forgot-password` | Request password reset (sends email with token) |
| POST | `/auth/reset-password` | Confirm password reset with token |
| GET | `/auth/health` | Auth service health check |

**OTP Endpoints (`/api/v1/auth/otp`):**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/otp/send-registration-otp` | Send OTP to verify registration email |
| POST | `/auth/otp/verify-registration-otp` | Verify OTP → complete registration |
| POST | `/auth/otp/resend-registration-otp` | Resend registration OTP |
| POST | `/auth/otp/send-password-reset-otp` | Send OTP for password reset |
| POST | `/auth/otp/verify-password-reset-otp` | Verify reset OTP → returns temp token |
| POST | `/auth/otp/reset-password` | Reset password using verified OTP token |
| POST | `/auth/otp/resend-password-reset-otp` | Resend password reset OTP |
| POST | `/auth/otp/send-guest-tracking-otp` | Send OTP for guest order tracking |
| POST | `/auth/otp/verify-guest-tracking-otp` | Verify guest OTP → returns access token |
| POST | `/auth/otp/resend-guest-tracking-otp` | Resend guest tracking OTP |

**Google OAuth (`/api/v1/auth/google`):**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/google` | Google token exchange → JWT issued |
| GET | `/auth/google/callback` | OAuth callback handler |

---

### 4.2 Products (`/api/v1/products`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products` | List active products (public) — pagination, category, search, featured, price filters |
| GET | `/products/featured` | Get featured products (public, max 12) |
| GET | `/products/:id` | Get single product by ID (public) |
| GET | `/products/admin/all` | Get ALL products including inactive (admin) |
| GET | `/products/export` | Export all products to CSV (admin, products.export permission) |
| POST | `/products` | Create product with image uploads (admin, products.create) |
| PUT | `/products/:id` | Update product (admin, products.edit) |
| DELETE | `/products/:id` | Hard delete product (admin, products.delete) |
| POST | `/products/bulk` | Bulk operations: activate/deactivate/feature/unfeature/updateCategory (admin) |

**Enhanced Products (`/api/v1/enhanced-products`):**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/enhanced-products` | Advanced public listing — returns categories/brands/price ranges metadata |
| GET | `/enhanced-products/all` | Admin listing with permissions check |
| GET | `/enhanced-products/:identifier` | Get by ID or SKU — includes related products, rating stats, variants, reviews |
| POST | `/enhanced-products` | Create with variants, inventory sync, auto-SKU generation |
| PUT | `/enhanced-products/:id` | Update with variant sync, inventory sync |
| DELETE | `/enhanced-products/:id` | Smart delete (deactivate if has orders, hard delete if none) |
| GET | `/enhanced-products/:id/analytics` | Product analytics: sold, in carts, wishlists, reviews, inventory history |

**Bulk Products (`/api/v1/admin/products/bulk`):**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/admin/products/bulk/upload` | Bulk upload products via CSV (creates/updates by SKU) |
| GET | `/admin/products/bulk/template` | Download CSV template with headers + sample rows |

---

### 4.3 Categories (`/api/v1/categories`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/categories` | Get all active categories with product count (public) |

> Full CRUD managed via admin routes with slug generation, display ordering, icons, images, active toggle.

---

### 4.4 Cart (`/api/v1/cart`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/cart` | Get cart items for authenticated user |
| POST | `/cart/add` | Add item to cart (creates cart if needed, increments qty if exists) |
| PUT | `/cart/update` | Update cart item quantity (removes if qty ≤ 0) |
| DELETE | `/cart/remove/:productId` | Remove specific item from cart |
| DELETE | `/cart/clear` | Clear entire cart |
| POST | `/cart/force-clear` | Force clear cart (works without auth for guest cleanup) |

**Guest Cart (`/api/v1/guest-cart`):**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/guest-cart/add` | Validate + return product details for guest cart (no auth) |
| POST | `/guest-cart/validate` | Validate multiple products for guest cart |

---

### 4.5 Orders (`/api/v1/orders`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/orders` | Create order (supports authenticated + guest users) |
| GET | `/orders` | Get current user's orders (protected) |
| GET | `/orders/:id` | Get single order by ID or orderNumber (verifies ownership) |
| POST | `/orders/pay-on-delivery` | Create pay-on-delivery order (supports delivery + pickup) |
| GET | `/orders/addresses` | Get all user addresses |
| POST | `/orders/check-duplicate-address` | Prevent address duplication |

**Guest Orders (`/api/v1/guest-orders`):**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/guest-orders/track-guest` | Track guest orders by email (pagination + status filter) |

**Guest Tracking OTP (`/api/v1/guest-orders/otp`):**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/guest-orders/otp/send` | Send OTP to guest email for tracking |
| POST | `/guest-orders/otp/verify` | Verify guest tracking OTP |

---

### 4.6 Payments (`/api/v1/payments`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/payments/config` | Get payment configuration (public — POD enabled, online payment toggle) |
| GET | `/payments/shipping-config` | Get shipping configuration (public — rates, thresholds) |
| POST | `/payments/initialize` | Initialize payment → routes to Paystack or TransactPay based on gateway config |
| POST | `/payments/verify/:reference` | Verify Paystack payment → creates order on success |
| POST | `/payments/webhook` | Paystack webhook handler (charge.success events) |
| GET | `/payments/history` | Get payment history for authenticated user |

**TransactPay (`/api/v1/transactpay`):**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/transactpay/health` | Health check — validates TransactPay configuration |
| POST | `/transactpay/initialize` | Initialize TransactPay payment → creates order → returns payment link |
| GET | `/transactpay/callback` | Payment redirect callback → verify payment, update order, clear cart |
| POST | `/transactpay/webhook` | Webhook handler (charge.success/charge.failed events) |
| POST | `/transactpay/clear-guest-cart` | Clear guest cart after successful payment |

---

### 4.7 User Dashboard (`/api/v1/user`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/user/profile` | Get user profile |
| PUT | `/user/profile` | Update user profile |
| GET | `/user/orders` | Get user's orders |
| GET | `/user/orders/:orderId` | Get single order detail |
| GET | `/user/wishlist` | Get user's wishlist |
| POST | `/user/wishlist/add` | Add to wishlist |
| DELETE | `/user/wishlist/remove/:productId` | Remove from wishlist |
| GET | `/user/addresses` | Get user addresses |
| POST | `/user/addresses` | Create address |
| PUT | `/user/addresses/:id` | Update address |
| DELETE | `/user/addresses/:id` | Delete address |
| GET | `/user/stats` | Dashboard stats (orders, total spent, wishlist count) |
| GET | `/user/activities` | Recent activities feed (orders, wishlist additions) |

---

### 4.8 Wishlist (`/api/v1/user/wishlist`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/user/wishlist` | Get all wishlist items with product details |
| POST | `/user/wishlist` | Add product to wishlist |
| DELETE | `/user/wishlist/:id` | Remove by wishlist item ID |
| DELETE | `/user/wishlist/product/:productId` | Remove by product ID |
| DELETE | `/user/wishlist` | Clear entire wishlist |
| GET | `/user/wishlist/check/:productId` | Check if product is in wishlist |

---

### 4.9 Reviews (`/api/v1/reviews`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/reviews/:productId` | Get all reviews for a product (public) |
| POST | `/reviews` | Create review (must have purchased the product) |
| PUT | `/reviews/:reviewId` | Update review (author or admin) |
| DELETE | `/reviews/:reviewId` | Delete review (author only) |
| GET | `/reviews/user/purchased/:productId` | Check if user purchased product (review eligibility) |

---

### 4.10 Coupons (`/api/v1/coupons`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/coupons` | Get all coupons with pagination/search (admin, coupons module) |
| GET | `/coupons/:id` | Get coupon by ID (admin) |
| POST | `/coupons` | Create coupon (admin, coupons.create) |
| PUT | `/coupons/:id` | Update coupon (admin, coupons.edit) |
| DELETE | `/coupons/:id` | Delete coupon (admin, coupons.delete) |
| POST | `/coupons/validate` | Validate coupon code (public) — checks active, expiry, usage limits, min order |
---

### 4.11 Inventory (`/api/v1/inventory`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/inventory/:productId` | Get inventory status for a product (public) |
| GET | `/inventory` | Get all inventory with pagination/search/low-stock filter (admin) |
| POST | `/inventory/adjust` | Adjust inventory — ADD/REMOVE/RETURN (admin) |
| POST | `/inventory/sync-order` | Sync inventory with order — CREATE/CANCEL/RETURN (authenticated) |
| POST | `/inventory/restock` | Restock a product (admin) |
| GET | `/inventory/history/:productId` | Get adjustment history for a product (admin) |
| POST | `/inventory/bulk-adjust` | Bulk adjust inventory for multiple products (admin) |

---

### 4.12 Banners (`/api/v1/banners`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/banners` | Get all active banners (public, filterable by page) |
| GET | `/banners/admin` | Get all banners with pagination/search (admin) |
| GET | `/banners/:id` | Get banner by ID (admin) |
| POST | `/banners` | Create banner (admin, banners.create) |
| PUT | `/banners/:id` | Update banner (admin, banners.edit) |
| DELETE | `/banners/:id` | Delete banner (admin, banners.delete) |
| PATCH | `/banners/:id/toggle` | Toggle banner active status (admin) |

---

### 4.13 Hero Slides (`/api/v1/hero-slides`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/hero-slides` | Get all active hero slides (public, filterable by category) |
| GET | `/hero-slides/admin/all` | Get all slides with filters/pagination (admin) |
| GET | `/hero-slides/:id` | Get slide by ID (admin) |
| POST | `/hero-slides` | Create hero slide (admin, hero-slides.create) |
| PUT | `/hero-slides/:id` | Update hero slide (admin, hero-slides.edit) |
| DELETE | `/hero-slides/:id` | Delete hero slide (admin, hero-slides.delete) |
| PATCH | `/hero-slides/:id/toggle` | Toggle active status (admin) |
| POST | `/hero-slides/reorder` | Reorder slides (admin, hero-slides.edit) |

---

### 4.14 FAQ (`/api/v1/faq`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/faq` | Get all active FAQs with pagination/search/category (public) |
| GET | `/faq/page/:page` | Get FAQs by page: home, shop, categories, about, contact (public) |
| GET | `/faq/all` | Get all FAQs including inactive (admin) |
| GET | `/faq/:id` | Get single FAQ by ID (public) |
| GET | `/faq/category/:category` | Get FAQs by category (public) |
| POST | `/faq` | Create FAQ (admin) |
| PUT | `/faq/:id` | Update FAQ (admin) |
| POST | `/faq/:id/helpful` | Mark FAQ as helpful (authenticated) |
| POST | `/faq/:id/unhelpful` | Mark FAQ as unhelpful (authenticated) |
| DELETE | `/faq/:id` | Delete FAQ (admin) |

---

### 4.15 Newsletter (`/api/v1/newsletter`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/newsletter/subscribe` | Subscribe to newsletter (public) |
| POST | `/newsletter/unsubscribe` | Unsubscribe from newsletter (public) |
| GET | `/newsletter/admin` | Get all subscribers with pagination/search/status (admin) |
| POST | `/newsletter/admin` | Admin add subscriber manually |
| PUT | `/newsletter/admin/:id` | Admin update subscriber |
| DELETE | `/newsletter/admin/:id` | Admin delete subscriber |
| GET | `/newsletter/admin/export` | Export subscribers as CSV or JSON (admin) |

---

### 4.16 Contact (`/api/v1/contact`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/contact` | Submit contact form (public) |
| GET | `/contact/admin` | Get all submissions with pagination/search/status (admin) |
| GET | `/contact/admin/:id` | Get single contact + mark as read (admin) |
| PUT | `/contact/admin/:id` | Mark contact read/unread (admin) |
| DELETE | `/contact/admin/:id` | Delete contact submission (admin) |

---

### 4.17 Notifications (`/api/v1/notifications`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/notifications` | Get all notifications with filtering (admin) |
| GET | `/notifications/unread-count` | Get unread notification count (admin) |
| PATCH | `/notifications/:id/read` | Mark notification as read (admin) |
| PATCH | `/notifications/mark-all-read` | Mark all notifications as read (admin) |
| PATCH | `/notifications/:id/archive` | Archive notification (admin) |
| DELETE | `/notifications/:id` | Delete notification (admin, notifications.delete) |
| POST | `/notifications` | Create notification (admin, notifications.create) |

---

### 4.18 Admin Dashboard (`/api/v1/admin/dashboard`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/dashboard/stats` | Dashboard stats (products, orders, users, revenue, growth %) |
| GET | `/admin/dashboard/activity` | Recent activity feed (orders, users, products) |
| GET | `/admin/dashboard/health` | System health (database, payment gateway, email, storage) |
| GET | `/admin/dashboard/analytics` | Analytics (sales over time, top products, user growth, orders by status) |
| GET | `/admin/dashboard/recent-orders` | Recent orders with user + product details |
| GET | `/admin/dashboard/top-products` | Top selling products by quantity |

---

### 4.19 Admin Orders (`/api/v1/admin/orders`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/orders` | Get all orders — search/status/payment/date filters (orders.view) |
| GET | `/admin/orders/:id` | Get order details with edit history (orders.viewDetails) |
| PUT | `/admin/orders/:id` | Update order with edit history tracking (orders.edit) |
| POST | `/admin/orders/:id/change-status` | Change order status with edit history (orders.changeStatus) |
| GET | `/admin/orders/:id/history` | Get order edit history (orders.viewEditHistory) |
| POST | `/admin/orders/:id/refund` | Refund order → REFUNDED + RETURNED (orders.refund) |

---

### 4.20 Analytics (`/api/v1/admin/analytics`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/analytics` | Comprehensive analytics — revenue, orders, customers, top products, categories, payment methods, daily sales, customer growth. Supports period: 7d/30d/90d/1y |

---

### 4.21 Reports (`/api/v1/admin/reports`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/reports` | Get reports summary by type (sales/inventory/customer) |
| POST | `/admin/reports/export` | Export report in format (csv/excel/pdf) |
| GET | `/admin/reports/sales` | Sales report with date/status filters |
| GET | `/admin/reports/inventory` | Inventory report with low stock items |
| GET | `/admin/reports/users` | User report with permission groups breakdown |

---

### 4.22 Users Management (`/api/v1/users`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | Get all users with pagination/search (admin) |
| GET | `/users/:id` | Get user by ID with admin/permission details (admin) |
| POST | `/users` | Create user with optional admin permission group (admin) |
| PUT | `/users/:id` | Update user with optional permission group change (admin) |
| DELETE | `/users/:id` | Delete user (admin) |
| PATCH | `/users/:id/permission-group` | Update user's permission group (admin) |
| GET | `/users/addresses` | Get user's addresses (authenticated) |
| POST | `/users/addresses` | Create new address (authenticated) |
| PUT | `/users/addresses/:addressId` | Update address (authenticated) |

---

### 4.23 Permissions (`/api/v1/admin/permissions`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/permissions` | Get all role permissions |
| GET | `/admin/permissions/:role` | Get permissions for a specific role |
| POST | `/admin/permissions/check` | Check if a role has a specific permission |

**Permission Groups (`/api/v1/admin/permission-groups`):**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/permission-groups` | Get all groups with user count |
| GET | `/admin/permission-groups/:id` | Get specific group |
| POST | `/admin/permission-groups` | Create group (createGroups permission or super admin) |
| PUT | `/admin/permission-groups/:id` | Update group (super admin only, protects defaults) |
| DELETE | `/admin/permission-groups/:id` | Delete group (super admin only, migrates users) |

---

### 4.24 Media Library (`/api/v1/media`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/media` | Get all media with pagination/category/search (admin) |
| POST | `/media/upload` | Upload file with duplicate detection (authenticated) |
| POST | `/media/add-url` | Add media from external URL (admin) |
| GET | `/media/:id` | Get media by ID (admin) |
| PUT | `/media/:id` | Update media (featured toggle, description, category) (admin) |
| DELETE | `/media/:id` | Delete media + physical file (admin) |
| GET | `/media/library/all` | Get all media for selection in forms (authenticated) |

---

### 4.25 Store Locations (`/api/v1/store-locations`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/store-locations` | Get all active store locations (public) |
| GET | `/store-locations/:id` | Get specific store location (public) |
| POST | `/store-locations` | Create new store location (admin) |
| PUT | `/store-locations/:id` | Update store location (admin) |
| DELETE | `/store-locations/:id` | Delete store location (admin) |

---

### 4.26 Configuration APIs

**Payment Config (`/api/v1/admin/payment-config`):**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/payment-config` | Get payment configuration |
| PUT | `/admin/payment-config` | Update payment config (POD toggle, min/max amounts, gateway type) |

**Tax Config (`/api/v1/admin/tax-config`):**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/tax-config` | Get tax configuration |
| PUT | `/admin/tax-config` | Update tax config (rate, name, include-in-price toggle) |

**Shipping Config (`/api/v1/admin/shipping-config`):**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/shipping-config` | Get shipping configuration |
| PUT | `/admin/shipping-config` | Update shipping (standard/express/local rates, free threshold, pickup toggle) |

---

### 4.27 Admin CMS & Content (`/api/v1/admin`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/pages` | Get all pages (admin, pages module) |
| GET | `/admin/pages/:pageId` | Get page by ID with sections |
| POST | `/admin/pages` | Create page (pages.create) |
| PUT | `/admin/pages/:pageId` | Update page (pages.edit) |
| DELETE | `/admin/pages/:pageId` | Delete page (pages.delete) |
| GET | `/admin/pages/:pageId/sections` | Get page sections |
| POST | `/admin/pages/:pageId/sections` | Create page section |
| PUT | `/admin/sections/:sectionId` | Update section |
| DELETE | `/admin/sections/:sectionId` | Delete section |
| GET | `/admin/forms` | Get all dynamic forms |
| GET | `/admin/forms/:formId` | Get form with submissions |
| POST | `/admin/forms` | Create dynamic form |
| PUT | `/admin/forms/:formId` | Update form |
| DELETE | `/admin/forms/:formId` | Delete form |
| GET | `/admin/forms/:formId/submissions` | Get form submissions |
| GET | `/admin/messages` | Get site messages |
| POST | `/admin/messages` | Create site message |
| PUT | `/admin/messages/:messageId` | Update message |
| DELETE | `/admin/messages/:messageId` | Delete message |
| GET | `/admin/content-blocks` | Get content blocks |
| POST | `/admin/content-blocks` | Create content block |
| PUT | `/admin/content-blocks/:blockId` | Update content block |
| DELETE | `/admin/content-blocks/:blockId` | Delete content block |
| GET | `/admin/settings` | Get all settings (settings module) |
| PUT | `/admin/settings/:key` | Upsert setting by key |

---

### 4.28 SEO & Sitemap (`/api/v1/seo`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/seo/sitemap.xml` | Dynamic XML sitemap with active products, categories, static pages |

---

### 4.29 Public API (`/api/v1/public`)

Unauthenticated access to:
- Active products listing
- Active categories listing
- Active store locations
- Public FAQ
- Payment/shipping configuration

---

### 4.30 Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/health` | API health check |
| GET | `/health` | Root-level server health check |

---

## 5. Frontend Features — Complete Functional Reference

### 5.1 State Management (Redux Toolkit)

#### Auth Slice
| Action/Thunk | Functionality |
|-------------|---------------|
| `loginUser` | Email/password login → stores JWT + 7-day session in localStorage |
| `registerUser` | Registration with name, email, password, phone |
| `googleLogin` | OAuth via Google ID token exchange |
| `checkAuth` | Rehydrates auth from localStorage, checks session expiry |
| `refreshToken` | Uses refresh token to obtain new access token |
| `logout` | Clears all auth state + localStorage |
| `clearError` / `setUser` | Utility actions |

#### Cart Slice
| Action/Thunk | Functionality |
|-------------|---------------|
| `fetchCart` | Gets cart from API (authenticated) OR localStorage (guest) |
| `addToCart` | Adds product to server-side cart |
| `updateCartItem` | Updates quantity in server-side cart |
| `removeFromCart` | Removes product from server-side cart |
| `clearCart` | Empties cart |
| `addToGuestCart` | Adds to localStorage cart (no auth) |
| `updateGuestCartItem` | Updates guest cart item quantity |
| `removeFromGuestCart` | Removes from guest cart |
| `calculateTotal` | Recalculates cart totals |

#### Products Slice
| Action/Thunk | Functionality |
|-------------|---------------|
| `fetchProducts` | Paginated list with category/search/price filters |
| `fetchFeaturedProducts` | Homepage featured products |
| `fetchProductById` | Single product with full details |
| `fetchProductWithWishlistStatus` | Product + wishlist check combined |
| `fetchCategories` | All product categories |
| `createProduct` | Admin: create product |
| `updateProduct` | Admin: update product |
| `deleteProduct` | Admin: delete product |
| `setSelectedCategory` / `setSearchTerm` | Filter controls |

#### Orders Slice
| Action/Thunk | Functionality |
|-------------|---------------|
| `fetchOrders` | List with user/status/page filters |
| `fetchOrderById` | Single order detail |
| `createOrder` | Create order (items, address, payment method, coupon) |
| `updateOrderStatus` | Admin: change status |
| `cancelOrder` | Cancel an order |
| `returnOrder` | Initiate return |

#### Wishlist Slice
| Action/Thunk | Functionality |
|-------------|---------------|
| `fetchWishlist` | Get wishlist (persisted to localStorage) |
| `addToWishlist` | Add product |
| `removeFromWishlist` | Remove product |
| `checkProductInWishlist` | Check if already wishlisted |
| Auto-clear on `auth/logout` | Cross-slice integration |

#### Coupons Slice
| Action/Thunk | Functionality |
|-------------|---------------|
| `fetchCoupons` | List with pagination |
| `fetchCouponById` | Single coupon |
| `createCoupon` / `updateCoupon` / `deleteCoupon` | CRUD |
| `validateCoupon` | Validate code against order total |

#### Notifications Slice
| Action/Thunk | Functionality |
|-------------|---------------|
| `fetchNotifications` | Get all notifications |
| `markAsRead` / `markAllAsRead` | Read status management |
| `deleteNotification` | Remove notification |
| `addNotification` | Push new notification to state |

#### Inventory Slice
| Action/Thunk | Functionality |
|-------------|---------------|
| `fetchInventory` | Get all with low-stock filter |
| `adjustInventory` | Adjust stock (ADD/REMOVE/RETURN) |
| `syncOrderInventory` | Sync after CREATE/CANCEL/RETURN |
| `bulkAdjustInventory` | Multi-product adjustment |
| `restockProduct` | Restock specific product |

#### Users Slice
| Action/Thunk | Functionality |
|-------------|---------------|
| `fetchUsers` | Paginated user list with search |
| `fetchCurrentUser` | Logged-in user profile |
| `fetchUserById` | User by ID |
| `createUser` / `updateUser` / `deleteUser` | CRUD |
| `updateUserPermissionGroup` | Assign permission group |
| `changePassword` | Password change |

#### Payment Slices
| Action/Thunk | Functionality |
|-------------|---------------|
| `fetchPaymentConfig` | Get POD settings, online payment toggle |
| `setPaymentMethod` | Set ONLINE_PAYMENT or PAY_ON_DELIVERY |
| `setIsProcessing` | Toggle processing state |
| `resetPaymentMethod` | Reset to default |

#### UI Slice (Sync)
| Action | Functionality |
|--------|---------------|
| `toggleMobileMenu` / `setMobileMenu` | Mobile nav control |
| `setLoading` | Global loading indicator |
| `setAlert` / `clearAlert` | Toast/alert system |
| `toggleModal` / `openModal` / `closeModal` | Modal management by name |
| `addNotification` / `removeNotification` | UI notification queue |
| `setAdminViewMode` / `toggleAdminViewMode` | Admin ↔ user view (persisted) |

#### Admin Feature Slices
| Slice | Thunks |
|-------|--------|
| `bannersSlice` | `fetchBanners`, `createBanner`, `updateBanner`, `deleteBanner` |
| `categoriesSlice` | `fetchCategories`, `createCategory`, `updateCategory`, `deleteCategory` |
| `couponsAdminSlice` | `fetchCoupons`, `createCoupon`, `updateCoupon`, `deleteCoupon` |
| `inventorySlice (admin)` | `fetchInventory`, `fetchInventoryByProduct`, `adjustInventory`, `restockProduct`, `bulkAdjustInventory` |
| `ordersAdminSlice` | `fetchOrders`, `updateOrderStatus` |
| `shippingSlice` | `fetchShipping`, `createShipping`, `updateShipping`, `deleteShipping` |
| `usersSlice (admin)` | `fetchUsers`, `fetchUserById`, `createUser`, `updateUser`, `deleteUser`, `updateUserPermissionGroup` |

---

### 5.2 Frontend Services Layer

| Service | Methods |
|---------|---------|
| **`cacheService`** | In-memory TTL cache (5 min default), request deduplication, `get(key, fetcher, ttl)`, `invalidate(key)`, `invalidatePattern(regex)`, `clearAll()`, `getStats()` |
| **`couponService`** | Full CRUD, validate/apply coupons, get active coupons, stats & usage history |
| **`inventoryService`** | Full CRUD, adjust/restock/reserve/release stock, movements history, low-stock alerts, bulk updates, stats |
| **`notificationService`** | Audio alert playback (mp3 with generated-sound fallback), unread count tracking, sound enable/disable (localStorage persisted) |
| **`orderService`** | Full CRUD, status/user/date/amount filters, cancel, stats, history, search |
| **`productService`** | Full CRUD, featured, categories, bulk create/update/delete, search, stats & trends |
| **`userService`** | Full CRUD, profile management, permission groups, password change, search, user orders, preferences |

---

### 5.3 API Client (Axios Instance)

| Feature | Implementation |
|---------|---------------|
| Base URL | `VITE_API_BASE_URL` env (fallback: `http://localhost:5001/api`) |
| Credentials | `withCredentials: true` |
| Auth Header | Auto-attaches `Bearer` token from localStorage (`auth_token` or `token`) |
| File Upload | Skips encryption for `FormData`, removes `Content-Type` for multipart boundary |
| Request Encryption | Encrypts POST/PUT/PATCH bodies via RSA+AES when enabled |
| Response Decryption | Auto-detects `encrypted_data` field → decrypts transparently |
| 401 Handling | Clears auth tokens, redirects to `/login` (except guest-safe routes: `/cart`, `/checkout`, `/public/`) |
| Encryption Header | Sets `X-Encryption: enabled` when active |

---

### 5.4 End-to-End Encryption (Optional)

**Hybrid RSA + AES-256-GCM via Web Crypto API:**

| Feature | Detail |
|---------|--------|
| Toggle | `VITE_ENCRYPTION_ENABLED=true` |
| Keys | Client private/public key pair + Backend public key |
| Request Encryption | 1) Generate random AES-256-GCM session key → 2) Encrypt payload → 3) Encrypt session key with backend RSA-OAEP → 4) Sign with client RSA-PSS SHA-256 |
| Response Decryption | 1) Verify backend RSA-PSS signature → 2) Check timestamp (5 min max) → 3) Nonce replay protection → 4) Decrypt session key → 5) Decrypt payload |
| Output Format | `{ encrypted_data, encrypted_key, signature, iv, timestamp, nonce }` |

---

### 5.5 Payment Utilities

| Function | Purpose |
|----------|---------|
| `getTransactpayPublicKey()` | Get TransactPay key from env (throws if missing) |
| `validateTransactpayKey(key)` | Validate key format (alphanumeric+underscore, >10 chars) |
| `validatePaymentData(data)` | Validate: amount > 0, valid email, name ≥ 2, description ≥ 3 |
| `formatPaymentAmount(amount, currency)` | Format with ₦, $, €, £ symbols |
| `convertToKobo(amount)` / `convertFromKobo(amount)` | NGN ↔ kobo (×100) |
| `initializeTransactpayPayment(data)` | POST to initialize with amount, email, name, orderId |
| `verifyTransactpayPayment(reference)` | POST to verify payment reference |
| `handleTransactpayPayment(data, onSuccess, onClose, onError)` | Full flow: initialize → redirect to payment link |

---

### 5.6 Route Protection

| Guard | Logic |
|-------|-------|
| `ProtectedRoute` | Not authenticated → redirect to `/login?redirect={path}` |
| `ProtectedRoute (adminOnly)` | No `adminUser` property → redirect to `/` |
| `AdminPermissionGuard` | Wraps admin routes → checks granular permissions |
| `PermissionGate` | Component-level: renders children only if permission matches |
| `RoleGate` | Component-level: renders children only if role matches |

---

### 5.7 Real-Time Features

| Hook | Functionality |
|------|---------------|
| `useNotificationListener` | Polls unread count every 2 minutes (60s min interval), triggers audio alert on new notifications |
| `useRealtimeSync` | `invalidateCache(action, key)` — debounced Redux dispatch (300ms, deduplication); `performCRUDOperation(op, refresh)` — execute mutation + auto-refresh list |
| `useFormWithCacheRefresh` | Wraps form submit with automatic cache invalidation on success |
| `usePaymentTabListener` | Coordinates payment across browser tabs (detects payment completion in other tabs) |

---

### 5.8 Custom Hooks

| Hook | Functionality |
|------|---------------|
| `useProducts` | Product fetching, filtering, pagination management |
| `useOrders` | Order operations with status management |
| `useInventory` | Inventory CRUD with real-time updates |
| `useCoupons` | Coupon validation and management |
| `useBanners` | Banner data fetching and display logic |
| `useNotifications` | Notification state + mark read/archive |
| `usePermissions` | Check current user permissions |
| `useAdminPermissions` | Admin-specific permission checking for route/feature access |
| `useSettings` | Site settings access |
| `useUsers` | User management operations |
| `useDashboardStats` | Admin dashboard data with period comparison |
| `useCustomAlert` | Toast/alert management (success, error, warning, info) |
| `useAdminViewMode` | Toggle between admin and user view |
| `useViewModeGuard` | Protect routes based on current view mode |

---

### 5.9 Public Pages Functionality

| Page | Functional Features |
|------|-------------------|
| **Home** | Hero slider (auto-play, swipe, category filter), featured product grid, dynamic banners (promotional scrolling + regular), newsletter signup, page-specific FAQ section |
| **Shop** | Product grid with real-time filters (category, price range, brand, color, size, material), sort by (price asc/desc, name, rating, newest), infinite scroll/pagination, search with debounce, quick-add-to-cart, wishlist toggle |
| **Categories** | Category grid with images + product counts, click-through to filtered shop page |
| **Product Detail** | Image gallery (multi-image swiper), variant selection (size/color), quantity selector, add-to-cart, wishlist button, product reviews (read + write), related products, stock status indicator, discount countdown timer, free shipping badge |
| **Cart** | Item list with quantity ±, remove item, coupon code input + validation + discount display, order summary (subtotal, shipping, tax, discount, total), proceed to checkout, empty cart state |
| **Checkout** | Address selection from saved addresses OR new address form, delivery type toggle (delivery/pickup), pickup location selector with store details, payment method selection (online/POD), order review summary, coupon application, place order |
| **About** | Company information, mission, team |
| **Contact** | Contact form (name, email, message), form validation, success feedback |
| **FAQ** | Categorized accordion, search, page-specific FAQs, helpful/unhelpful voting |
| **Privacy / Terms** | Legal pages |
| **Unsubscribe** | Newsletter unsubscribe via URL parameter |

---

### 5.10 Authentication Pages Functionality

| Page | Functional Features |
|------|-------------------|
| **Login** | Email/password form with validation, Google OAuth button, "Forgot Password" link, redirect back to original page on success, error display |
| **Register** | Email + password + name + phone, sends OTP to email, OTP input component (6 digits, auto-advance), resend OTP with cooldown, account creation on verify |
| **Forgot Password** | Email input → sends OTP → OTP verification → password reset form |
| **Reset Password** | New password + confirm with strength indicator |
| **Google Callback** | Handles OAuth redirect, exchanges token, auto-login |

---

### 5.11 User Dashboard Functionality

| Page | Functional Features |
|------|-------------------|
| **Dashboard** | Overview cards (total orders, total spent, wishlist count), recent orders table, quick action links |
| **Orders** | Order list with status badges (color-coded), date formatting, amount display, click to track, invoice link |
| **Track Order** | Step progress indicator (Pending → Processing → Shipped → Delivered), order details, estimated delivery |
| **Invoice** | Printable invoice layout with order items, pricing breakdown, customer info, order number, date |
| **Wishlist** | Product cards with remove button, "Move to Cart" action, empty state |
| **Settings** | Profile edit (name, email, phone, avatar), password change (current + new + confirm), address management (CRUD, set default) |

---

### 5.12 Guest Features Functionality

| Feature | Implementation |
|---------|---------------|
| **Guest Cart** | Stored in localStorage, validated against live product data, synced to server on login |
| **Guest Checkout** | No account needed: email + name + phone, full checkout flow, order confirmation page |
| **Guest Order Tracking** | Enter email → OTP sent → verify → view all orders for that email, filter by status |
| **Guest Invoice** | View/print invoice via direct link (no auth required) |
| **Payment Tab Cleanup** | Guest cart cleared after successful payment via dedicated endpoint |

---

### 5.13 Admin Panel Functionality

| Page | Functional Features |
|------|-------------------|
| **Dashboard** | Revenue card (with % change), orders card (with status pie chart), new customers card, AOV card, revenue line chart (daily/weekly/monthly period selector), top 5 selling products, recent orders table, low stock alerts list, system health indicators (DB, email, storage, payment gateway) |
| **Products** | DataTable with search/filter/sort, inline toggle (active/featured), bulk actions (activate/deactivate/feature/unfeature/update category), create/edit form (name, description, price, cost, sale price, discount with expiry, category, brand, SKU auto-gen, stock, images upload via media library, video URL, tags, sizes, colors, materials, metadata JSON), CSV/Excel bulk import with template download, export to CSV |
| **Categories** | CRUD with slug auto-generation, image/icon upload, display order drag-reorder, active toggle, product count display |
| **Orders** | Full order table with multi-filter (status, payment status, date range, search by order#/customer), order detail view with item list and pricing breakdown, change status with reason (tracked in edit history), refund action, edit history timeline view |
| **Inventory** | Stock levels table with low-stock highlighting, adjust stock (add/remove with reason), restock action, bulk adjustment, adjustment history per product, warehouse location tracking |
| **Users** | User table with search, create user (with optional admin + permission group), edit profile, assign/change permission group, delete user, view user's orders |
| **Permissions** | Permission group list with user count, create group with granular permissions JSON editor, edit permissions per module (products, orders, users, analytics, settings, etc.), assign users to groups, super admin management, protect default groups from deletion |
| **Coupons** | CRUD with all coupon types (percentage/fixed/free-shipping), usage tracking (current/max), user usage limit, min order value, max discount cap, expiry date picker, active toggle |
| **Banners** | Regular banners (image, link, placement, pages, position, display order, carousel toggle), promotional banners (background color, text color, scroll speed/direction, dismissible, animation duration), active toggle, preview |
| **Hero Slides** | Full customization (image, fallback, title/subtitle/description, CTA text/link, colors for title/subtitle/CTA/overlay, overlay opacity, transition duration, autoplay interval), category tagging, display order drag-reorder, active toggle |
| **Payments** | Payment method toggle (online/POD), min/max order for POD, POD delivery days, gateway type selection (paystack/transactpay), transaction history |
| **Shipping** | Standard/express/local delivery rate configuration, min/max delivery days per tier, free shipping threshold, local delivery city list, express shipping toggle, pickup toggle |
| **Analytics** | Period selector (7d/30d/90d/1y), revenue chart (line/bar), order count by status (pie), top products by sales, top categories, payment method distribution, daily sales trend, customer growth curve |
| **Reports** | Generate reports (sales/inventory/customer) in PDF/CSV/Excel, date range filter, async generation with progress indicator, download completed reports, report job status tracking |
| **Reviews** | Review list with product/user/rating, moderate (approve/delete), rating distribution stats |
| **Notifications** | Notification list with type badges, mark read/unread, archive, create custom notification (title, message, type, action URL), unread count in header |
| **Newsletter** | Subscriber list with pagination/search, status filter (active/unsubscribed), manual add subscriber, edit subscriber tags, delete, export to CSV/JSON |
| **Contacts** | Submission list with read/unread status, detail view (auto-marks read), delete, search |
| **FAQ** | CRUD with category, page assignment (home/shop/categories/about/contact/general), display order, active toggle, helpfulness stats display |
| **Media Library** | Grid/list view of all uploads, upload new (image/document), add from URL, category filter, search, toggle featured, delete (removes physical file), select for use in product/banner forms |
| **E-commerce Settings** | Tax configuration (rate, name, include-in-price), payment configuration, shipping configuration — all in one settings page |
| **Site Settings** | Key-value settings management for global site configuration |

---

### 5.14 UI Components Functionality

| Component | Functional Features |
|-----------|-------------------|
| **Header** | Sticky nav, logo, navigation links, search bar (debounced), cart icon with item count badge, wishlist icon, user avatar dropdown (login/register or profile/orders/settings/logout), mobile hamburger menu, admin link (if admin) |
| **Footer** | Company links, category links, social media, newsletter signup form, copyright |
| **HeroSlider** | Auto-play with configurable interval, swipe/drag navigation, dot indicators, customizable transitions, lazy-loaded images with fallback, overlay with text, CTA buttons |
| **BannerCarousel / BannerDisplay** | Multiple banner types in correct placements, responsive sizing, click-through links |
| **PromotionalBanner** | Horizontally scrolling text, customizable speed/direction, dismissible (remembered), multi-line support |
| **ProductCard** | Image with hover effect, product name (truncated), price (with original/sale display), rating stars, "Add to Cart" button, wishlist heart toggle, "Out of Stock" badge, free shipping badge |
| **ProductReviews** | Review list with user name, rating stars, date, title, content; review form (rating selector, title, content, submit); purchase verification check |
| **EnhancedCart** | Full cart with quantity controls, line item totals, coupon code input with validate/apply/remove, order summary breakdown, loading states, empty state |
| **EnhancedCheckout** | Multi-step: 1) Address → 2) Delivery method → 3) Payment → 4) Review & confirm; address validation, delivery/pickup selection, store location picker with map/hours |
| **CheckoutModal** | Checkout flow in modal overlay for faster conversion |
| **WishlistButton** | Heart icon toggle with optimistic UI, login prompt if unauthenticated |
| **NewsletterSignup** | Email input + subscribe button, success/error feedback, duplicate detection |
| **FAQ (component)** | Accordion with expand/collapse, search filter, category tabs |
| **OTPInput** | 6-digit code input, auto-advance between fields, paste support, resend timer |
| **GoogleLogin** | Google sign-in button using @react-oauth/google, token handling |
| **RichTextEditor** | React Quill WYSIWYG for product descriptions, FAQ answers, page content |
| **ProductBulkUpload** | File upload (CSV/Excel), template download, preview parsed data, error display, batch create |
| **MediaLibraryModal** | Image picker overlay, grid view of uploaded media, upload new, search/filter, select for use |
| **NotificationDropdown** | Bell icon with unread count badge, dropdown list with type icons, mark all read, link to full notifications page |
| **ErrorBoundary** | Catches React errors, displays fallback UI, prevents full page crash |
| **SEO** | React Helmet Async for meta title, description, OG tags, canonical URLs per page |
| **ConfirmModal / DeleteModal** | Action confirmation with custom message, confirm/cancel buttons |
| **PermissionGate / RoleGate** | Conditional rendering — hides UI elements user doesn't have permission for |
| **AdminPermissionGuard** | Route-level guard — redirects if user lacks admin permissions |
| **SkeletonHeroLoader / Skeletons** | Loading skeleton placeholders matching layout (hero, product cards, tables) |
| **AdminLayout** | Sidebar navigation (collapsible), top navbar with user/notifications, breadcrumbs, content area |

---

## 6. Authentication & Security — Complete Functional Detail

### Authentication Flows

**1. Email/Password Registration:**
```
User enters email → POST /auth/otp/send-registration-otp → OTP email sent
User enters OTP → POST /auth/otp/verify-registration-otp → Account created → JWT issued
```

**2. Email/Password Login:**
```
User enters email + password → POST /auth/login → bcrypt verify
→ Returns: { token (JWT 7d), refreshToken, user object }
→ Frontend stores in localStorage with session expiry timestamp
```

**3. Google OAuth:**
```
User clicks Google Sign-In → Google SDK returns ID token
→ POST /auth/google → Backend verifies with google-auth-library
→ Creates user if new / fetches if existing → JWT issued
```

**4. Password Reset (OTP-based):**
```
POST /auth/otp/send-password-reset-otp → OTP sent to email
POST /auth/otp/verify-password-reset-otp → Returns temporary reset token
POST /auth/otp/reset-password (with reset token + new password) → Password updated
```

**5. Guest Order Tracking:**
```
Guest enters email → POST /auth/otp/send-guest-tracking-otp → OTP sent
POST /auth/otp/verify-guest-tracking-otp → Returns temporary access token
Guest can now view their orders using that token
```

**6. Token Refresh:**
```
Access token expires → Frontend intercepts 401
→ POST /auth/refresh with refreshToken → New access token
→ Retry failed request with new token
```

### OTP System Details
| Setting | Value |
|---------|-------|
| Expiry | 10 minutes |
| Max Attempts | 5 per OTP |
| Cooldown | 300 seconds between resends |
| Types | REGISTRATION, PASSWORD_RESET, GUEST_TRACKING |
| Storage | Database (OTP model) with expiry index |
| Format | 6-digit numeric code |

### Security Middleware Chain
```
Request → CORS check → Body size limit (55MB) → JSON parse
→ Decrypt (if encrypted) → Auth verify (if protected route)
→ Permission check (if admin route) → Route handler
→ Encrypt response (if enabled) → Send
```

### JWT Token Structure
| Field | Value |
|-------|-------|
| Payload | `{ userId, email, isAdmin }` |
| Access Token Expiry | 7 days |
| Refresh Token Expiry | 30 days |
| Algorithm | HS256 |
| Storage | localStorage (`auth_token`, `refresh_token`) |

### Permission System Architecture
```
User → AdminUser → PermissionGroup → Permissions JSON

Permissions JSON format:
{
  "products": { "view": true, "create": true, "edit": true, "delete": true, "export": true },
  "orders": { "view": true, "viewDetails": true, "edit": true, "changeStatus": true, "viewEditHistory": true, "refund": true },
  "users": { "view": true, "create": true, "edit": true, "delete": true },
  "coupons": { "view": true, "create": true, "edit": true, "delete": true },
  "banners": { "view": true, "create": true, "edit": true, "delete": true },
  "hero-slides": { "view": true, "create": true, "edit": true, "delete": true },
  "inventory": { "view": true, "create": true, "edit": true, "delete": true },
  "analytics": { "view": true },
  "reports": { "view": true, "export": true },
  "notifications": { "view": true, "create": true, "delete": true },
  "settings": { "view": true, "edit": true },
  "pages": { "view": true, "create": true, "edit": true, "delete": true },
  "forms": { "view": true, "create": true, "edit": true, "delete": true },
  "messages": { "view": true, "create": true, "edit": true, "delete": true },
  "contentBlocks": { "view": true, "create": true, "edit": true, "delete": true }
}
```

### Security Features
| Feature | Implementation |
|---------|---------------|
| Password Hashing | bcrypt with auto-generated salt |
| CORS | Whitelist-based: production domain + localhost variants |
| Rate Limiting | 100 requests per 15-minute window |
| File Upload Limits | 52MB max, Multer middleware |
| Request Body Limit | 55MB JSON/URL-encoded |
| SQL Injection Prevention | Prisma ORM parameterized queries |
| XSS Prevention | Input validation + React DOM escaping |
| CSRF | Token-based via JWT (not cookie-based sessions) |
| End-to-End Encryption | RSA-2048 + AES-256-GCM (optional toggle) |
| Nonce Replay Protection | Set-based nonce tracking (prunes at 1000) |
| Timestamp Freshness | 5-minute max age on encrypted payloads |
| Webhook Verification | Secret-based signature validation |
| Admin Route Protection | Double-layer: auth middleware + permission middleware |
| Session Timeout | 30 minutes (configurable) |
| Password Reset Tokens | Time-limited, single-use |

---

## 7. Payment Integration — Complete Functional Detail

### Payment Gateway Architecture
```
Frontend checkout → POST /payments/initialize
                         ↓
         ┌───────────────┴───────────────┐
         ▼                               ▼
    TransactPay                       Paystack
    (RSA encrypted)                   (API key)
         ↓                               ↓
    Payment Link                     Payment Page
         ↓                               ↓
    GET /transactpay/callback       POST /payments/verify/:ref
         ↓                               ↓
    Verify → Update Order           Verify → Create Order
         ↓                               ↓
    Clear Cart + Email              Clear Cart + Email
         ↓                               ↓
    Redirect to success             Return success response
```

### TransactPay Integration (Primary - Live)

| Step | Action |
|------|--------|
| 1. Initialize | POST to TransactPay API with RSA-encrypted payload (amount, customer info, callback URL) |
| 2. Encryption | Uses RSA-2048 public key from env to encrypt payment data (XML key format, base64 encoded) |
| 3. Order Created | Order created in DB with PENDING status before redirect |
| 4. Redirect | User redirected to TransactPay hosted payment page |
| 5. Callback | On success → GET callback with reference → verify with TransactPay API |
| 6. Verification | Verify payment status via TransactPay API → update order to COMPLETED |
| 7. Cart Cleanup | Clear user cart (authenticated) or trigger guest cart clear |
| 8. Email | Send order confirmation email to customer + admin notification |
| 9. Webhook | Backup verification via POST webhook (charge.success / charge.failed) |

### Paystack Integration (Secondary - Test)

| Step | Action |
|------|--------|
| 1. Initialize | POST to Paystack API with secret key (amount in kobo, email, callback URL) |
| 2. Redirect | User redirected to Paystack checkout page |
| 3. Callback | Frontend receives reference on redirect |
| 4. Verify | POST /payments/verify/:reference → verifies with Paystack API |
| 5. Create Order | On success → creates order in DB with COMPLETED payment status |
| 6. Webhook | charge.success event → backup order creation/update |

### Pay-on-Delivery (POD)

| Feature | Configuration |
|---------|--------------|
| Toggle | Admin can enable/disable POD |
| Min Order | Minimum order amount required for POD |
| Max Order | Maximum order amount allowed for POD |
| Extra Days | Additional delivery days for POD orders |
| Order Creation | POST /orders/pay-on-delivery → order created with PENDING payment status |
| Delivery Types | Supports both delivery and pickup for POD |
| Pickup Reference | Generates unique pickup reference code for in-store collection |

### Payment Configuration (Admin-Managed)

| Setting | Description |
|---------|-------------|
| `isPayOnDeliveryEnabled` | Enable/disable COD |
| `isOnlinePaymentEnabled` | Enable/disable online payment |
| `minOrderForPOD` | Minimum cart total for COD eligibility |
| `maxOrderForPOD` | Maximum cart total for COD |
| `podDeliveryDays` | Additional delivery days for COD orders |
| `paymentGatewayType` | Active gateway: "paystack" or "transactpay" |

### Shipping Cost Calculation

| Tier | Config Fields |
|------|--------------|
| **Standard** | Fee, min days, max days |
| **Express** | Fee, min days, max days, enabled toggle |
| **Local Delivery** | Fee, min days, max days, eligible cities list, enabled toggle |
| **Free Shipping** | Threshold amount, enabled toggle |
| **Pickup** | No shipping cost, enabled toggle, store locations |

### Tax Calculation

| Setting | Description |
|---------|-------------|
| `enableTax` | Toggle tax on/off |
| `taxRate` | Percentage (default 7.5% VAT) |
| `taxName` | Display name (e.g., "VAT") |
| `includeTaxInPrice` | Whether listed prices already include tax |

### Order Total Calculation
```
Subtotal = Σ(item.price × item.quantity)
Discount = coupon applied (percentage/fixed/free-shipping)
Shipping = based on delivery type + tier + location
Tax = (subtotal - discount) × taxRate (if enabled and not included)
Total = subtotal - discount + shipping + tax
```

---

## 8. Email & Notifications — Complete Functional Detail

### Email Service Architecture
```
EmailService class (singleton)
├── Multi-provider fallback: Resend → Brevo → Zoho
├── Nodemailer transporter (SMTP)
├── HTML → Plain text conversion (accessibility/compliance)
├── List-Unsubscribe headers (one-click)
├── Non-blocking (errors logged, not thrown)
└── Template engine (EmailTemplates class)
```

### Email Providers (Auto-Fallback)
| Priority | Provider | Protocol | Port |
|----------|----------|----------|------|
| 1 | Resend | SMTP/TLS | 465 |
| 2 | Brevo | SMTP/STARTTLS | 587 |
| 3 | Zoho | SMTP/TLS | 465 |

### Email Templates & Triggers

| Template | Trigger Event | Contents |
|----------|--------------|----------|
| **Order Confirmation** | Order placed (auth + guest) | Order number, items table, pricing breakdown, delivery address, estimated delivery |
| **Order Status Update** | Admin changes order status | New status, order number, tracking info (if shipped) |
| **Payment Confirmation** | Payment verified successfully | Amount, payment reference, order summary |
| **Welcome Email** | New account registration completed | Welcome message, getting started links |
| **Registration OTP** | User requests registration | 6-digit OTP code, expiry time, security notice |
| **Password Reset OTP** | User requests password reset | 6-digit OTP code, expiry time, didn't-request notice |
| **Guest Tracking OTP** | Guest requests order tracking | 6-digit OTP code, order count preview |
| **Newsletter Welcome** | User subscribes to newsletter | Welcome message, unsubscribe link |
| **Admin: New Order Alert** | Any new order placed | Order number, customer info, items, total, action link |
| **Admin: Low Stock Alert** | Inventory drops below threshold | Product name, current stock, restock link |
| **Pickup Ready** | Order ready for pickup (status change) | Store location, hours, reference code |

### Email Features
| Feature | Implementation |
|---------|---------------|
| HTML + Plain Text | Auto-generated plain text fallback from HTML |
| Unsubscribe Header | RFC 8058 compliant List-Unsubscribe + One-Click |
| Branding | Configurable from name, from email, company name |
| Non-Blocking | Email failures don't crash the app — logged and skipped |
| Template Variables | Dynamic: customer name, order items, prices, links, OTP codes |
| Currency Formatting | ₦ (Naira) with proper thousand separators |

### In-App Notification System

| Feature | Detail |
|---------|--------|
| Types | INFO (blue), SUCCESS (green), WARNING (yellow), ERROR (red) |
| Fields | Title, message, type, actionUrl, actionType, actionId, metadata |
| Actions | Click to navigate (actionUrl), mark read, archive, delete |
| Auto-Create | Order placed, status change, low stock, new user registration |
| Sound Alert | Audio notification on new items (mp3 with Web Audio API fallback) |
| Polling | Frontend polls unread count every 2 minutes |
| Persistence | Stored in DB (Notification model), survives page refresh |
| Admin Only | Currently admin-facing (could extend to user-facing) |
| Bulk Actions | Mark all as read |

### Notification Sound System
```
1. Check if sound is enabled (localStorage preference)
2. On poll: compare new unread count vs. last known count
3. If increased → play notification sound
4. Sound source: MP3 file → fallback to Web Audio API generated tone
5. User can toggle sound on/off (persisted to localStorage)
```

---

## 9. Admin Panel — Complete Permission & Feature Matrix

### Permission Groups Architecture
```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│      User       │────▶│    AdminUser     │────▶│ PermissionGroup │
│ (base account)  │     │ (admin linkage)  │     │ (permissions)   │
└─────────────────┘     │ isSuperAdmin     │     │ JSON map        │
                        └──────────────────┘     └─────────────────┘
```

### Default Permission Groups
| Group | Access Level |
|-------|-------------|
| **Super Admin** | Full access to everything, can manage other admins |
| **Store Manager** | Products, orders, inventory, coupons, shipping |
| **Content Manager** | Banners, hero slides, FAQ, newsletter, media, pages |
| **Order Processor** | Orders (view + status change), inventory view |
| **Viewer** | View-only access across modules |

### Permission Modules & Actions
| Module | Available Permissions |
|--------|---------------------|
| `products` | view, create, edit, delete, export |
| `orders` | view, viewDetails, edit, changeStatus, viewEditHistory, refund |
| `users` | view, create, edit, delete |
| `coupons` | view, create, edit, delete |
| `banners` | view, create, edit, delete |
| `hero-slides` | view, create, edit, delete |
| `inventory` | view, create, edit, delete |
| `analytics` | view |
| `reports` | view, export |
| `notifications` | view, create, delete |
| `settings` | view, edit |
| `pages` | view, create, edit, delete |
| `forms` | view, create, edit, delete |
| `messages` | view, create, edit, delete |
| `contentBlocks` | view, create, edit, delete |
| `newsletter` | view, create, edit, delete, export |
| `faq` | view, create, edit, delete |
| `media` | view, upload, edit, delete |
| `reviews` | view, moderate, delete |
| `contacts` | view, edit, delete |

### Admin Dashboard Metrics
| Metric | Calculation |
|--------|------------|
| Total Revenue | Sum of all completed order totals |
| Revenue Growth | % change vs previous period |
| Total Orders | Count of orders in period |
| Orders Growth | % change vs previous period |
| New Customers | Users registered in period |
| Customer Growth | % change vs previous period |
| Average Order Value | Revenue / Orders |
| Top Products | Products sorted by total quantity sold |
| Orders by Status | Count per status (pie chart data) |
| Daily Sales | Revenue per day (line chart data) |
| Payment Methods | Distribution of online vs POD |
| System Health | DB connectivity, email service, storage space, payment gateway |

### Order Management Workflow
```
New Order → PENDING
   ↓
Admin reviews → PROCESSING (triggers email)
   ↓
Admin ships → SHIPPED (triggers email with tracking)
   ↓
Delivered → DELIVERED (triggers email)

Alt paths:
- PENDING/PROCESSING → CANCELLED (refund if paid)
- DELIVERED → RETURNED (refund initiated)
- Any status change → EditHistory record created
```

### Edit History Tracking
Every order modification records:
- Admin who made the change (AdminUser ID)
- Field that was changed
- Old value → New value
- Reason for change (optional)
- Timestamp

### Report Generation System
| Report Type | Contents |
|------------|----------|
| **Sales Report** | Revenue, orders, AOV, top products, by period/status |
| **Inventory Report** | Current stock levels, low stock items, restock dates |
| **Customer Report** | User count, new registrations, permission groups breakdown |

| Format | Implementation |
|--------|---------------|
| CSV | Direct data export, comma-separated |
| Excel | xlsx library — formatted sheets with headers |
| PDF | Generated with layout/formatting |

Report jobs are async with progress tracking:
```
PENDING → PROCESSING (progress 0-100%) → COMPLETED (file available) | FAILED (error message)
```

---

## 10. DevOps & Deployment

### Docker Services
| Service | Image | Purpose |
|---------|-------|---------|
| `postgres` | postgres:16-alpine | Database |
| `backend` | Custom (Dockerfile.backend) | API server |
| `frontend` | Custom (Dockerfile.client) | React SPA (served via nginx) |
| `nginx` | nginx:alpine | Reverse proxy + SSL termination |
| `certbot` | certbot/certbot | SSL cert auto-renewal |

### Deployment Scripts
| Script | Purpose |
|--------|---------|
| `deploy.sh` | Full deployment pipeline |
| `deploy-production.sh` | Production-specific deploy |
| `health-check.sh` | Service health verification |
| `pre-deploy-check.sh` | Pre-deployment validation |
| `validate-production.sh` | Production environment validation |
| `renew-ssl.sh` | Manual SSL renewal |
| `setup-server-env.sh` | Initial server setup |
| `start-dev.sh` | Local development startup |

### Nginx Configuration
- SSL termination (Let's Encrypt)
- Reverse proxy to backend (port 5004)
- Static file serving (frontend build)
- Upload file serving (/uploads)
- Caching configuration
- Security headers
- Gzip compression

### Health Checks
- PostgreSQL: `pg_isready` (10s interval)
- Backend: HTTP GET `/health` (30s interval)
- Frontend: HTTP GET `/` (30s interval)
- Nginx: HTTP GET `/` (30s interval)

---

## 11. Environment Configuration

### Required Environment Variables

```env
# ── Core ──
NODE_ENV=production
PORT=5004

# ── URLs ──
VITE_API_URL=https://api.yourdomain.com/api/v1
CLIENT_URL=https://yourdomain.com
FRONTEND_URL=https://yourdomain.com

# ── Database ──
DB_USER=your_db_user
DB_PASSWORD=secure_password_32_chars_min
DB_NAME=your_db_name
DB_HOST=postgres
DB_PORT=5432
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# ── Auth ──
JWT_SECRET=random_secret_32_chars_min
JWT_EXPIRE=7d
REFRESH_TOKEN_SECRET=another_random_secret_32_chars

# ── Payment (choose one or more) ──
TRANSACTPAY_PUBLIC_KEY=
TRANSACTPAY_SECRET_KEY=
TRANSACTPAY_ENCRYPTION_KEY=
TRANSACTPAY_API_URL=https://payment-api-service.transactpay.ai
PAYSTACK_SECRET_KEY=
PAYSTACK_PUBLIC_KEY=

# ── Google OAuth ──
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=https://yourdomain.com/api/v1/auth/google/callback
VITE_GOOGLE_CLIENT_ID=

# ── Email (SMTP) ──
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_USER=resend
SMTP_PASS=your_api_key
SMTP_FROM_EMAIL=noreply@yourdomain.com
SMTP_FROM_NAME=YourBrand

# ── OTP ──
OTP_EXPIRY_MINUTES=10
OTP_MAX_ATTEMPTS=5
OTP_COOLDOWN_SECONDS=300

# ── File Upload ──
MAX_FILE_SIZE=52428800
UPLOAD_DIR=./uploads
STORAGE_DIR=./storage

# ── CORS ──
CORS_ORIGIN=https://yourdomain.com

# ── Rate Limiting ──
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# ── Session ──
SESSION_SECRET=random_session_secret

# ── Encryption (optional) ──
ENCRYPTION_ENABLED=false
VITE_ENCRYPTION_ENABLED=false
# Generate RSA key pairs if enabling encryption
```

---

## 12. Project Structure

```
project-root/
├── package.json                 # Root monorepo package
├── docker-compose.yml           # Multi-service orchestration
├── Dockerfile.backend           # Backend container build
├── Dockerfile.client            # Frontend container build
├── .env.production              # Production environment variables
│
├── backend/
│   ├── package.json             # Backend dependencies
│   ├── server.js                # Express app entry point
│   ├── middleware/
│   │   ├── auth.js              # JWT verification
│   │   ├── enhanced-auth.js     # Extended auth middleware
│   │   ├── permissions.js       # Permission checking
│   │   ├── admin-permissions.js # Admin permission validation
│   │   ├── encryption.js        # Request/response encryption
│   │   ├── emailIntegration.js  # Email event hooks
│   │   ├── media-tracker.js     # Media usage tracking
│   │   └── syncHooks.js         # Real-time sync triggers
│   ├── routes/
│   │   ├── auth.js              # Auth (register, login, refresh)
│   │   ├── auth-otp.js          # OTP-based auth flows
│   │   ├── google-auth.js       # Google OAuth
│   │   ├── products.js          # Product CRUD
│   │   ├── enhanced-products.js # Advanced product operations
│   │   ├── bulk-products.js     # CSV/Excel import
│   │   ├── categories.js        # Category CRUD
│   │   ├── cart.js              # Cart operations
│   │   ├── guest-cart.js        # Guest cart
│   │   ├── orders.js            # Order operations
│   │   ├── guest-orders.js      # Guest checkout/orders
│   │   ├── guest-tracking-otp.js# Guest order tracking OTP
│   │   ├── payments-clean.js    # Payment operations
│   │   ├── transactpay.js       # TransactPay integration
│   │   ├── paymentConfig.js     # Payment configuration
│   │   ├── coupons.js           # Coupon operations
│   │   ├── inventory.js         # Inventory management
│   │   ├── wishlist.js          # Wishlist operations
│   │   ├── reviews.js           # Product reviews
│   │   ├── banners.js           # Banner CRUD
│   │   ├── hero-slides.js       # Hero slider CRUD
│   │   ├── faq.js               # FAQ CRUD
│   │   ├── newsletter.js        # Newsletter subscriptions
│   │   ├── contact.js           # Contact form
│   │   ├── media.js             # Media library
│   │   ├── notifications.js     # Notification system
│   │   ├── users.js             # User management
│   │   ├── user-dashboard.js    # User dashboard data
│   │   ├── admin.js             # General admin routes
│   │   ├── admin-orders.js      # Admin order management
│   │   ├── admin-dashboard.js   # Admin dashboard stats
│   │   ├── admin-permissions.js # Permission management
│   │   ├── admin-user-permissions.js # User-permission assignment
│   │   ├── permission-groups.js # Permission group CRUD
│   │   ├── analytics.js         # Analytics data
│   │   ├── reports.js           # Report generation
│   │   ├── report-jobs.js       # Async report jobs
│   │   ├── taxConfig.js         # Tax configuration
│   │   ├── shippingConfig.js    # Shipping configuration
│   │   ├── storeLocations.js    # Store location CRUD
│   │   ├── sitemap.js           # Dynamic sitemap
│   │   ├── sync.js              # Real-time sync
│   │   ├── content.js           # CMS content
│   │   └── public.js            # Public/unauthenticated routes
│   ├── services/
│   │   ├── emailService.js      # Email sending (multi-provider)
│   │   ├── emailTemplates.js    # HTML email templates
│   │   ├── modernEmailTemplates.js # Updated templates
│   │   ├── brevoEmailService.js # Brevo-specific service
│   │   ├── notificationService.js # In-app notifications
│   │   ├── otpService.js        # OTP generation/verification
│   │   ├── InventoryService.js  # Inventory business logic
│   │   └── messagingHub.js      # Messaging coordination
│   ├── utils/
│   │   ├── encryptionService.js # RSA encryption utility
│   │   ├── transactpayEncryption.js # TransactPay-specific encryption
│   │   └── reportGenerator.js   # PDF/CSV/Excel report generation
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema
│   │   ├── seed.js              # Database seeding
│   │   └── migrations/          # Database migrations
│   ├── scripts/                 # Utility scripts
│   ├── uploads/                 # Uploaded files
│   └── storage/                 # Generated files (reports, etc.)
│
├── client/
│   ├── package.json             # Frontend dependencies
│   ├── index.html               # SPA entry HTML
│   ├── vite.config.ts           # Vite configuration
│   ├── tailwind.config.js       # Tailwind configuration
│   ├── tsconfig.json            # TypeScript configuration
│   ├── src/
│   │   ├── main.tsx             # React entry point
│   │   ├── App.tsx              # Root component + routing
│   │   ├── index.css            # Global styles (Tailwind imports)
│   │   ├── app/
│   │   │   └── store.ts         # Redux store configuration
│   │   ├── api/
│   │   │   ├── axios.ts         # Axios instance + interceptors
│   │   │   ├── admin.ts         # Admin API calls
│   │   │   ├── adminAPI.ts      # Extended admin APIs
│   │   │   ├── products.ts      # Product API calls
│   │   │   ├── payments.ts      # Payment API calls
│   │   │   ├── inventory.ts     # Inventory API calls
│   │   │   ├── coupons.ts       # Coupon API calls
│   │   │   ├── reviews.ts       # Review API calls
│   │   │   ├── users.ts         # User API calls
│   │   │   ├── guestOrders.ts   # Guest order API calls
│   │   │   ├── ecommerce.ts     # E-commerce config APIs
│   │   │   ├── enhanced.ts      # Enhanced product APIs
│   │   │   └── content.ts       # Content/CMS APIs
│   │   ├── features/            # Redux slices (state management)
│   │   │   ├── auth/authSlice
│   │   │   ├── cart/cartSlice
│   │   │   ├── products/productsSlice
│   │   │   ├── orders/ordersSlice
│   │   │   ├── admin/
│   │   │   ├── payment/
│   │   │   ├── users/
│   │   │   ├── inventory/
│   │   │   ├── ui/
│   │   │   ├── wishlistSlice
│   │   │   ├── couponsSlice
│   │   │   └── notificationsSlice
│   │   ├── hooks/               # Custom React hooks
│   │   ├── pages/               # Page components
│   │   │   ├── Home.tsx
│   │   │   ├── Shop.tsx
│   │   │   ├── ProductDetail.tsx
│   │   │   ├── Cart.tsx
│   │   │   ├── Checkout.tsx
│   │   │   ├── Login.tsx / Register.tsx
│   │   │   ├── UserDashboard.tsx
│   │   │   ├── admin/           # Admin page components
│   │   │   └── ...
│   │   ├── components/          # Reusable UI components
│   │   ├── services/            # Frontend service layer
│   │   │   ├── productService.ts
│   │   │   ├── orderService.ts
│   │   │   ├── userService.ts
│   │   │   ├── inventoryService.ts
│   │   │   ├── couponService.ts
│   │   │   ├── notificationService.ts
│   │   │   └── cacheService.ts
│   │   ├── context/
│   │   │   └── ModalContext.tsx  # Modal state management
│   │   ├── modules/
│   │   │   └── admin/           # Admin-specific module
│   │   │       ├── pages/
│   │   │       ├── services/
│   │   │       ├── components/
│   │   │       ├── hooks/
│   │   │       ├── types/
│   │   │       ├── utils/
│   │   │       └── layouts/
│   │   ├── routes/
│   │   │   └── ProtectedRoute.tsx # Auth guard component
│   │   ├── types/               # TypeScript type definitions
│   │   └── utils/
│   │       ├── encryptionService.ts # Client-side encryption
│   │       ├── transactpay.ts   # TransactPay helpers
│   │       ├── paystack.ts      # Paystack helpers
│   │       ├── pricing.ts       # Price calculation utilities
│   │       ├── couponUtils.ts   # Coupon validation helpers
│   │       ├── imageUrl.ts      # Image URL resolution
│   │       └── notificationSound.ts # Notification audio
│   └── public/                  # Static assets
│
├── nginx/
│   ├── nginx.conf               # Main nginx config
│   ├── app.conf                 # App-specific server block
│   ├── frontend.conf            # Frontend serving config
│   └── conf.d/                  # Additional configs
│
├── keys/                        # RSA key storage
├── scripts/                     # DevOps scripts
│   ├── health-check-complete.sh
│   ├── validate-deployment.sh
│   ├── run-integration-tests.sh
│   └── collect-telemetry.sh
│
└── [deployment scripts at root]
    ├── deploy.sh
    ├── deploy-production.sh
    ├── health-check.sh
    ├── pre-deploy-check.sh
    ├── setup-server-env.sh
    └── renew-ssl.sh
```

---

## Quick Start for New Project

### 1. Initialize
```bash
mkdir my-ecommerce && cd my-ecommerce
npm init -y
# Set up package.json scripts for monorepo
```

### 2. Backend Setup
```bash
mkdir backend && cd backend
npm init -y
npm install express @prisma/client cors dotenv jsonwebtoken bcryptjs nodemailer multer uuid axios
npm install -D prisma
npx prisma init
# Copy schema.prisma, configure DATABASE_URL
npx prisma migrate dev --name init
```

### 3. Frontend Setup
```bash
cd .. && npm create vite@latest client -- --template react-ts
cd client
npm install @reduxjs/toolkit react-redux react-router-dom axios framer-motion lucide-react react-hot-toast swiper redux-persist clsx tailwind-merge react-helmet-async
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 4. Docker Setup
```bash
# Create Dockerfile.backend, Dockerfile.client, docker-compose.yml
# Configure nginx reverse proxy
# Set up SSL with certbot
```

### 5. Key Implementation Order
1. Database schema + migrations
2. Auth (register, login, JWT)
3. Products CRUD
4. Categories
5. Cart system
6. Orders + Checkout
7. Payment integration
8. Email service
9. Admin dashboard
10. User dashboard
11. Inventory management
12. Coupons
13. Reviews/Wishlist
14. Banners/Hero slides
15. Newsletter/Contact
16. Permissions system
17. Analytics/Reports
18. Media library
19. SEO/Sitemap
20. Deployment pipeline

---

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Prisma ORM | Type-safe database access, auto-migrations, introspection |
| Redux Toolkit | Predictable state, devtools, async thunks built-in |
| Vite | Fast HMR, optimized builds, ESM-first |
| Express (not Fastify) | Mature ecosystem, extensive middleware |
| PostgreSQL | ACID compliance, JSON support, reliable for e-commerce |
| Docker Compose | Reproducible environments, easy scaling |
| JWT (not sessions) | Stateless, scalable, works with SPA |
| Multi-provider email | Failover capability, vendor independence |
| Guest checkout | Reduces friction, higher conversion |
| OTP verification | No email-link dependency, mobile-friendly |
| RSA encryption (optional) | Extra security layer for sensitive data |
| Permission groups (not roles) | Flexible, granular, auditable access control |
