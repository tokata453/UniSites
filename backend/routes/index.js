'use strict';
const router = require('express').Router();

router.use('/auth',        require('./auth.routes'));
router.use('/upload',      require('./upload.routes'));
router.use('/analytics',   require('./analytics.routes'));

// Universities + all nested sub-resources
router.use('/universities',                                   require('./university.routes'));
router.use('/universities/:universityId/gallery',             require('./gallery.routes'));
router.use('/universities/:universityId/faculties',           require('./faculty.routes'));
router.use('/universities/:universityId/programs',            require('./program.routes'));
router.use('/universities/:universityId/admissions',          require('./admission.routes'));
router.use('/universities/:universityId/news',                require('./news.routes'));
router.use('/universities/:universityId/events',              require('./event.routes'));
router.use('/universities/:universityId/faqs',                require('./faq.routes'));
router.use('/universities/:universityId/contact',             require('./contact.routes'));
router.use('/universities/:universityId/reviews',             require('./review.routes'));

router.use('/opportunities', require('./opportunity.routes'));
router.use('/majors',        require('./major.routes'));
router.use('/forum',         require('./forum.routes'));
router.use('/inbox',         require('./inbox.routes'));
router.use('/admin',         require('./admin.routes'))

module.exports = router;
