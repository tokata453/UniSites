'use strict';
const db = require('../models');
const { success, created, error, notFound } = require('../utils/response.utils');

const list = async (req, res) => {
  try {
    const faqs = await db.UniversityFAQ.findAll({
      where: { university_id: req.params.universityId, is_published: true },
      order: [['sort_order', 'ASC']],
    });
    return success(res, { faqs });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const create = async (req, res) => {
  try {
    const faq = await db.UniversityFAQ.create({ ...req.body, university_id: req.params.universityId });
    return created(res, { faq });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const update = async (req, res) => {
  try {
    const faq = await db.UniversityFAQ.findByPk(req.params.id);
    if (!faq) return notFound(res);
    await faq.update(req.body);
    return success(res, { faq });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const remove = async (req, res) => {
  try {
    const faq = await db.UniversityFAQ.findByPk(req.params.id);
    if (!faq) return notFound(res);
    await faq.destroy();
    return success(res, {}, 'FAQ deleted');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const reorder = async (req, res) => {
  try {
    await Promise.all(req.body.order.map(({ id, sort_order }) =>
      db.UniversityFAQ.update({ sort_order }, { where: { id } })
    ));
    return success(res, {}, 'FAQs reordered');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

module.exports = { list, create, update, remove, reorder };
