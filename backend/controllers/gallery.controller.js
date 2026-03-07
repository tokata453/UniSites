'use strict';
const db = require('../models');
const { success, created, error, notFound } = require('../utils/response.utils');
const { deleteImage } = require('../config/cloudinary');

const list = async (req, res) => {
  try {
    const gallery = await db.UniversityGallery.findAll({
      where: { university_id: req.params.universityId },
      order: [['sort_order', 'ASC']],
    });
    return success(res, { gallery });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const upload = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) return error(res, 'No files uploaded');
    const items = req.files.map((file, i) => ({
      university_id: req.params.universityId,
      url:           file.path,
      public_id:     file.filename,
      caption:       req.body.captions?.[i] || '',
      category:      req.body.category || 'campus',
    }));
    const gallery = await db.UniversityGallery.bulkCreate(items);
    return created(res, { gallery }, `${gallery.length} image(s) uploaded`);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const reorder = async (req, res) => {
  try {
    const { order } = req.body;
    await Promise.all(order.map(({ id, sort_order }) =>
      db.UniversityGallery.update({ sort_order }, { where: { id } })
    ));
    return success(res, {}, 'Gallery reordered');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const updateItem = async (req, res) => {
  try {
    const item = await db.UniversityGallery.findByPk(req.params.id);
    if (!item) return notFound(res);
    await item.update(req.body);
    return success(res, { item });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const remove = async (req, res) => {
  try {
    const item = await db.UniversityGallery.findByPk(req.params.id);
    if (!item) return notFound(res);
    if (item.public_id) await deleteImage(item.public_id);
    await item.destroy();
    return success(res, {}, 'Image deleted');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

module.exports = { list, upload, reorder, updateItem, remove };
