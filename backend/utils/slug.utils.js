'use strict';
const slugify = require('slugify');

const toSlug = (text) =>
  slugify(text, { lower: true, strict: true, trim: true });

const uniqueSlug = (text) =>
  `${toSlug(text)}-${Date.now().toString(36)}`;

module.exports = { toSlug, uniqueSlug };
