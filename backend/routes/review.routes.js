'use strict';
const router = require('express').Router({ mergeParams: true });
const c      = require('../controllers/review.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { isUniversityOwner } = require('../middleware/role.middleware');

router.get('/',              c.list);
router.post('/',             authenticate, c.create);
router.get('/owner',         authenticate, isUniversityOwner(), c.ownerList);
router.put('/:id/approve',   authenticate, isUniversityOwner(), c.ownerApprove);
router.put('/:id/owner-reply', authenticate, isUniversityOwner(), c.ownerReply);
router.put('/:id/flag',      authenticate, isUniversityOwner(), c.ownerFlag);
router.delete('/:id',        authenticate, isUniversityOwner(), c.ownerRemove);

module.exports = router;
