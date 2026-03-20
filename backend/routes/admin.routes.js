'use strict';
const router = require('express').Router();
const ctrl   = require('../controllers/admin.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/stats',                    ctrl.getStats);
router.get('/feed',                     ctrl.getFeedItems);

// Users
router.get('/users',                    ctrl.getUsers);
router.get('/users/:id',                ctrl.getUser);
router.put('/users/:id',                ctrl.updateUser);
router.delete('/users/:id',             ctrl.deleteUser);

// Universities
router.get('/universities',             ctrl.getUniversities);
router.get('/universities/:id/sources', ctrl.getUniversitySources);
router.post('/universities',            ctrl.createUniversity);
router.put('/universities/:id',         ctrl.updateUniversity);
router.delete('/universities/:id',      ctrl.deleteUniversity);

// Organizations
router.get('/organizations',            ctrl.getOrganizations);
router.post('/organizations',           ctrl.createOrganization);
router.put('/organizations/:id',        ctrl.updateOrganization);
router.delete('/organizations/:id',     ctrl.deleteOrganization);

// Opportunities
router.get('/opportunities',            ctrl.getOpportunities);
router.put('/opportunities/:id',        ctrl.updateOpportunity);
router.delete('/opportunities/:id',     ctrl.deleteOpportunity);

// Feed / News moderation
router.put('/feed/news/:id',            ctrl.updateFeedNews);

// Reviews
router.get('/reviews',                  ctrl.getReviews);
router.put('/reviews/:id/approve',      ctrl.approveReview);
router.delete('/reviews/:id',           ctrl.deleteReview);

module.exports = router;
