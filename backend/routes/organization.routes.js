'use strict';

const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { uploadLogo } = require('../config/cloudinary');
const c = require('../controllers/organization.controller');

router.get('/mine', authenticate, requireRole('organization', 'admin'), c.getMine);
router.get('/', c.list);
router.get('/:slug', c.getBySlug);
router.put('/mine', authenticate, requireRole('organization', 'admin'), uploadLogo.single('logo'), c.upsertMine);

module.exports = router;
