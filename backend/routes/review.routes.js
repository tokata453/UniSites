'use strict';
const router = require('express').Router({ mergeParams: true });
const c      = require('../controllers/review.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { isAdmin }      = require('../middleware/role.middleware');
const { isUniversityOwner } = require('../middleware/role.middleware');

router.get('/',              c.list);
router.post('/',             authenticate, c.create);
router.get('/owner',         authenticate, isUniversityOwner(), c.ownerList);
router.put('/:id/owner-reply', authenticate, isUniversityOwner(), c.ownerReply);
router.put('/:id/flag',      authenticate, isUniversityOwner(), c.ownerFlag);
router.put('/:id/approve',   authenticate, isAdmin, c.approve);
router.delete('/:id',        authenticate, isAdmin, c.remove);

module.exports = router;
