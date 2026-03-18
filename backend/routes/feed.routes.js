'use strict';
const router = require('express').Router();
const c = require('../controllers/feed.controller');
const { authenticate, optionalAuth } = require('../middleware/auth.middleware');

router.get('/', optionalAuth, c.list);
router.get('/:itemType/:itemId/comments', c.getComments);
router.post('/:itemType/:itemId/comments', authenticate, c.addComment);
router.post('/:itemType/:itemId/like', authenticate, c.toggleLike);

module.exports = router;
