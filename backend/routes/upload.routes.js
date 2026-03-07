'use strict';
const router                                     = require('express').Router();
const c                                          = require('../controllers/upload.controller');
const { authenticate }                           = require('../middleware/auth.middleware');
const { uploadLimiter }                          = require('../middleware/rateLimit.middleware');
const { uploadGeneral, uploadCover, uploadLogo } = require('../config/cloudinary');

router.post('/image',      authenticate, uploadLimiter, uploadGeneral.single('image'),  c.uploadSingle);
router.post('/cover',      authenticate, uploadLimiter, uploadCover.single('cover'),    c.uploadSingle);
router.post('/logo',       authenticate, uploadLimiter, uploadLogo.single('logo'),      c.uploadSingle);
router.post('/images',     authenticate, uploadLimiter, uploadGeneral.array('images', 10), c.uploadMultiple);
router.delete('/:publicId',authenticate, c.deleteFile);

module.exports = router;
