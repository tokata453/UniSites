'use strict';
const router = require('express').Router();
const c      = require('../controllers/university.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { isOwner, isAdmin, isUniversityOwner } = require('../middleware/role.middleware');

router.get('/featured',    c.getFeatured);
router.get('/owner/mine',  authenticate, isOwner, c.getMine);
router.get('/',            c.list);
router.get('/:slug',       c.getBySlug);
router.post('/',           authenticate, isOwner, c.create);
router.put('/:id',         authenticate, isUniversityOwner('id'), c.update);
router.delete('/:id',      authenticate, isAdmin, c.remove);

module.exports = router;
