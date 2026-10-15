# ShopKart — Labs 01, 02 & 03

A complete ShopKart implementation covering:

- Customer registration
- bcrypt password hashing
- JWT authentication in an HttpOnly cookie
- Protected profile/home
- Logout
- Product creation API
- Product listing API
- Search
- Category filtering
- Product details
- Loading/error/empty states
- Responsive React UI
- Bonus change-password API
- Bonus product sorting API

## Project structure

```text
shopkart/
├── backend/
└── frontend/
```

## Prerequisites

- Node.js
- MongoDB running locally (or a MongoDB connection string)
- npm

## 1. Start backend

```bash
cd backend
cp .env.example .env
```

Edit `.env` and set `MONGO_URI` and `JWT_SECRET`.

Then:

```bash
npm install
npm run seed
npm run dev
```

Backend runs on `http://localhost:5000`.

## 2. Start frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the Vite URL shown in the terminal, normally `http://localhost:5173`.

The Vite development proxy forwards `/customers` and `/products` to the backend, so no `cors` package is required.

## 3. Test the full flow

1. Open `/register`.
2. Create a customer.
3. Log in at `/login`.
4. You are redirected to `/home`.
5. Open `/products`.
6. Search for a product.
7. Select a category.
8. Click View Details.
9. Click Logout.

## API routes

### Authentication

- `POST /customers/register`
- `POST /customers/login`
- `GET /customers/me`
- `POST /customers/logout`
- `PATCH /customers/change-password` (bonus)

### Products

- `POST /products`
- `GET /products`
- `GET /products/:id`

Examples:

```text
GET /products?search=phone
GET /products?category=Electronics
GET /products?search=phone&category=Electronics
GET /products?sort=price_asc
GET /products?sort=price_desc
```

## Important lab interpretation

When a customer selects a category such as `Electronics`, the products page should show only products whose backend `category` matches `Electronics`. Selecting `All Categories` removes the category filter.

The product details "Add to Cart" button is intentionally UI-only because the supplied Lab 03 specification says cart backend functionality belongs to a later lab.

## Security notes

- Passwords are never stored as plaintext.
- Passwords are never returned in API responses.
- JWT is stored in an HttpOnly cookie.
- Invalid login returns the same generic `Invalid credentials` response.
- `/customers/me` requires a valid cookie.
