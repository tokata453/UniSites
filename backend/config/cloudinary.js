'use strict';
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloudinary_url: process.env.CLOUDINARY_URL,
});

const createStorage = (folder) =>
  new CloudinaryStorage({
    cloudinary,
    params: {
      folder:          `unisites/${folder}`,
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
      transformation:  [{ quality: 'auto', fetch_format: 'auto' }],
    },
  });

const uploadAvatar  = multer({ storage: createStorage('avatars'),  limits: { fileSize: 5  * 1024 * 1024 } });
const uploadGallery = multer({ storage: createStorage('gallery'),  limits: { fileSize: 10 * 1024 * 1024 } });
const uploadCover   = multer({ storage: createStorage('covers'),   limits: { fileSize: 10 * 1024 * 1024 } });
const uploadLogo    = multer({ storage: createStorage('logos'),    limits: { fileSize: 5  * 1024 * 1024 } });
const uploadGeneral = multer({ storage: createStorage('general'),  limits: { fileSize: 10 * 1024 * 1024 } });

const deleteImage = async (publicId) => {
  return cloudinary.uploader.destroy(publicId);
};

module.exports = { cloudinary, uploadAvatar, uploadGallery, uploadCover, uploadLogo, uploadGeneral, deleteImage };
