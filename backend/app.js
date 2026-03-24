'use strict';

const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');
const passport   = require('passport');

const { apiLimiter } = require('./middleware/rateLimit.middleware');
const errorHandler   = require('./middleware/errorHandler.middleware');
const routes         = require('./routes');
const db             = require('./models');

// Initialize passport strategies
require('./config/passport')(db);

const app = express();

// Core middleware
app.use(helmet()); // Setting the right security headers to prevent attacks.
app.use(cors({
  origin:      process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(passport.initialize());

// API routes
app.use('/api', apiLimiter, routes);

// Health check
app.get('/health', (req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString(), env: process.env.NODE_ENV })
);

// 404
app.use((req, res) =>
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.path}` })
);

// Global error handler
app.use(errorHandler);

module.exports = app;
