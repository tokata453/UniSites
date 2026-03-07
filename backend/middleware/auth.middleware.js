'use strict';
const { verifyToken }  = require('../utils/jwt.utils');
const { unauthorized } = require('../utils/response.utils');
const db = require('../models');

const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) return unauthorized(res);

    const token   = header.split(' ')[1];
    const decoded = verifyToken(token);

    const user = await db.User.findByPk(decoded.id, {
      include: [{ model: db.Role, as: 'Role' }],
      attributes: { exclude: ['provider_id'] },
    });

    if (!user || !user.is_active) return unauthorized(res, 'Account not found or inactive');

    req.user = user;
    next();
  } catch {
    return unauthorized(res, 'Invalid or expired token');
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (header && header.startsWith('Bearer ')) {
      const decoded = verifyToken(header.split(' ')[1]);
      const user = await db.User.findByPk(decoded.id, {
        include: [{ model: db.Role, as: 'Role' }],
      });
      if (user && user.is_active) req.user = user;
    }
  } catch { /* silent */ }
  next();
};

module.exports = { authenticate, optionalAuth };
