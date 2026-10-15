# 🛒 ShopKart

ShopKart is a modern e-commerce web app where users can browse products, save items to a wishlist, manage their cart, and place orders seamlessly.

> End-term project, SST 2029B

## ✨ Features

- Browse and search products
- Product details page
- Wishlist: save and remove favourite items
- Shopping cart: add, remove, and update quantities
- User signup and login
- Place and view orders
- Input validation and error handling on the API (for example, invalid product IDs)

## 🧰 Tech Stack

| Layer    | Technology                          |
| -------- | ----------------------------------- |
| Frontend | HTML, CSS, JavaScript (or React)    |
| Backend  | Node.js, Express.js                 |
| Database | MongoDB with Mongoose               |

## 📁 Project Structure

```
shopkart-endtermProject-sst2029b/
├── shopkart/          # Main project code
│   ├── ...            # (controllers, models, routes, frontend, etc.)
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or later)
- [MongoDB](https://www.mongodb.com/) (local install or a MongoDB Atlas connection string)
- Git

### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/shanmukhi113-ops/shopkart-endtermProject-sst2029b.git
   cd shopkart-endtermProject-sst2029b/shopkart
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Create a `.env` file in the project folder

   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key
   ```

4. Start the app

   ```bash
   npm start
   ```

   For development with auto-reload (if configured):

   ```bash
   npm run dev
   ```

5. Open `http://localhost:5000` in your browser.

## 🔌 API Overview

| Method | Endpoint                | Description               |
| ------ | ----------------------- | ------------------------- |
| GET    | `/api/products`         | Get all products          |
| GET    | `/api/products/:id`     | Get a single product      |
| POST   | `/api/wishlist/:id`     | Add a product to wishlist |
| DELETE | `/api/wishlist/:id`     | Remove from wishlist      |
| POST   | `/api/cart`             | Add an item to the cart   |
| POST   | `/api/orders`           | Place an order            |

> Update these routes to match your actual API.

## 🖼️ Screenshots

_Add screenshots of your home page, wishlist, and cart here._

```markdown
![Home Page](screenshots/home.png)
```

## 🔮 Future Improvements

- Online payment integration
- Product reviews and ratings
- Admin dashboard for managing products
- Order tracking

## 👩‍💻 Author

**Shanmukhi**
GitHub: [@shanmukhi113-ops](https://github.com/shanmukhi113-ops)

## 📄 License

This project is for educational purposes.
