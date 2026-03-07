'use strict';
const router = require('express').Router();
const c      = require('../controllers/analytics.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { isOwner }      = require('../middleware/role.middleware');

router.get('/:universityId', authenticate, isOwner, c.getAnalytics);
router.post('/track',        c.trackClick);

module.exports = router;
