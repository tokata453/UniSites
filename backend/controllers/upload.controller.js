'use strict';
const { success, error } = require('../utils/response.utils');
const { deleteImage } = require('../config/cloudinary');

const uploadSingle = (req, res) => {
  if (!req.file) return error(res, 'No file uploaded');
  return success(res, { url: req.file.path, public_id: req.file.filename });
};

const uploadMultiple = (req, res) => {
  if (!req.files || !req.files.length) return error(res, 'No files uploaded');
  return success(res, { files: req.files.map(f => ({ url: f.path, public_id: f.filename })) });
};

const deleteFile = async (req, res) => {
  try {
    await deleteImage(req.params.publicId);
    return success(res, {}, 'File deleted');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

module.exports = { uploadSingle, uploadMultiple, deleteFile };
