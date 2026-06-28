# Fast Food Buddy

Fast Food Buddy is a full-stack food ordering experience that blends a bold, modern storefront with a practical ordering flow, backend APIs, and a lightweight admin area. The project is designed around fast browsing, clear menu discovery, responsive checkout, and a playful branded experience that still feels production-minded.

## Highlights

- Immersive landing page with animated sections, category browsing, and featured dishes
- Full menu browsing with category filters, veg-only toggle, search, and client-side sorting
- Authentication-ready customer flow with login, register, cart, checkout, and order history pages
- Express + MongoDB backend for auth, menu, cart, order, and admin APIs
- Built-in "Bhukkad AI Bot" style assistant for food suggestions and interactive recommendations
- Contact and about pages with a strong local-brand storytelling feel
- Legacy HTML/PHP admin screens preserved alongside the newer platform build

## Project Structure

```text
.
|-- admin/                  # Legacy admin screens and PHP handlers
|-- img/                    # Shared media for the legacy site
|-- js/                     # Legacy frontend scripts
|-- platform/
|   |-- client/             # Next.js frontend
|   `-- server/             # Express + TypeScript backend
`-- start.bat               # Convenience script for starting the client locally
```

## Tech Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Framer Motion
- React Hook Form
- TanStack Query
- Zustand

### Backend

- Node.js
- Express
- TypeScript
- MongoDB
- Mongoose
- Zod
- JWT authentication

## Core User Experience

### Customer-facing app

- Browse curated fast-food and street-food categories
- Search and filter menu items quickly
- Add dishes to cart and move through a structured checkout flow
- Place orders with cash on delivery or simulated online payment
- Review profile and order history screens

### Brand personality

- Strong local-first food identity
- Motion-rich interface with bright accents and modern layout patterns
- Conversational recommendation assistant for playful discovery

### Admin and legacy assets

- Older HTML/PHP admin pages are included for reference and continuity
- The modern platform lives under `platform/` and is the primary codebase going forward

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/its-vaibhavpandit/Fast-Food-Buddy.git
cd Fast-Food-Buddy
```

### 2. Start the frontend

```bash
cd platform/client
npm install
npm run dev
```

The client will be available at `http://localhost:3000`.

### 3. Start the backend

Open a second terminal:

```bash
cd platform/server
npm install
```

Copy `platform/server/.env.example` to `.env`, update it with your own MongoDB URI and JWT secrets, then run:

```bash
npm run dev
```

The API will run on `http://localhost:5000` by default.

## Environment Variables

The backend expects these values inside `platform/server/.env`:

```env
MONGODB_URI=
JWT_SECRET=
JWT_REFRESH_SECRET=
PORT=5000
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

An example template is already included at `platform/server/.env.example`.

## Notes for Development

- `node_modules`, local `.env` files, build caches, and large local media are intentionally excluded from version control.
- `platform/server/src/test-db.ts` is safe to use with your own environment variables for connection checks.
- The repository includes both a modern full-stack platform and legacy static/admin assets, which makes it useful for iteration as well as portfolio presentation.

## Future Ideas

- Real payment gateway integration
- Admin dashboard migration into the modern stack
- Order tracking with live status updates
- Better analytics and inventory insights
- Email or WhatsApp notifications for customers

## License

This project is available for personal learning, showcase, and further product development.
