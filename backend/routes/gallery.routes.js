'use strict';
const router = require('express').Router({ mergeParams: true });
const c      = require('../controllers/gallery.controller');
const { authenticate }          = require('../middleware/auth.middleware');
const { isUniversityOwner }     = require('../middleware/role.middleware');
const { uploadGallery }         = require('../config/cloudinary');
const { uploadLimiter }         = require('../middleware/rateLimit.middleware');

router.get('/',        c.list);
router.post('/',       authenticate, isUniversityOwner('universityId'), uploadLimiter, uploadGallery.array('images', 20), c.upload);
router.put('/reorder', authenticate, isUniversityOwner('universityId'), c.reorder);
router.put('/:id',     authenticate, isUniversityOwner('universityId'), c.updateItem);
router.delete('/:id',  authenticate, isUniversityOwner('universityId'), c.remove);

module.exports = router;
