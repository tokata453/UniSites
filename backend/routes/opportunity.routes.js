'use strict';
const router = require('express').Router();
const c      = require('../controllers/opportunity.controller');
const { authenticate, optionalAuth } = require('../middleware/auth.middleware');
const { isOpportunityOwner }         = require('../middleware/role.middleware');

router.get('/featured',       c.getFeatured);
router.get('/',               c.list);
router.get('/:slug',          optionalAuth, c.getBySlug);
router.post('/',              authenticate, c.create);
router.put('/:id',            authenticate, isOpportunityOwner(), c.update);
router.delete('/:id',         authenticate, isOpportunityOwner(), c.remove);
router.post('/:id/apply',     authenticate, c.trackApplication);

module.exports = router;
