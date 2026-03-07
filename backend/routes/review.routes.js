'use strict';
const router = require('express').Router({ mergeParams: true });
const c      = require('../controllers/review.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { isAdmin }      = require('../middleware/role.middleware');

router.get('/',              c.list);
router.post('/',             authenticate, c.create);
router.put('/:id/approve',   authenticate, isAdmin, c.approve);
router.delete('/:id',        authenticate, isAdmin, c.remove);

module.exports = router;
