'use strict';
const router = require('express').Router({ mergeParams: true });
const c      = require('../controllers/faq.controller');
const { authenticate }      = require('../middleware/auth.middleware');
const { isUniversityOwner } = require('../middleware/role.middleware');

router.get('/',          c.list);
router.post('/',         authenticate, isUniversityOwner('universityId'), c.create);
router.put('/reorder',   authenticate, isUniversityOwner('universityId'), c.reorder);
router.put('/:id',       authenticate, isUniversityOwner('universityId'), c.update);
router.delete('/:id',    authenticate, isUniversityOwner('universityId'), c.remove);

module.exports = router;
