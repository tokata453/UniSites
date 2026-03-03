// test-api.js
// Complete API test for all endpoints
// Usage: node test-api.js

require('dotenv').config();
const fs = require('fs');
const path = require('path');

// ─── Config ───────────────────────────────────
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3001';

// ─── Colors ───────────────────────────────────
const green  = (msg) => console.log(`\x1b[32m✅ ${msg}\x1b[0m`);
const red    = (msg) => console.log(`\x1b[31m❌ ${msg}\x1b[0m`);
const blue   = (msg) => console.log(`\x1b[36mℹ️  ${msg}\x1b[0m`);
const yellow = (msg) => console.log(`\x1b[33m⚠️  ${msg}\x1b[0m`);
const title  = (msg) => console.log(`\n\x1b[95m${'━'.repeat(45)}\n  ${msg}\n${'━'.repeat(45)}\x1b[0m`);

// ─── Test State ───────────────────────────────
// Tokens and IDs are stored here and reused across tests
const state = {
  adminToken: null,
  customerToken: null,
  newUserId: null,
  newProductId: null,
  newCategoryId: null,
  newOrderId: null,
  uploadedProductImages: [],
  uploadedCategoryImage: null,
  uploadedAvatar: null,
};

let passed = 0;
let failed = 0;
const errors = [];

// ─── HTTP Helper ──────────────────────────────
async function request(method, path, { body, token, formData } = {}) {
  const headers = {};

  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (body)  headers['Content-Type'] = 'application/json';

  const options = {
    method,
    headers,
  };

  if (body)     options.body = JSON.stringify(body);
  if (formData) options.body = formData; // multipart

  const res = await fetch(`${BASE_URL}${path}`, options);

  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  return { status: res.status, data };
}

// ─── Test Runner ──────────────────────────────
async function test(name, fn) {
  blue(`Testing: ${name}`);
  try {
    await fn();
    green(`PASS: ${name}\n`);
    passed++;
  } catch (err) {
    red(`FAIL: ${name}`);
    console.log(`   → ${err.message}\n`);
    failed++;
    errors.push({ name, error: err.message });
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

// ═════════════════════════════════════════════
// 1. AUTH TESTS
// ═════════════════════════════════════════════
async function testAuth() {
  title('🔐 AUTH ENDPOINTS');

  // ── Register ──────────────────────────────
  await test('POST /api/auth/register - Register new user', async () => {
    const { status, data } = await request('POST', '/api/auth/register', {
      body: {
        firstName: 'Test',
        lastName: 'User',
        email: `testuser_${Date.now()}@example.com`,
        password: 'password123',
        phone: '+855123456789',
      },
    });

    assert(status === 201, `Expected 201, got ${status}`);
    assert(data.success === true, 'Expected success: true');
    assert(data.data.token, 'Expected token in response');
    assert(data.data.user.email, 'Expected user email');
    assert(data.data.user.role === 'customer', 'Expected role: customer');

    // Save for later tests
    state.newUserId = data.data.user.id;
    state.customerToken = data.data.token;
  });

  // ── Register - Missing Fields ──────────────
  await test('POST /api/auth/register - Missing required fields', async () => {
    const { status, data } = await request('POST', '/api/auth/register', {
      body: { email: 'incomplete@example.com' },
    });

    assert(status === 400, `Expected 400, got ${status}`);
    assert(data.success === false, 'Expected success: false');
  });

  // ── Login Admin ────────────────────────────
  await test('POST /api/auth/login - Admin login', async () => {
    const { status, data } = await request('POST', '/api/auth/login', {
      body: {
        email: 'admin@iceelectronics.com',
        password: 'password123',
      },
    });

    assert(status === 200, `Expected 200, got ${status}`);
    assert(data.success === true, 'Expected success: true');
    assert(data.data.token, 'Expected token');
    assert(data.data.user.role === 'admin', 'Expected role: admin');

    state.adminToken = data.data.token;
  });

  // ── Login Customer ─────────────────────────
  await test('POST /api/auth/login - Customer login', async () => {
    const { status, data } = await request('POST', '/api/auth/login', {
      body: {
        email: 'sokha@example.com',
        password: 'password123',
      },
    });

    assert(status === 200, `Expected 200, got ${status}`);
    assert(data.data.token, 'Expected token');

    // Override with a known customer token
    state.customerToken = data.data.token;
  });

  // ── Login - Wrong Password ─────────────────
  await test('POST /api/auth/login - Wrong password rejected', async () => {
    const { status, data } = await request('POST', '/api/auth/login', {
      body: {
        email: 'admin@iceelectronics.com',
        password: 'wrongpassword',
      },
    });

    assert(status === 401, `Expected 401, got ${status}`);
    assert(data.success === false, 'Expected success: false');
  });

  // ── Login - Missing Fields ─────────────────
  await test('POST /api/auth/login - Missing fields rejected', async () => {
    const { status, data } = await request('POST', '/api/auth/login', {
      body: { email: 'admin@iceelectronics.com' },
    });

    assert(status === 400, `Expected 400, got ${status}`);
  });

  // ── Get Me ─────────────────────────────────
  await test('GET /api/auth/me - Get current user', async () => {
    const { status, data } = await request('GET', '/api/auth/me', {
      token: state.adminToken,
    });

    assert(status === 200, `Expected 200, got ${status}`);
    assert(data.data.user.email === 'admin@iceelectronics.com', 'Expected admin email');
  });

  // ── Get Me - No Token ──────────────────────
  await test('GET /api/auth/me - Rejected without token', async () => {
    const { status } = await request('GET', '/api/auth/me');

    assert(status === 401, `Expected 401, got ${status}`);
  });

  // ── Get Me - Invalid Token ─────────────────
  await test('GET /api/auth/me - Rejected with invalid token', async () => {
    const { status } = await request('GET', '/api/auth/me', {
      token: 'invalid.token.here',
    });

    assert(status === 401, `Expected 401, got ${status}`);
  });
}

// ═════════════════════════════════════════════
// 2. CATEGORY TESTS
// ═════════════════════════════════════════════
async function testCategories() {
  title('📁 CATEGORY ENDPOINTS');

  // ── Get All ────────────────────────────────
  await test('GET /api/categories - Get all categories', async () => {
    const { status, data } = await request('GET', '/api/categories');

    assert(status === 200, `Expected 200, got ${status}`);
    assert(data.success === true, 'Expected success: true');
    assert(Array.isArray(data.data.categories), 'Expected categories array');
    assert(data.data.categories.length > 0, 'Expected at least 1 category');

    // Check structure
    const cat = data.data.categories[0];
    assert(cat.id, 'Expected category id');
    assert(cat.name, 'Expected category name');
    assert(cat.slug, 'Expected category slug');
  });

  // ── Get Single ─────────────────────────────
  await test('GET /api/categories/:id - Get category with products', async () => {
    const { status, data } = await request('GET', '/api/categories/1');

    assert(status === 200, `Expected 200, got ${status}`);
    assert(data.data.category.id === 1, 'Expected category id 1');
    assert(Array.isArray(data.data.category.products), 'Expected products array');
  });

  // ── Get Single - Not Found ─────────────────
  await test('GET /api/categories/:id - 404 for non-existent category', async () => {
    const { status, data } = await request('GET', '/api/categories/99999');

    assert(status === 404, `Expected 404, got ${status}`);
    assert(data.success === false, 'Expected success: false');
  });

  // ── Create - Admin ─────────────────────────
  await test('POST /api/categories - Admin creates category', async () => {
    const { status, data } = await request('POST', '/api/categories', {
      token: state.adminToken,
      body: {
        name: `Test Category ${Date.now()}`,
        slug: `test-category-${Date.now()}`,
        description: 'Test category description',
        icon: '🧪',
        sortOrder: 99,
      },
    });

    assert(status === 201, `Expected 201, got ${status}`);
    assert(data.success === true, 'Expected success: true');
    assert(data.data.category.id, 'Expected category id');

    state.newCategoryId = data.data.category.id;
  });

  // ── Create - Non-Admin ─────────────────────
  await test('POST /api/categories - Customer cannot create category', async () => {
    const { status } = await request('POST', '/api/categories', {
      token: state.customerToken,
      body: { name: 'Hacked Category' },
    });

    assert(status === 403, `Expected 403, got ${status}`);
  });

  // ── Create - No Auth ───────────────────────
  await test('POST /api/categories - Rejected without auth', async () => {
    const { status } = await request('POST', '/api/categories', {
      body: { name: 'No Auth Category' },
    });

    assert(status === 401, `Expected 401, got ${status}`);
  });

  // ── Update ─────────────────────────────────
  await test('PUT /api/categories/:id - Admin updates category', async () => {
    const newName = `Updated Test Category ${Date.now()}`;
    const { status, data } = await request('PUT', `/api/categories/${state.newCategoryId}`, {
      token: state.adminToken,
      body: {
        name: newName,
        sortOrder: 100,
      },
    });

    assert(status === 200, `Expected 200, got ${status} with ${state.newCategoryId}`);
    assert(data.data.category.name === newName, `Name should be updated to ${newName}`);
  });

  // ── Delete ─────────────────────────────────
  await test('DELETE /api/categories/:id - Admin deletes category', async () => {
    const { status, data } = await request('DELETE', `/api/categories/${state.newCategoryId}`, {
      token: state.adminToken,
    });

    assert(status === 200, `Expected 200, got ${status}`);
    assert(data.data.message, 'Expected success message');
  });
}

// ═════════════════════════════════════════════
// 3. PRODUCT TESTS
// ═════════════════════════════════════════════
async function testProducts() {
  title('📦 PRODUCT ENDPOINTS');

  // ── Get All ────────────────────────────────
  await test('GET /api/products - Get all products', async () => {
    const { status, data } = await request('GET', '/api/products');

    assert(status === 200, `Expected 200, got ${status}`);
    assert(Array.isArray(data.data.products), 'Expected products array');
    assert(data.data.pagination, 'Expected pagination');
    assert(data.data.pagination.total > 0, 'Expected at least 1 product');
  });

  // ── Pagination ─────────────────────────────
  await test('GET /api/products - Pagination works', async () => {
    const { status, data } = await request('GET', '/api/products?page=1&limit=3');

    assert(status === 200, `Expected 200, got ${status}`);
    assert(data.data.products.length <= 3, 'Expected max 3 products');
    assert(data.data.pagination.limit === 3, 'Expected limit 3');
  });

  // ── Search ─────────────────────────────────
  await test('GET /api/products - Search by name works', async () => {
    const { status, data } = await request('GET', '/api/products?search=iphone');

    assert(status === 200, `Expected 200, got ${status}`);
    assert(Array.isArray(data.data.products), 'Expected array');
  });

  // ── Filter by Category ─────────────────────
  await test('GET /api/products - Filter by categoryId works', async () => {
    const { status, data } = await request('GET', '/api/products?categoryId=1');

    assert(status === 200, `Expected 200, got ${status}`);
    if (data.data.products.length > 0) {
      assert(
        data.data.products.every(p => p.categoryId === 1 || p.category?.id === 1),
        'All products should belong to category 1'
      );
    }
  });

  // ── Filter by Price ────────────────────────
  await test('GET /api/products - Filter by price range works', async () => {
    const { status, data } = await request('GET', '/api/products?minPrice=100&maxPrice=500');

    assert(status === 200, `Expected 200, got ${status}`);
  });

  // ── Sort ───────────────────────────────────
  await test('GET /api/products - Sort by price ASC works', async () => {
    const { status, data } = await request('GET', '/api/products?sortBy=price&order=ASC&limit=5');

    assert(status === 200, `Expected 200, got ${status}`);
    const prices = data.data.products.map(p => parseFloat(p.price));
    const isSorted = prices.every((p, i) => i === 0 || p >= prices[i - 1]);
    assert(isSorted, 'Products should be sorted by price ASC');
  });

  // ── Get Single ─────────────────────────────
  await test('GET /api/products/:id - Get single product', async () => {
    const { status, data } = await request('GET', '/api/products/1');

    assert(status === 200, `Expected 200, got ${status}`);
    assert(data.data.product.id === 1, 'Expected product id 1');
    assert(data.data.product.category, 'Expected category included');
  });

  // ── Get Single - Not Found ─────────────────
  await test('GET /api/products/:id - 404 for non-existent product', async () => {
    const { status } = await request('GET', '/api/products/99999');

    assert(status === 404, `Expected 404, got ${status}`);
  });

  // ── Create - Admin ─────────────────────────
  await test('POST /api/products - Admin creates product', async () => {
    const { status, data } = await request('POST', '/api/products', {
      token: state.adminToken,
      body: {
        name: `Test Product ${Date.now()}`,
        slug: `test-product-${Date.now()}`,
        description: 'A test product description',
        price: 199.99,
        salePrice: 149.99,
        sku: `TEST-${Date.now()}`,
        stock: 50,
        categoryId: 1,
        badge: 'New',
        isFeatured: false,
      },
    });

    assert(status === 201, `Expected 201, got ${status}. Error: ${JSON.stringify(data?.error)}`);
    assert(data.data.product.id, 'Expected product id');
    assert(data.data.product.name.includes('Test Product'), 'Expected product name');

    state.newProductId = data.data.product.id;
  });

  // ── Create - Missing Required ──────────────
  await test('POST /api/products - Rejected without required fields', async () => {
    const { status } = await request('POST', '/api/products', {
      token: state.adminToken,
      body: { name: 'Incomplete Product' }, // Missing price and categoryId
    });

    assert(status === 400, `Expected 400, got ${status}`);
  });

  // ── Create - Non-Admin ─────────────────────
  await test('POST /api/products - Customer cannot create product', async () => {
    const { status } = await request('POST', '/api/products', {
      token: state.customerToken,
      body: { name: 'Hacked Product', price: 1, categoryId: 1 },
    });

    assert(status === 403, `Expected 403, got ${status}`);
  });

  // ── Update ─────────────────────────────────
  await test('PUT /api/products/:id - Admin updates product', async () => {
    const { status, data } = await request('PUT', `/api/products/${state.newProductId}`, {
      token: state.adminToken,
      body: { price: 299.99, stock: 75 },
    });

    assert(status === 200, `Expected 200, got ${status}`);
    assert(parseFloat(data.data.product.price) === 299.99, 'Price should be updated');
  });

  // ── Delete ─────────────────────────────────
  await test('DELETE /api/products/:id - Admin deletes product', async () => {
    const { status, data } = await request('DELETE', `/api/products/${state.newProductId}`, {
      token: state.adminToken,
    });

    assert(status === 200, `Expected 200, got ${status}`);
    assert(data.data.message, 'Expected success message');
  });
}

// ═════════════════════════════════════════════
// 4. ORDER TESTS
// ═════════════════════════════════════════════
async function testOrders() {
  title('🛒 ORDER ENDPOINTS');

  // ── Create Order ───────────────────────────
  await test('POST /api/orders - Customer creates order', async () => {
    const { status, data } = await request('POST', '/api/orders', {
      token: state.customerToken,
      body: {
        items: [
          { productId: 1, quantity: 1 },
          { productId: 2, quantity: 2 },
        ],
        shippingAddress: {
          name: 'Test Customer',
          street: '123 Test Street',
          city: 'Phnom Penh',
          country: 'Cambodia',
          zipCode: '12000',
          phone: '+855123456789',
        },
        paymentMethod: 'cash',  // STRING - any value accepted
        notes: 'Please deliver fast',
      },
    });

    assert(status === 201, `Expected 201, got ${status}. Error: ${JSON.stringify(data?.error)}`);
    assert(data.data.order.id, 'Expected order id');
    assert(data.data.order.orderNumber, 'Expected order number');
    assert(data.data.order.status === 'pending', 'Expected status: pending');
    assert(Array.isArray(data.data.order.items), 'Expected items array');

    state.newOrderId = data.data.order.id;
  });

  // ── Create Order - No Auth ─────────────────
  await test('POST /api/orders - Rejected without auth', async () => {
    const { status } = await request('POST', '/api/orders', {
      body: {
        items: [{ productId: 1, quantity: 1 }],
        shippingAddress: { name: 'Test' },
      },
    });

    assert(status === 401, `Expected 401, got ${status}`);
  });

  // ── Create Order - Empty Items ─────────────
  await test('POST /api/orders - Rejected with empty items', async () => {
    const { status } = await request('POST', '/api/orders', {
      token: state.customerToken,
      body: {
        items: [],
        shippingAddress: { name: 'Test' },
      },
    });

    assert(status === 400, `Expected 400, got ${status}`);
  });

  // ── Create Order - Invalid Product ─────────
  await test('POST /api/orders - Rejected with invalid product id', async () => {
    const { status } = await request('POST', '/api/orders', {
      token: state.customerToken,
      body: {
        items: [{ productId: 99999, quantity: 1 }],
        shippingAddress: { name: 'Test', street: '123', city: 'PP', country: 'KH' },
        paymentMethod: 'cash',
      },
    });

    assert(status === 404, `Expected 404, got ${status}`);
  });

  // ── Get User's Orders ──────────────────────
  await test('GET /api/orders - Get own orders', async () => {
    const { status, data } = await request('GET', '/api/orders', {
      token: state.customerToken,
    });

    assert(status === 200, `Expected 200, got ${status}`);
    assert(Array.isArray(data.data.orders), 'Expected orders array');
  });

  // ── Get User's Orders - No Auth ────────────
  await test('GET /api/orders - Rejected without auth', async () => {
    const { status } = await request('GET', '/api/orders');
    assert(status === 401, `Expected 401, got ${status}`);
  });

  // ── Get Single Order ───────────────────────
  await test('GET /api/orders/:id - Get own order by id', async () => {
    const { status, data } = await request('GET', `/api/orders/${state.newOrderId}`, {
      token: state.customerToken,
    });

    assert(status === 200, `Expected 200, got ${status}`);
    assert(data.data.order.id === state.newOrderId, 'Expected matching order id');
    assert(Array.isArray(data.data.order.items), 'Expected items');
  });

  // ── Get Single Order - Not Found ───────────
  await test('GET /api/orders/:id - 404 for non-existent order', async () => {
    const { status } = await request('GET', '/api/orders/99999', {
      token: state.customerToken,
    });

    assert(status === 404, `Expected 404, got ${status}`);
  });

  // ── Get All Orders - Admin ─────────────────
  await test('GET /api/orders/admin/all - Admin gets all orders', async () => {
    const { status, data } = await request('GET', '/api/orders/admin/all', {
      token: state.adminToken,
    });

    assert(status === 200, `Expected 200, got ${status}`);
    assert(Array.isArray(data.data.orders), 'Expected orders array');
    assert(data.data.pagination, 'Expected pagination');
  });

  // ── Get All Orders - Customer Blocked ─────
  await test('GET /api/orders/admin/all - Customer cannot access', async () => {
    const { status } = await request('GET', '/api/orders/admin/all', {
      token: state.customerToken,
    });

    assert(status === 403, `Expected 403, got ${status}`);
  });

  // ── Get All - Filter by Status ─────────────
  await test('GET /api/orders/admin/all - Filter by status works', async () => {
    const { status, data } = await request('GET', '/api/orders/admin/all?status=pending', {
      token: state.adminToken,
    });

    assert(status === 200, `Expected 200, got ${status}`);
    if (data.data.orders.length > 0) {
      assert(
        data.data.orders.every(o => o.status === 'pending'),
        'All orders should have status: pending'
      );
    }
  });

  // ── Update Order Status ────────────────────
  await test('PUT /api/orders/:id/status - Admin updates order status', async () => {
    const { status, data } = await request('PUT', `/api/orders/${state.newOrderId}/status`, {
      token: state.adminToken,
      body: {
        status: 'processing',
        trackingNumber: 'TRACK123456',
      },
    });

    assert(status === 200, `Expected 200, got ${status}`);
    assert(data.data.order.status === 'processing', 'Status should be updated to processing');
  });

  // ── Update Status - Invalid Status ─────────
  await test('PUT /api/orders/:id/status - Invalid status rejected', async () => {
    const { status } = await request('PUT', `/api/orders/${state.newOrderId}/status`, {
      token: state.adminToken,
      body: { status: 'invalid_status' },
    });

    assert(status === 400, `Expected 400, got ${status}`);
  });

  // ── Update Status - Customer Blocked ───────
  await test('PUT /api/orders/:id/status - Customer cannot update status', async () => {
    const { status } = await request('PUT', `/api/orders/${state.newOrderId}/status`, {
      token: state.customerToken,
      body: { status: 'delivered' },
    });

    assert(status === 403, `Expected 403, got ${status}`);
  });
}

// ═════════════════════════════════════════════
// 5. USER TESTS
// ═════════════════════════════════════════════
async function testUsers() {
  title('👤 USER ENDPOINTS');

  // ── Get Profile ────────────────────────────
  await test('GET /api/users/profile - Get own profile', async () => {
    const { status, data } = await request('GET', '/api/users/profile', {
      token: state.customerToken,
    });

    assert(status === 200, `Expected 200, got ${status}`);
    assert(data.data.user.email, 'Expected user email');
    assert(!data.data.user.password, 'Password should not be returned');
  });

  // ── Get Profile - No Auth ──────────────────
  await test('GET /api/users/profile - Rejected without auth', async () => {
    const { status } = await request('GET', '/api/users/profile');
    assert(status === 401, `Expected 401, got ${status}`);
  });

  // ── Update Profile ─────────────────────────
  await test('PUT /api/users/profile - Update own profile', async () => {
    const { status, data } = await request('PUT', '/api/users/profile', {
      token: state.customerToken,
      body: {
        firstName: 'Updated',
        lastName: 'Name',
        phone: '+855987654321',
      },
    });

    assert(status === 200, `Expected 200, got ${status}`);
    assert(data.data.user.firstName === 'Updated', 'firstName should be updated');
    assert(data.data.user.lastName === 'Name', 'lastName should be updated');
  });

  // ── Change Password ────────────────────────
  await test('PUT /api/users/password - Change password', async () => {
    const { status, data } = await request('PUT', '/api/users/password', {
      token: state.customerToken,
      body: {
        currentPassword: 'password123',
        newPassword: 'newpassword123',
      },
    });

    assert(status === 200, `Expected 200, got ${status}`);
    assert(data.data.message, 'Expected success message');

    // Change back for future tests
    await request('PUT', '/api/users/password', {
      token: state.customerToken,
      body: {
        currentPassword: 'newpassword123',
        newPassword: 'password123',
      },
    });
  });

  // ── Change Password - Wrong Current ────────
  await test('PUT /api/users/password - Wrong current password rejected', async () => {
    const { status } = await request('PUT', '/api/users/password', {
      token: state.customerToken,
      body: {
        currentPassword: 'wrongpassword',
        newPassword: 'newpassword123',
      },
    });

    assert(status === 401, `Expected 401, got ${status}`);
  });

  // ── Change Password - Too Short ────────────
  await test('PUT /api/users/password - Short new password rejected', async () => {
    const { status } = await request('PUT', '/api/users/password', {
      token: state.customerToken,
      body: {
        currentPassword: 'password123',
        newPassword: '123',
      },
    });

    assert(status === 400, `Expected 400, got ${status}`);
  });

  // ── Admin: Get All Users ───────────────────
  await test('GET /api/users - Admin gets all users', async () => {
    const { status, data } = await request('GET', '/api/users', {
      token: state.adminToken,
    });

    assert(status === 200, `Expected 200, got ${status}`);
    assert(Array.isArray(data.data.users), 'Expected users array');
    assert(data.data.users.length > 0, 'Expected at least 1 user');
  });

  // ── Admin: Get All Users - Customer Blocked ─
  await test('GET /api/users - Customer cannot access user list', async () => {
    const { status } = await request('GET', '/api/users', {
      token: state.customerToken,
    });

    assert(status === 403, `Expected 403, got ${status}`);
  });

  // ── Admin: Get User By ID ──────────────────
  await test('GET /api/users/:id - Admin gets user by id', async () => {
    const { status, data } = await request('GET', `/api/users/${state.newUserId}`, {
      token: state.adminToken,
    });

    assert(status === 200, `Expected 200, got ${status}`);
    assert(data.data.user.id === state.newUserId, 'Expected matching user id');
  });

  // ── Admin: Update User ─────────────────────
  await test('PUT /api/users/:id - Admin updates user', async () => {
    const { status, data } = await request('PUT', `/api/users/${state.newUserId}`, {
      token: state.adminToken,
      body: { isActive: true, role: 'customer' },
    });

    assert(status === 200, `Expected 200, got ${status}`);
  });

  // ── Admin: Delete User ─────────────────────
  await test('DELETE /api/users/:id - Admin deletes user', async () => {
    const { status, data } = await request('DELETE', `/api/users/${state.newUserId}`, {
      token: state.adminToken,
    });

    assert(status === 200, `Expected 200, got ${status}`);
    assert(data.data.message, 'Expected success message');
  });
}

// ═════════════════════════════════════════════
// 6. UPLOAD TESTS
// ═════════════════════════════════════════════
async function testUploads() {
  title('📤 UPLOAD ENDPOINTS');

  // Helper to create test image
  function createTestImage() {
    // 1x1 transparent PNG (67 bytes)
    return Buffer.from(
      '89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c489' +
      '0000000a49444154789c6360000000020001e221bc330000000049454e44ae426082',
      'hex'
    );
  }

  // Helper to create multipart form data
  function createFormData(files) {
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36);
    const parts = [];

    files.forEach(({ fieldName, filename, data, contentType }) => {
      parts.push(`--${boundary}\r\n`);
      parts.push(`Content-Disposition: form-data; name="${fieldName}"; filename="${filename}"\r\n`);
      parts.push(`Content-Type: ${contentType}\r\n\r\n`);
      parts.push(data);
      parts.push('\r\n');
    });

    parts.push(`--${boundary}--\r\n`);

    const body = Buffer.concat(parts.map(p => typeof p === 'string' ? Buffer.from(p) : p));

    return {
      body,
      contentType: `multipart/form-data; boundary=${boundary}`
    };
  }

  // ─── Upload single product image ──────────────────────────
  await test('POST /api/upload/product/:id - Upload single product image', async () => {
    const imageData = createTestImage();
    const { body, contentType } = createFormData([
      {
        fieldName: 'images',
        filename: 'test-product-1.png',
        data: imageData,
        contentType: 'image/png'
      }
    ]);

    const res = await fetch(`${BASE_URL}/api/upload/product/1`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${state.adminToken}`,
        'Content-Type': contentType
      },
      body: body
    });

    const data = await res.json();

    assert(res.status === 200, `Expected 200, got ${res.status}. Error: ${JSON.stringify(data?.error)}`);
    assert(data.success === true, 'Expected success: true');
    assert(data.data.message, 'Expected message');
    assert(Array.isArray(data.data.uploadedUrls), 'Expected uploadedUrls array');
    assert(data.data.uploadedUrls.length === 1, 'Expected 1 uploaded URL');
    assert(Array.isArray(data.data.allImages), 'Expected allImages array');

    state.uploadedProductImages.push(...data.data.uploadedUrls);
  });

  // ─── Upload multiple product images ───────────────────────
  await test('POST /api/upload/product/:id - Upload multiple images', async () => {
    const imageData = createTestImage();
    const { body, contentType } = createFormData([
      {
        fieldName: 'images',
        filename: 'test-product-2.png',
        data: imageData,
        contentType: 'image/png'
      },
      {
        fieldName: 'images',
        filename: 'test-product-3.png',
        data: imageData,
        contentType: 'image/png'
      }
    ]);

    const res = await fetch(`${BASE_URL}/api/upload/product/1`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${state.adminToken}`,
        'Content-Type': contentType
      },
      body: body
    });

    const data = await res.json();

    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(data.data.uploadedUrls.length === 2, 'Expected 2 uploaded URLs');
    assert(data.data.message.includes('2'), 'Message should mention 2 images');

    state.uploadedProductImages.push(...data.data.uploadedUrls);
  });

  // ─── Delete product image ─────────────────────────────────
  await test('DELETE /api/upload/product/:id/image - Delete image', async () => {
    assert(state.uploadedProductImages.length > 0, 'No uploaded images to delete');

    const imageToDelete = state.uploadedProductImages[0];

    const { status, data } = await request('DELETE', '/api/upload/product/1/image', {
      token: state.adminToken,
      body: { imageUrl: imageToDelete }
    });

    assert(status === 200, `Expected 200, got ${status}`);
    assert(data.data.message, 'Expected message');
    assert(Array.isArray(data.data.remainingImages), 'Expected remainingImages array');

    state.uploadedProductImages = state.uploadedProductImages.filter(url => url !== imageToDelete);
  });

  // ─── Upload category image ────────────────────────────────
  await test('POST /api/upload/category/:id - Upload category image', async () => {
    const imageData = createTestImage();
    const { body, contentType } = createFormData([
      {
        fieldName: 'image',
        filename: 'test-category.png',
        data: imageData,
        contentType: 'image/png'
      }
    ]);

    const res = await fetch(`${BASE_URL}/api/upload/category/1`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${state.adminToken}`,
        'Content-Type': contentType
      },
      body: body
    });

    const data = await res.json();

    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(data.success === true, 'Expected success: true');
    assert(data.data.imageUrl, 'Expected imageUrl');
    assert(data.data.category, 'Expected category object');
    assert(data.data.category.image === data.data.imageUrl, 'Category should have new image');

    state.uploadedCategoryImage = data.data.imageUrl;
  });

  // ─── Replace category image ───────────────────────────────
  await test('POST /api/upload/category/:id - Replace image (old deleted)', async () => {
    const oldImageUrl = state.uploadedCategoryImage;

    const imageData = createTestImage();
    const { body, contentType } = createFormData([
      {
        fieldName: 'image',
        filename: 'test-category-new.png',
        data: imageData,
        contentType: 'image/png'
      }
    ]);

    const res = await fetch(`${BASE_URL}/api/upload/category/1`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${state.adminToken}`,
        'Content-Type': contentType
      },
      body: body
    });

    const data = await res.json();

    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(data.data.imageUrl !== oldImageUrl, 'New image URL should be different');

    state.uploadedCategoryImage = data.data.imageUrl;
  });

  // ─── Upload avatar ────────────────────────────────────────
  await test('POST /api/upload/avatar - Upload user avatar', async () => {
    const imageData = createTestImage();
    const { body, contentType } = createFormData([
      {
        fieldName: 'image',
        filename: 'test-avatar.png',
        data: imageData,
        contentType: 'image/png'
      }
    ]);

    const res = await fetch(`${BASE_URL}/api/upload/avatar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${state.customerToken}`,
        'Content-Type': contentType
      },
      body: body
    });

    const data = await res.json();

    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(data.success === true, 'Expected success: true');
    assert(data.data.avatarUrl, 'Expected avatarUrl');
    assert(data.data.user, 'Expected user object');
    assert(data.data.user.avatar === data.data.avatarUrl, 'User should have new avatar');

    state.uploadedAvatar = data.data.avatarUrl;
  });

  // ─── Replace avatar ───────────────────────────────────────
  await test('POST /api/upload/avatar - Replace avatar (old deleted)', async () => {
    const oldAvatarUrl = state.uploadedAvatar;

    const imageData = createTestImage();
    const { body, contentType } = createFormData([
      {
        fieldName: 'image',
        filename: 'test-avatar-new.png',
        data: imageData,
        contentType: 'image/png'
      }
    ]);

    const res = await fetch(`${BASE_URL}/api/upload/avatar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${state.customerToken}`,
        'Content-Type': contentType
      },
      body: body
    });

    const data = await res.json();

    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(data.data.avatarUrl !== oldAvatarUrl, 'New avatar URL should be different');
  });

  // ─── Customer cannot upload product images ────────────────
  await test('POST /api/upload/product/:id - Customer blocked', async () => {
    const imageData = createTestImage();
    const { body, contentType } = createFormData([
      {
        fieldName: 'images',
        filename: 'hacker.png',
        data: imageData,
        contentType: 'image/png'
      }
    ]);

    const res = await fetch(`${BASE_URL}/api/upload/product/1`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${state.customerToken}`,
        'Content-Type': contentType
      },
      body: body
    });

    assert(res.status === 403, `Expected 403, got ${res.status}`);
  });

  // ─── Customer cannot upload category images ───────────────
  await test('POST /api/upload/category/:id - Customer blocked', async () => {
    const imageData = createTestImage();
    const { body, contentType } = createFormData([
      {
        fieldName: 'image',
        filename: 'hacker.png',
        data: imageData,
        contentType: 'image/png'
      }
    ]);

    const res = await fetch(`${BASE_URL}/api/upload/category/1`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${state.customerToken}`,
        'Content-Type': contentType
      },
      body: body
    });

    assert(res.status === 403, `Expected 403, got ${res.status}`);
  });

  // ─── No auth rejected ─────────────────────────────────────
  await test('POST /api/upload/avatar - Rejected without auth', async () => {
    const imageData = createTestImage();
    const { body, contentType } = createFormData([
      {
        fieldName: 'image',
        filename: 'noauth.png',
        data: imageData,
        contentType: 'image/png'
      }
    ]);

    const res = await fetch(`${BASE_URL}/api/upload/avatar`, {
      method: 'POST',
      headers: {
        'Content-Type': contentType
      },
      body: body
    });

    assert(res.status === 401, `Expected 401, got ${res.status}`);
  });

  // ─── Invalid product ID ───────────────────────────────────
  await test('POST /api/upload/product/:id - Non-existent product rejected', async () => {
    const imageData = createTestImage();
    const { body, contentType } = createFormData([
      {
        fieldName: 'images',
        filename: 'test.png',
        data: imageData,
        contentType: 'image/png'
      }
    ]);

    const res = await fetch(`${BASE_URL}/api/upload/product/99999`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${state.adminToken}`,
        'Content-Type': contentType
      },
      body: body
    });

    assert(res.status === 404, `Expected 404, got ${res.status}`);
  });

  // ─── Delete without imageUrl ──────────────────────────────
  await test('DELETE /api/upload/product/:id/image - Rejected without imageUrl', async () => {
    const { status } = await request('DELETE', '/api/upload/product/1/image', {
      token: state.adminToken,
      body: {}
    });

    assert(status === 400, `Expected 400, got ${status}`);
  });

  // ─── Customer cannot delete ───────────────────────────────
  await test('DELETE /api/upload/product/:id/image - Customer blocked', async () => {
    const { status } = await request('DELETE', '/api/upload/product/1/image', {
      token: state.customerToken,
      body: { imageUrl: 'https://example.com/image.jpg' }
    });

    assert(status === 403, `Expected 403, got ${status}`);
  });
}

// ═════════════════════════════════════════════
// 7. 404 & ERROR HANDLING TESTS
// ═════════════════════════════════════════════
async function testErrorHandling() {
  title('🚨 ERROR HANDLING');

  // ── 404 Route ──────────────────────────────
  await test('GET /api/nonexistent - Returns 404', async () => {
    const { status, data } = await request('GET', '/api/nonexistent-route');

    assert(status === 404, `Expected 404, got ${status}`);
    assert(data.success === false, 'Expected success: false');
    assert(data.error.path, 'Expected path in error response');
  });

  // ── Health Check ───────────────────────────
  await test('GET /health - Health check works', async () => {
    const { status } = await request('GET', '/health');
    assert(status === 200, `Expected 200, got ${status}`);
  });
}

// ═════════════════════════════════════════════
// MAIN RUNNER
// ═════════════════════════════════════════════
async function runAll() {
  console.log('\n\x1b[95m');
  console.log('╔═══════════════════════════════════════════╗');
  console.log('║   🧪  Electronics Store API Test Suite    ║');
  console.log('╚═══════════════════════════════════════════╝');
  console.log('\x1b[0m');
  console.log(`🌐 Testing against: ${BASE_URL}\n`);

  try {
    await testAuth();
    await testCategories();
    await testProducts();
    await testOrders();
    await testUsers();
    await testUploads();
    await testErrorHandling();
  } catch (err) {
    red(`\nUnexpected error in test suite: ${err.message}`);
  }

  // ── Summary ──────────────────────────────
  const total = passed + failed;

  console.log('\n\x1b[95m╔═══════════════════════════════════════════╗');
  console.log('║              📊 TEST RESULTS              ║');
  console.log('╚═══════════════════════════════════════════╝\x1b[0m\n');

  green(`Passed : ${passed} / ${total}`);
  if (failed > 0) {
    red(`Failed : ${failed} / ${total}`);
    console.log('\n\x1b[31mFailed Tests:\x1b[0m');
    errors.forEach((e, i) => {
      console.log(`  ${i + 1}. ${e.name}`);
      console.log(`     → ${e.error}`);
    });
  }

  const percent = Math.round((passed / total) * 100);
  console.log(`\n  Score: ${percent}%`);

  if (failed === 0) {
    console.log('\n\x1b[32m🎉 All tests passed! Your API is working perfectly!\x1b[0m\n');
  } else if (percent >= 80) {
    yellow('\nMost tests passed! Fix the failures above.\n');
  } else {
    red('\nMany tests failed. Check your server is running and seeded.\n');
  }

  console.log('💡 Tips:');
  console.log('  - Make sure server is running: npm run dev');
  console.log('  - Make sure database is seeded: npm run db:seed');
  console.log(`  - Change BASE_URL: TEST_BASE_URL=http://localhost:3001 node test-api.js\n`);

  process.exit(failed === 0 ? 0 : 1);
}

runAll();
