# 📚 Electronics Store - Complete API Documentation

**Version:** 1.0.0  
**Base URL (Local):** `http://localhost:3001/api`  
**Base URL (Production):** `https://your-backend.railway.app/api`

---

## 📋 Table of Contents

1. [Authentication](#1-authentication)
2. [Categories](#2-categories)
3. [Products](#3-products)
4. [Orders](#4-orders)
5. [Users](#5-users)
6. [File Uploads](#6-file-uploads)
7. [Health Check](#7-health-check)
8. [Error Codes](#8-error-codes)
9. [Response Format](#9-response-format)

---

## 🔐 Authentication

All authenticated endpoints require a JWT token in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

Tokens are valid for 30 days and returned on successful login/registration.

---

### 1.1 Register New User

Create a new customer account.

**Endpoint:** `POST /api/auth/register`  
**Access:** Public  
**Content-Type:** `application/json`

#### Request Body

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+855123456789"
}
```

#### Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `firstName` | string | Yes | User's first name (2-50 chars) |
| `lastName` | string | Yes | User's last name (2-50 chars) |
| `email` | string | Yes | Valid email address (unique) |
| `password` | string | Yes | Password (min 6 chars) |
| `phone` | string | No | Phone number |

#### Success Response (201 Created)

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "+855123456789",
      "role": "customer",
      "isActive": true,
      "avatar": null,
      "createdAt": "2026-02-19T10:00:00.000Z",
      "updatedAt": "2026-02-19T10:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Error Responses

**400 Bad Request** - Missing or invalid fields
```json
{
  "success": false,
  "error": {
    "message": "Validation error: Email is required",
    "status": 400
  }
}
```

**409 Conflict** - Email already exists
```json
{
  "success": false,
  "error": {
    "message": "User already exists with this email",
    "status": 409
  }
}
```

---

### 1.2 Login

Authenticate and receive JWT token.

**Endpoint:** `POST /api/auth/login`  
**Access:** Public  
**Content-Type:** `application/json`

#### Request Body

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "role": "customer"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Error Responses

**400 Bad Request** - Missing fields
```json
{
  "success": false,
  "error": {
    "message": "Email and password are required",
    "status": 400
  }
}
```

**401 Unauthorized** - Invalid credentials
```json
{
  "success": false,
  "error": {
    "message": "Invalid credentials",
    "status": 401
  }
}
```

---

### 1.3 Get Current User

Retrieve authenticated user's information.

**Endpoint:** `GET /api/auth/me`  
**Access:** Private (requires authentication)  
**Headers:** `Authorization: Bearer <token>`

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "+855123456789",
      "role": "customer",
      "isActive": true,
      "avatar": "https://bucket.railway.app/avatars/user-1.jpg",
      "address": {
        "street": "123 Main St",
        "city": "Phnom Penh",
        "country": "Cambodia"
      },
      "createdAt": "2026-02-19T10:00:00.000Z",
      "updatedAt": "2026-02-19T10:30:00.000Z"
    }
  }
}
```

#### Error Responses

**401 Unauthorized** - Missing or invalid token

---

## 📁 2. Categories

### 2.1 Get All Categories

Retrieve all active categories.

**Endpoint:** `GET /api/categories`  
**Access:** Public

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": 1,
        "name": "Smartphones",
        "slug": "smartphones",
        "description": "Latest smartphones and accessories",
        "image": "https://bucket.railway.app/categories/smartphones.jpg",
        "icon": "📱",
        "isActive": true,
        "sortOrder": 1,
        "createdAt": "2026-02-19T10:00:00.000Z",
        "updatedAt": "2026-02-19T10:00:00.000Z"
      },
      {
        "id": 2,
        "name": "Laptops",
        "slug": "laptops",
        "description": "High-performance laptops",
        "image": "https://bucket.railway.app/categories/laptops.jpg",
        "icon": "💻",
        "isActive": true,
        "sortOrder": 2,
        "createdAt": "2026-02-19T10:00:00.000Z",
        "updatedAt": "2026-02-19T10:00:00.000Z"
      }
    ]
  }
}
```

---

### 2.2 Get Single Category

Get category details with its products.

**Endpoint:** `GET /api/categories/:id`  
**Access:** Public

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "category": {
      "id": 1,
      "name": "Smartphones",
      "slug": "smartphones",
      "description": "Latest smartphones",
      "image": "https://bucket.railway.app/categories/smartphones.jpg",
      "icon": "📱",
      "isActive": true,
      "sortOrder": 1,
      "products": [
        {
          "id": 1,
          "name": "iPhone 15 Pro",
          "slug": "iphone-15-pro",
          "price": "999.00",
          "salePrice": "899.00",
          "images": ["https://bucket.railway.app/products/iphone-1.jpg"],
          "badge": "Hot",
          "rating": "4.8",
          "reviewCount": 234,
          "stock": 50
        }
      ]
    }
  }
}
```

#### Error Response

**404 Not Found** - Category doesn't exist

---

### 2.3 Create Category

Create a new category.

**Endpoint:** `POST /api/categories`  
**Access:** Private (Admin only)  
**Headers:** `Authorization: Bearer <admin_token>`

#### Request Body

```json
{
  "name": "Tablets",
  "slug": "tablets",
  "description": "iPads and Android tablets",
  "icon": "📱",
  "image": "https://example.com/tablets.jpg",
  "sortOrder": 3
}
```

#### Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Category name (2-100 chars, unique) |
| `slug` | string | Yes | URL-friendly slug (lowercase-hyphen, unique) |
| `description` | string | No | Category description |
| `icon` | string | No | Emoji or icon |
| `image` | string | No | Image URL |
| `sortOrder` | integer | No | Display order (default: 0) |

#### Success Response (201 Created)

```json
{
  "success": true,
  "data": {
    "category": {
      "id": 7,
      "name": "Tablets",
      "slug": "tablets",
      "description": "iPads and Android tablets",
      "icon": "📱",
      "image": "https://example.com/tablets.jpg",
      "isActive": true,
      "sortOrder": 3,
      "createdAt": "2026-02-19T10:00:00.000Z",
      "updatedAt": "2026-02-19T10:00:00.000Z"
    }
  }
}
```

#### Error Responses

**400 Bad Request** - Invalid data  
**401 Unauthorized** - Not authenticated  
**403 Forbidden** - Not admin

---

### 2.4 Update Category

Update an existing category.

**Endpoint:** `PUT /api/categories/:id`  
**Access:** Private (Admin only)

#### Request Body (all fields optional)

```json
{
  "name": "Gaming Tablets",
  "description": "High-performance gaming tablets",
  "sortOrder": 5
}
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "category": {
      "id": 7,
      "name": "Gaming Tablets",
      "slug": "tablets",
      "description": "High-performance gaming tablets",
      "sortOrder": 5,
      ...
    }
  }
}
```

---

### 2.5 Delete Category

Soft delete a category (sets `isActive` to false).

**Endpoint:** `DELETE /api/categories/:id`  
**Access:** Private (Admin only)

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "message": "Category deleted successfully"
  }
}
```

---

## 📦 3. Products

### 3.1 Get All Products

Retrieve products with filtering, sorting, and pagination.

**Endpoint:** `GET /api/products`  
**Access:** Public

#### Query Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `search` | string | Search in name/description | `?search=iphone` |
| `categoryId` | integer | Filter by category | `?categoryId=1` |
| `minPrice` | number | Minimum price | `?minPrice=100` |
| `maxPrice` | number | Maximum price | `?maxPrice=1000` |
| `badge` | string | Filter by badge (Hot/Sale/New/Featured) | `?badge=Hot` |
| `isFeatured` | boolean | Featured products only | `?isFeatured=true` |
| `sortBy` | string | Sort field (price/name/createdAt/rating) | `?sortBy=price` |
| `order` | string | Sort order (ASC/DESC) | `?order=DESC` |
| `page` | integer | Page number (default: 1) | `?page=2` |
| `limit` | integer | Items per page (default: 20, max: 100) | `?limit=10` |

#### Example Request

```
GET /api/products?categoryId=1&minPrice=500&maxPrice=2000&sortBy=price&order=ASC&page=1&limit=10
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": 1,
        "name": "iPhone 15 Pro",
        "slug": "iphone-15-pro",
        "description": "Latest flagship phone from Apple",
        "price": "999.00",
        "salePrice": "899.00",
        "sku": "IPH15PRO-256-BLU",
        "stock": 50,
        "categoryId": 1,
        "images": [
          "https://bucket.railway.app/products/iphone-1.jpg",
          "https://bucket.railway.app/products/iphone-2.jpg"
        ],
        "badge": "Hot",
        "specifications": {
          "screen": "6.7 inch",
          "processor": "A17 Pro",
          "camera": "48MP"
        },
        "isActive": true,
        "isFeatured": true,
        "views": 1234,
        "rating": "4.8",
        "reviewCount": 234,
        "category": {
          "id": 1,
          "name": "Smartphones",
          "slug": "smartphones"
        },
        "createdAt": "2026-02-19T10:00:00.000Z",
        "updatedAt": "2026-02-19T10:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "pages": 5,
      "limit": 10
    }
  }
}
```

---

### 3.2 Get Single Product

Get detailed product information.

**Endpoint:** `GET /api/products/:id`  
**Access:** Public

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "product": {
      "id": 1,
      "name": "iPhone 15 Pro",
      "slug": "iphone-15-pro",
      "description": "The most advanced iPhone ever with A17 Pro chip...",
      "price": "999.00",
      "salePrice": "899.00",
      "sku": "IPH15PRO-256-BLU",
      "stock": 50,
      "categoryId": 1,
      "images": [
        "https://bucket.railway.app/products/iphone-1.jpg",
        "https://bucket.railway.app/products/iphone-2.jpg",
        "https://bucket.railway.app/products/iphone-3.jpg"
      ],
      "badge": "Hot",
      "specifications": {
        "screen": "6.7 inch Super Retina XDR",
        "processor": "A17 Pro chip",
        "camera": "48MP Main + 12MP Ultra Wide",
        "battery": "4422mAh",
        "storage": "256GB",
        "color": "Blue Titanium"
      },
      "isActive": true,
      "isFeatured": true,
      "views": 1235,
      "rating": "4.8",
      "reviewCount": 234,
      "category": {
        "id": 1,
        "name": "Smartphones",
        "slug": "smartphones",
        "icon": "📱"
      },
      "createdAt": "2026-02-19T10:00:00.000Z",
      "updatedAt": "2026-02-19T10:30:00.000Z"
    }
  }
}
```

#### Error Response

**404 Not Found** - Product doesn't exist

---

### 3.3 Create Product

Create a new product.

**Endpoint:** `POST /api/products`  
**Access:** Private (Admin only)

#### Request Body

```json
{
  "name": "Samsung Galaxy S24 Ultra",
  "slug": "samsung-galaxy-s24-ultra",
  "description": "Premium Android flagship with AI features",
  "price": 1199.99,
  "salePrice": 1099.99,
  "sku": "SAM-S24U-512-BLK",
  "stock": 100,
  "categoryId": 1,
  "images": ["https://example.com/s24-1.jpg"],
  "badge": "New",
  "specifications": {
    "screen": "6.8 inch Dynamic AMOLED",
    "processor": "Snapdragon 8 Gen 3",
    "camera": "200MP Main",
    "battery": "5000mAh"
  },
  "isFeatured": true
}
```

#### Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Product name (2-200 chars) |
| `slug` | string | Yes | URL-friendly slug (unique) |
| `description` | string | No | Product description |
| `price` | number | Yes | Regular price (>= 0) |
| `salePrice` | number | No | Sale price (>= 0) |
| `sku` | string | No | Stock keeping unit (unique) |
| `stock` | integer | Yes | Available quantity (>= 0) |
| `categoryId` | integer | Yes | Category ID (must exist) |
| `images` | array | No | Array of image URLs |
| `badge` | string | No | Hot, Sale, New, or Featured |
| `specifications` | object | No | Product specs (JSON) |
| `isFeatured` | boolean | No | Featured product (default: false) |

#### Success Response (201 Created)

```json
{
  "success": true,
  "data": {
    "product": {
      "id": 42,
      "name": "Samsung Galaxy S24 Ultra",
      "slug": "samsung-galaxy-s24-ultra",
      ...
    }
  }
}
```

#### Error Responses

**400 Bad Request** - Missing required fields or invalid data  
**401 Unauthorized** - Not authenticated  
**403 Forbidden** - Not admin

---

### 3.4 Update Product

Update product information.

**Endpoint:** `PUT /api/products/:id`  
**Access:** Private (Admin only)

#### Request Body (all fields optional)

```json
{
  "price": 1099.99,
  "salePrice": 999.99,
  "stock": 75,
  "isFeatured": true,
  "badge": "Sale"
}
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "product": {
      "id": 42,
      "price": "1099.99",
      "salePrice": "999.99",
      "stock": 75,
      ...
    }
  }
}
```

---

### 3.5 Delete Product

Soft delete a product (sets `isActive` to false).

**Endpoint:** `DELETE /api/products/:id`  
**Access:** Private (Admin only)

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "message": "Product deleted successfully"
  }
}
```

---

## 🛒 4. Orders

### 4.1 Create Order

Create a new order with items.

**Endpoint:** `POST /api/orders`  
**Access:** Private (authenticated users)

#### Request Body

```json
{
  "items": [
    {
      "productId": 1,
      "quantity": 2
    },
    {
      "productId": 5,
      "quantity": 1
    }
  ],
  "shippingAddress": {
    "name": "John Doe",
    "street": "123 Main Street",
    "city": "Phnom Penh",
    "country": "Cambodia",
    "zipCode": "12000",
    "phone": "+855123456789"
  },
  "billingAddress": {
    "name": "John Doe",
    "street": "123 Main Street",
    "city": "Phnom Penh",
    "country": "Cambodia",
    "zipCode": "12000",
    "phone": "+855123456789"
  },
  "paymentMethod": "credit_card",
  "notes": "Please deliver between 9 AM - 5 PM"
}
```

#### Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `items` | array | Yes | Array of order items (min: 1) |
| `items[].productId` | integer | Yes | Product ID (must exist) |
| `items[].quantity` | integer | Yes | Quantity (>= 1) |
| `shippingAddress` | object | Yes | Shipping address details |
| `billingAddress` | object | No | Billing address (defaults to shipping) |
| `paymentMethod` | string | Yes | Payment method (any string) |
| `notes` | string | No | Order notes |

#### Success Response (201 Created)

```json
{
  "success": true,
  "data": {
    "order": {
      "id": 42,
      "userId": 5,
      "orderNumber": "ORD-1708341234567-5",
      "totalAmount": "1898.00",
      "subtotal": "1898.00",
      "tax": "0.00",
      "shippingCost": "0.00",
      "discount": "0.00",
      "status": "pending",
      "paymentMethod": "credit_card",
      "paymentStatus": "pending",
      "shippingAddress": {
        "name": "John Doe",
        "street": "123 Main Street",
        "city": "Phnom Penh",
        "country": "Cambodia",
        "zipCode": "12000",
        "phone": "+855123456789"
      },
      "billingAddress": {
        "name": "John Doe",
        "street": "123 Main Street",
        "city": "Phnom Penh",
        "country": "Cambodia",
        "zipCode": "12000",
        "phone": "+855123456789"
      },
      "notes": "Please deliver between 9 AM - 5 PM",
      "trackingNumber": null,
      "shippedAt": null,
      "deliveredAt": null,
      "items": [
        {
          "id": 84,
          "orderId": 42,
          "productId": 1,
          "productName": "iPhone 15 Pro",
          "productImage": "https://bucket.railway.app/products/iphone-1.jpg",
          "quantity": 2,
          "price": "899.00",
          "totalPrice": "1798.00"
        },
        {
          "id": 85,
          "orderId": 42,
          "productId": 5,
          "productName": "AirPods Pro",
          "productImage": "https://bucket.railway.app/products/airpods.jpg",
          "quantity": 1,
          "price": "100.00",
          "totalPrice": "100.00"
        }
      ],
      "createdAt": "2026-02-19T10:30:00.000Z",
      "updatedAt": "2026-02-19T10:30:00.000Z"
    }
  }
}
```

#### Error Responses

**400 Bad Request** - Missing items, invalid data, or insufficient stock  
**401 Unauthorized** - Not authenticated  
**404 Not Found** - Product doesn't exist

---

### 4.2 Get User's Orders

Retrieve all orders for the authenticated user.

**Endpoint:** `GET /api/orders`  
**Access:** Private

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": 42,
        "orderNumber": "ORD-1708341234567-5",
        "totalAmount": "1898.00",
        "status": "delivered",
        "paymentStatus": "completed",
        "paymentMethod": "credit_card",
        "trackingNumber": "TRACK-123456789",
        "items": [...],
        "createdAt": "2026-02-19T10:30:00.000Z",
        "updatedAt": "2026-02-20T14:00:00.000Z"
      }
    ]
  }
}
```

---

### 4.3 Get Single Order

Get detailed order information.

**Endpoint:** `GET /api/orders/:id`  
**Access:** Private (owner or admin)

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "order": {
      "id": 42,
      "orderNumber": "ORD-1708341234567-5",
      "totalAmount": "1898.00",
      "status": "shipped",
      "paymentStatus": "completed",
      "trackingNumber": "TRACK-123456789",
      "shippedAt": "2026-02-20T08:00:00.000Z",
      "items": [...],
      "user": {
        "id": 5,
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "phone": "+855123456789"
      },
      "createdAt": "2026-02-19T10:30:00.000Z",
      "updatedAt": "2026-02-20T14:00:00.000Z"
    }
  }
}
```

#### Error Responses

**403 Forbidden** - Not authorized to view this order  
**404 Not Found** - Order doesn't exist

---

### 4.4 Update Order Status (Admin)

Update order status and tracking information.

**Endpoint:** `PUT /api/orders/:id/status`  
**Access:** Private (Admin only)

#### Request Body

```json
{
  "status": "shipped",
  "trackingNumber": "TRACK-123456789"
}
```

#### Valid Status Values

- `pending` - Order placed
- `processing` - Being prepared
- `shipped` - In transit (auto-sets `shippedAt`)
- `delivered` - Completed (auto-sets `deliveredAt`)
- `cancelled` - Cancelled
- `refunded` - Refunded

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "order": {
      "id": 42,
      "status": "shipped",
      "trackingNumber": "TRACK-123456789",
      "shippedAt": "2026-02-20T08:00:00.000Z",
      "items": [...],
      ...
    }
  }
}
```

#### Error Responses

**400 Bad Request** - Invalid status  
**403 Forbidden** - Not admin  
**404 Not Found** - Order doesn't exist

---

### 4.5 Get All Orders (Admin)

Retrieve all orders with filtering and pagination.

**Endpoint:** `GET /api/orders/admin/all`  
**Access:** Private (Admin only)

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter by status |
| `page` | integer | Page number (default: 1) |
| `limit` | integer | Items per page (default: 20) |

#### Example Request

```
GET /api/orders/admin/all?status=pending&page=1&limit=20
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": 42,
        "orderNumber": "ORD-1708341234567-5",
        "totalAmount": "1898.00",
        "status": "pending",
        "paymentStatus": "pending",
        "user": {
          "id": 5,
          "firstName": "John",
          "lastName": "Doe",
          "email": "john@example.com"
        },
        "items": [...],
        "createdAt": "2026-02-19T10:30:00.000Z"
      }
    ],
    "pagination": {
      "total": 150,
      "page": 1,
      "pages": 8,
      "limit": 20
    }
  }
}
```

---

## 👤 5. Users

### 5.1 Get Own Profile

Get current user's profile.

**Endpoint:** `GET /api/users/profile`  
**Access:** Private

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 5,
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "+855123456789",
      "role": "customer",
      "isActive": true,
      "avatar": "https://bucket.railway.app/avatars/user-5.jpg",
      "address": {
        "street": "123 Main St",
        "city": "Phnom Penh",
        "country": "Cambodia",
        "zipCode": "12000"
      },
      "createdAt": "2026-02-19T10:00:00.000Z",
      "updatedAt": "2026-02-19T10:30:00.000Z"
    }
  }
}
```

---

### 5.2 Update Own Profile

Update current user's profile information.

**Endpoint:** `PUT /api/users/profile`  
**Access:** Private

#### Request Body (all fields optional)

```json
{
  "firstName": "Jonathan",
  "lastName": "Smith",
  "phone": "+855987654321",
  "avatar": "https://bucket.railway.app/avatars/new-avatar.jpg",
  "address": {
    "street": "456 New Street",
    "city": "Phnom Penh",
    "country": "Cambodia",
    "zipCode": "12000"
  }
}
```

#### Allowed Fields

- `firstName`, `lastName`, `phone`, `avatar`, `address`
- **Cannot change:** `email`, `password`, `role`

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 5,
      "firstName": "Jonathan",
      "lastName": "Smith",
      "phone": "+855987654321",
      ...
    }
  }
}
```

---

### 5.3 Change Password

Change current user's password.

**Endpoint:** `PUT /api/users/password`  
**Access:** Private

#### Request Body

```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

#### Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `currentPassword` | string | Yes | Current password |
| `newPassword` | string | Yes | New password (min 6 chars) |

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "message": "Password updated successfully"
  }
}
```

#### Error Responses

**400 Bad Request** - New password too short  
**401 Unauthorized** - Current password incorrect

---

### 5.4 Get All Users (Admin)

List all users.

**Endpoint:** `GET /api/users`  
**Access:** Private (Admin only)

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 5,
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "phone": "+855123456789",
        "role": "customer",
        "isActive": true,
        "avatar": "https://bucket.railway.app/avatars/user-5.jpg",
        "createdAt": "2026-02-19T10:00:00.000Z",
        "updatedAt": "2026-02-19T10:30:00.000Z"
      }
    ]
  }
}
```

---

### 5.5 Get User by ID (Admin)

Get specific user details.

**Endpoint:** `GET /api/users/:id`  
**Access:** Private (Admin only)

#### Success Response (200 OK)

Returns same structure as Get All Users, but for single user.

---

### 5.6 Update User (Admin)

Update any user's information.

**Endpoint:** `PUT /api/users/:id`  
**Access:** Private (Admin only)

#### Request Body (all fields optional)

```json
{
  "role": "admin",
  "isActive": false,
  "firstName": "Updated",
  "lastName": "Name"
}
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 5,
      "role": "admin",
      "isActive": false,
      ...
    }
  }
}
```

---

### 5.7 Delete User (Admin)

Delete a user account.

**Endpoint:** `DELETE /api/users/:id`  
**Access:** Private (Admin only)

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "message": "User deleted successfully"
  }
}
```

---

## 📤 6. File Uploads

All upload endpoints use `multipart/form-data` content type.

**File Restrictions:**
- **Max size:** 5MB per file
- **Allowed types:** JPEG, JPG, PNG, WebP, GIF
- **Storage:** Railway Bucket (S3-compatible)

---

### 6.1 Upload Product Images

Upload multiple images for a product (max 5 at once).

**Endpoint:** `POST /api/upload/product/:productId`  
**Access:** Private (Admin only)  
**Content-Type:** `multipart/form-data`

#### Request

**Form field name:** `images` (can be multiple files)

```bash
# cURL example
curl -X POST http://localhost:3001/api/upload/product/1 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.jpg"
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "message": "2 image(s) uploaded successfully",
    "uploadedUrls": [
      "https://bucket.railway.app/products/1708341234-abc123.jpg",
      "https://bucket.railway.app/products/1708341235-def456.jpg"
    ],
    "allImages": [
      "https://bucket.railway.app/products/old-image.jpg",
      "https://bucket.railway.app/products/1708341234-abc123.jpg",
      "https://bucket.railway.app/products/1708341235-def456.jpg"
    ],
    "product": {
      "id": 1,
      "name": "iPhone 15 Pro",
      "images": [...]
    }
  }
}
```

#### Error Responses

**400 Bad Request** - No files uploaded or invalid file type  
**403 Forbidden** - Not admin  
**404 Not Found** - Product doesn't exist

---

### 6.2 Delete Product Image

Remove a specific image from a product.

**Endpoint:** `DELETE /api/upload/product/:productId/image`  
**Access:** Private (Admin only)  
**Content-Type:** `application/json`

#### Request Body

```json
{
  "imageUrl": "https://bucket.railway.app/products/1708341234-abc123.jpg"
}
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "message": "Image deleted successfully",
    "remainingImages": [
      "https://bucket.railway.app/products/old-image.jpg"
    ]
  }
}
```

#### Error Responses

**400 Bad Request** - Missing imageUrl  
**403 Forbidden** - Not admin  
**404 Not Found** - Product or image doesn't exist

---

### 6.3 Upload Category Image

Upload image for a category (replaces existing).

**Endpoint:** `POST /api/upload/category/:categoryId`  
**Access:** Private (Admin only)  
**Content-Type:** `multipart/form-data`

#### Request

**Form field name:** `image` (single file)

```bash
# cURL example
curl -X POST http://localhost:3001/api/upload/category/1 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "image=@/path/to/category-image.jpg"
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "message": "Category image uploaded successfully",
    "imageUrl": "https://bucket.railway.app/categories/1708341234-abc123.jpg",
    "category": {
      "id": 1,
      "name": "Smartphones",
      "image": "https://bucket.railway.app/categories/1708341234-abc123.jpg"
    }
  }
}
```

**Note:** Old category image is automatically deleted.

---

### 6.4 Upload User Avatar

Upload avatar for current logged-in user (replaces existing).

**Endpoint:** `POST /api/upload/avatar`  
**Access:** Private (any authenticated user)  
**Content-Type:** `multipart/form-data`

#### Request

**Form field name:** `image` (single file)

```bash
# cURL example
curl -X POST http://localhost:3001/api/upload/avatar \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@/path/to/avatar.jpg"
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "message": "Avatar uploaded successfully",
    "avatarUrl": "https://bucket.railway.app/avatars/1708341234-user5.jpg",
    "user": {
      "id": 5,
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "avatar": "https://bucket.railway.app/avatars/1708341234-user5.jpg"
    }
  }
}
```

**Note:** Old avatar is automatically deleted.

---

## 🏥 7. Health Check

### Get Server Health

Check if server is running.

**Endpoint:** `GET /health`  
**Access:** Public

#### Success Response (200 OK)

```json
{
  "status": "ok",
  "timestamp": "2026-02-19T10:30:00.000Z"
}
```

---

## ❌ 8. Error Codes

All errors follow a consistent format:

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "status": 400
  }
}
```

### HTTP Status Codes

| Code | Name | Description |
|------|------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request data or missing fields |
| 401 | Unauthorized | Missing or invalid authentication token |
| 403 | Forbidden | Insufficient permissions (e.g., not admin) |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource already exists (e.g., duplicate email) |
| 500 | Internal Server Error | Server error (check logs) |

### Common Error Examples

#### 400 - Validation Error
```json
{
  "success": false,
  "error": {
    "message": "Validation error: Email is required",
    "status": 400
  }
}
```

#### 401 - Not Authenticated
```json
{
  "success": false,
  "error": {
    "message": "Not authorized, token missing",
    "status": 401
  }
}
```

#### 403 - Insufficient Permissions
```json
{
  "success": false,
  "error": {
    "message": "Access denied. Admin privileges required",
    "status": 403
  }
}
```

#### 404 - Resource Not Found
```json
{
  "success": false,
  "error": {
    "message": "Product not found",
    "status": 404
  }
}
```

---

## 📊 9. Response Format

### Success Response Structure

All successful responses follow this pattern:

```json
{
  "success": true,
  "data": {
    // Response data here
  }
}
```

### Paginated Response Structure

For lists with pagination:

```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "total": 100,
      "page": 1,
      "pages": 10,
      "limit": 10
    }
  }
}
```

---

## 🔑 Test Accounts

### Admin Account
```
Email: admin@iceelectronics.com
Password: password123
Role: admin
```
**Permissions:** Full access to all endpoints

### Customer Account
```
Email: sokha@example.com
Password: password123
Role: customer
```
**Permissions:** Standard user access

---

## 📝 Usage Examples

### JavaScript (Fetch API)

```javascript
// Login
const login = async () => {
  const response = await fetch('http://localhost:3001/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@iceelectronics.com',
      password: 'password123'
    })
  });
  const data = await response.json();
  return data.data.token;
};

// Get Products
const getProducts = async (token) => {
  const response = await fetch('http://localhost:3001/api/products?limit=10');
  const data = await response.json();
  return data.data.products;
};

// Create Order
const createOrder = async (token) => {
  const response = await fetch('http://localhost:3001/api/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      items: [{ productId: 1, quantity: 2 }],
      shippingAddress: {
        name: 'John Doe',
        street: '123 Main St',
        city: 'Phnom Penh',
        country: 'Cambodia',
        zipCode: '12000',
        phone: '+855123456789'
      },
      paymentMethod: 'cash'
    })
  });
  return await response.json();
};

// Upload Product Image
const uploadImage = async (token, productId, file) => {
  const formData = new FormData();
  formData.append('images', file);

  const response = await fetch(`http://localhost:3001/api/upload/product/${productId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  return await response.json();
};
```

### cURL Examples

```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@iceelectronics.com","password":"password123"}'

# Get Products (with filters)
curl "http://localhost:3001/api/products?categoryId=1&minPrice=500&maxPrice=2000&sortBy=price&order=ASC&page=1&limit=10"

# Create Order
curl -X POST http://localhost:3001/api/orders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"productId": 1, "quantity": 2}],
    "shippingAddress": {
      "name": "John Doe",
      "street": "123 Main St",
      "city": "Phnom Penh",
      "country": "Cambodia",
      "zipCode": "12000",
      "phone": "+855123456789"
    },
    "paymentMethod": "cash"
  }'

# Upload Product Image
curl -X POST http://localhost:3001/api/upload/product/1 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "images=@/path/to/image.jpg"

# Update Order Status (Admin)
curl -X PUT http://localhost:3001/api/orders/42/status \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"shipped","trackingNumber":"TRACK-123456"}'
```

---

## 📞 Support & Resources

- **API Base URL (Local):** `http://localhost:3001/api`
- **API Base URL (Production):** `https://your-backend.railway.app/api`
- **Test Suite:** Run `node test-api.js` for automated testing
- **Postman Collection:** Available in `/testing` directory

---

**Last Updated:** February 19, 2026  
**API Version:** 1.0.0  
**Total Endpoints:** 42
