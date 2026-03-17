'use strict';
const router = require('express').Router();
const ctrl = require('../controllers/inbox.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/users/search', ctrl.searchUsers);
router.get('/conversations', ctrl.listConversations);
router.post('/conversations', ctrl.createConversation);
router.get('/conversations/:id/messages', ctrl.getMessages);
router.post('/conversations/:id/messages', ctrl.sendMessage);
router.put('/conversations/:id/read', ctrl.markConversationRead);

module.exports = router;
