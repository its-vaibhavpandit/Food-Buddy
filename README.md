# 🍔 Fast Food Buddy — Enterprise Fast Food & Street Food Delivery Platform

Fast Food Buddy is a high-performance, commercial-grade, secure, and SEO-optimized full-stack food delivery web application built using React/Next.js on the frontend and Node.js/Express/MongoDB on the backend. 

Designed with a premium warm-themed aesthetic, dynamic Framer Motion micro-animations, a custom Leaflet interactive GPS location picker, and an instant UPI QR payment gateway integration, this platform offers a seamless street-food ordering and delivery tracing experience.

---

## 🚀 Outstanding Key Features

### 💻 Client Side (Next.js 16 + React 19)
- **Premium Aesthetics**: Warm-theme design tokens with curated colors (charcoal base, flame orange primary, sage accents, and warm cream background) with fully responsive layouts.
- **Dynamic Leaflet Location Picker**: Automatic GPS location detection and reverse geocoding via Nominatim API. Users can drag delivery pins on an interactive OpenStreetMap to select drop-off locations, with live distance calculation and delivery time estimation.
- **UPI QR Code Payment Gateway**: Scan-to-pay UPI QR code generator (linked to `7991627968@mbk`) matching UPI Deep-Link specifications. Displays a live countdown payment timer and accepts transaction reference confirmation.
- **Bhukkad AI Food Assistant**: Contextual chatbot that recommends meals, tracks delivery times, suggests city-famous specialties, and calculates smart swap health suggestions.
- **Nutritional Information Tracker**: Complete macronutrient breakdown (calories, protein, carbs, fats) for menu items.
- **Optimistic UI Updates**: Cart item quantity updates instantly for a fluid shopping cart experience.
- **SEO & Search Engine Optimized**: Meta canonical tags, Twitter cards, Open Graph, dynamic breadcrumbs with Schema.org JSON-LD breadcrumb lists, and structured LocalBusiness microdata.

### 📡 Server Side (Express + Mongoose + TypeScript)
- **Hardened Security**: 
  - Express-Rate-Limit constraints on API endpoints (global threshold + strict auth rate-limiting).
  - Secure helmet headers, rigid CORS setup, and cookie parsing.
  - HttpOnly cookies with secure same-site flag for token exchanges.
  - **Refresh Token Rotation (RTR)**: Stateful token reuse detection instantly revokes all sessions if a stolen refresh token is reused.
  - Constant-time password hashing with BcryptJS to prevent timing attacks.
  - Request body size limits (10kb) to prevent buffer overflows and DOS.
- **Query Performance & DB Tuning**:
  - Connection pooling configurations (`maxPoolSize: 10`) on Mongoose.
  - Text search indexes on menu items (`name` and `description`) for high-performance query execution.
  - Compound indexes on `{ category: 1, isAvailable: 1 }` and `{ user: 1, createdAt: -1 }` for optimized sorting.
  - High-performance read queries using Mongoose `.lean()`.
  - Pagination limits to restrict database payload size.
- **Graceful Shutdown**: Close active HTTP listeners and drain/close Mongoose database connections upon receiving OS termination signals (`SIGTERM` or `SIGINT`).

---

## 📂 Project Structure

```text
.
├── platform/
│   ├── client/           # Next.js (TypeScript) Frontend React App
│   │   ├── public/       # SEO files (sitemap, robots) and static assets
│   │   └── src/
│   │       ├── app/      # Next.js pages and layouts (SEO wrapper files)
│   │       ├── components/# Premium React UI components & map hooks
│   │       └── lib/      # QR generators, API clients, and validators
│   └── server/           # Express (TypeScript) API Backend
│       ├── src/
│       │   ├── config/   # Environment checks, DB connection pool
│       │   ├── controllers/# Optimized Auth, Cart, Order controllers
│       │   ├── models/   # Mongoose schemas with compound indexes
│       │   └── utils/    # Shared utilities (slugify, shutdown)
└── start.bat             # Full-stack concurrency launcher script
```

---

## 🛠️ Installation & Getting Started

### Prerequisites
- Node.js (v18+)
- npm / yarn
- MongoDB Instance (Local or Atlas)

### Setup & Startup

1. **Clone the repository**
   ```bash
   git clone https://github.com/its-vaibhavpandit/Fast-Food-Buddy.git
   cd Fast-Food-Buddy
   ```

2. **Environment Variables Configuration**
   - Create a `.env` file under `platform/server/` matching the properties below:
     ```env
     NODE_ENV=development
     PORT=5000
     CLIENT_URL=http://localhost:3000
     MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/fastfood
     JWT_SECRET=your_jwt_access_secret_key
     JWT_REFRESH_SECRET=your_jwt_refresh_secret_key
     UPI_ID=7991627968@mbk
     ```
   - Reference templates: `platform/server/.env.production.example` and `platform/client/.env.production.example`.

3. **Database Seeding**
   To seed your database with 100+ menu items, categories, and demo admin profiles:
   ```bash
   cd platform/server
   npm install
   npm run seed
   ```

4. **Concurrently Start Client and Server**
   Double-click the `start.bat` script in the root directory. It will:
   - Check dependency folders.
   - Install missing packages automatically.
   - Concurrently start the Backend Express API (port 5000) in a separate window.
   - Start the Next.js frontend developer server (port 3000) in the current window.

---

## 🏁 Deployment Checklist

- [ ] **Secure Variables**: Ensure `JWT_SECRET` and `JWT_REFRESH_SECRET` are replaced with high-entropy cryptographic strings.
- [ ] **DB Connection Pool**: Set environment connection strings. Ensure the firewall permits IP access from your hosting provider.
- [ ] **CORS Configuration**: Change `CLIENT_URL` in backend `.env` to match your production website domain.
- [ ] **robots.txt & sitemap.xml**: Edit the default canonical domain placeholder `https://fastfoodbuddy.in` inside `robots.txt` and `sitemap.xml` in `platform/client/public/`.
- [ ] **Build Optimization**: Run `npm run build` on the client to compile static page assets and generate optimized bundle sizes.
- [ ] **PM2 Process Manager**: Recommended to launch the server under PM2 for automatic reboots and cluster load balancing:
  ```bash
  pm2 start dist/app.js --name fast-food-buddy-api
  ```

---

## 📝 License
This project is licensed under Vaibhav Pandit for showcase, personal learning, and further commercial application development.
