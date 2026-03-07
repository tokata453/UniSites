'use strict';
const router = require('express').Router();
const c      = require('../controllers/forum.controller');
const { authenticate, optionalAuth } = require('../middleware/auth.middleware');

router.get('/categories',                   c.getCategories);
router.get('/threads',                      optionalAuth, c.getThreads);
router.get('/threads/:slug',                optionalAuth, c.getThread);
router.post('/threads',                     authenticate, c.createThread);
router.put('/threads/:id',                  authenticate, c.updateThread);
router.delete('/threads/:id',               authenticate, c.deleteThread);
router.post('/threads/:threadId/replies',   authenticate, c.createReply);
router.put('/replies/:id',                  authenticate, c.updateReply);
router.delete('/replies/:id',               authenticate, c.deleteReply);
router.post('/replies/:replyId/like',       authenticate, c.toggleLike);
router.post('/replies/:replyId/accept',     authenticate, c.acceptReply);

module.exports = router;
