'use strict';
const router = require('express').Router({ mergeParams: true });
const c = require('../controllers/organization-faq.controller');
const { authenticate, optionalAuth } = require('../middleware/auth.middleware');
const { isOrganizationOwner } = require('../middleware/role.middleware');

router.get('/', optionalAuth, c.list);
router.post('/', authenticate, isOrganizationOwner('organizationId'), c.create);
router.put('/:id', authenticate, isOrganizationOwner('organizationId'), c.update);
router.delete('/:id', authenticate, isOrganizationOwner('organizationId'), c.remove);

module.exports = router;
