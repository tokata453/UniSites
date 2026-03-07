'use strict';
const router = require('express').Router({ mergeParams: true });
const c      = require('../controllers/contact.controller');
const { authenticate }      = require('../middleware/auth.middleware');
const { isUniversityOwner } = require('../middleware/role.middleware');

router.get('/', c.get);
router.put('/', authenticate, isUniversityOwner('universityId'), c.upsert);

module.exports = router;
