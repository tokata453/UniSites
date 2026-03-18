'use strict';
const router = require('express').Router({ mergeParams: true });
const c      = require('../controllers/event.controller');
const { authenticate, optionalAuth }      = require('../middleware/auth.middleware');
const { isUniversityOwner } = require('../middleware/role.middleware');

router.get('/',       optionalAuth, c.list);
router.post('/',      authenticate, isUniversityOwner('universityId'), c.create);
router.put('/:id',    authenticate, isUniversityOwner('universityId'), c.update);
router.delete('/:id', authenticate, isUniversityOwner('universityId'), c.remove);

module.exports = router;
