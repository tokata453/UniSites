'use strict';
const router = require('express').Router({ mergeParams: true });
const c = require('../controllers/organization-review.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { isOrganizationOwner } = require('../middleware/role.middleware');

router.get('/', c.list);
router.post('/', authenticate, c.create);
router.get('/owner', authenticate, isOrganizationOwner('organizationId'), c.ownerList);
router.put('/:id/approve', authenticate, isOrganizationOwner('organizationId'), c.ownerApprove);
router.put('/:id/owner-reply', authenticate, isOrganizationOwner('organizationId'), c.ownerReply);
router.delete('/:id', authenticate, isOrganizationOwner('organizationId'), c.ownerRemove);

module.exports = router;
