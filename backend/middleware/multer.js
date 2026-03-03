// middleware/multer.js
const multer = require('multer');

// Store files in memory (no disk) - we upload straight to Railway Bucket
const storage = multer.memoryStorage();

// File filter - images only
const imageFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, webp, gif)'), false);
  }
};

upload = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

uploadSingle = upload.single('image');
uploadMultiple = upload.array('images', 5); // For product images - max 5

module.exports = { uploadSingle, uploadMultiple };