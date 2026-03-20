'use strict';
const rateLimit = require('express-rate-limit');

const json429 = { success: false, message: 'Too many requests. Please try again later.' };
const isProduction = process.env.NODE_ENV === 'production';

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: json429,
  skip: () => !isProduction,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: json429,
  skip: () => !isProduction,
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Upload limit reached. Try again in an hour.' },
  skip: () => !isProduction,
});

module.exports = { apiLimiter, authLimiter, uploadLimiter };
