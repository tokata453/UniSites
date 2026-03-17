'use strict';
const router = require('express').Router();
const c      = require('../controllers/major.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { isAdmin }      = require('../middleware/role.middleware');

router.get('/featured',          c.getFeatured);
router.get('/quiz/questions',    c.getQuizQuestions);
router.post('/quiz/recommend',   c.getRecommendations);
router.get('/',                  c.list);
router.get('/:slug',             c.getBySlug);
router.post('/',                 authenticate, isAdmin, c.create);
router.put('/:id',               authenticate, isAdmin, c.update);
router.delete('/:id',            authenticate, isAdmin, c.remove);

module.exports = router;
