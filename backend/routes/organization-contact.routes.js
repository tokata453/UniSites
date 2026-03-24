'use strict';
const router = require('express').Router({ mergeParams: true });
const c = require('../controllers/organization-contact.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { isOrganizationOwner } = require('../middleware/role.middleware');

router.get('/', c.get);
router.put('/', authenticate, isOrganizationOwner('organizationId'), c.upsert);

module.exports = router;
