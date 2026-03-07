'use strict';
const { Op } = require('sequelize');
const db = require('../models');
const { success, created, error, notFound } = require('../utils/response.utils');
const { getPagination, paginateResponse } = require('../utils/pagination.utils');
const { uniqueSlug } = require('../utils/slug.utils');

const list = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const where = { university_id: req.params.universityId, is_published: true };
    if (search) where.title = { [Op.iLike]: `%${search}%` };

    const { count, rows } = await db.UniversityNews.findAndCountAll({
      where,
      ...getPagination({ page, limit }),
      order: [['is_pinned', 'DESC'], ['published_at', 'DESC']],
      include: [{ model: db.User, as: 'Author', attributes: ['id', 'name', 'avatar_url'] }],
    });
    return success(res, paginateResponse(rows, count, page, limit));
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const getBySlug = async (req, res) => {
  try {
    const news = await db.UniversityNews.findOne({
      where: { slug: req.params.slug, is_published: true },
      include: [{ model: db.User, as: 'Author', attributes: ['id', 'name', 'avatar_url'] }],
    });
    if (!news) return notFound(res, 'News not found');
    await news.increment('views_count');
    return success(res, { news });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const create = async (req, res) => {
  try {
    const news = await db.UniversityNews.create({
      ...req.body,
      slug:          uniqueSlug(req.body.title),
      university_id: req.params.universityId,
      author_id:     req.user.id,
      published_at:  req.body.is_published ? new Date() : null,
    });
    return created(res, { news });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const update = async (req, res) => {
  try {
    const news = await db.UniversityNews.findByPk(req.params.id);
    if (!news) return notFound(res);
    const publishNow = req.body.is_published && !news.published_at;
    await news.update({ ...req.body, ...(publishNow && { published_at: new Date() }) });
    return success(res, { news });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const remove = async (req, res) => {
  try {
    const news = await db.UniversityNews.findByPk(req.params.id);
    if (!news) return notFound(res);
    await news.destroy();
    return success(res, {}, 'News deleted');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

module.exports = { list, getBySlug, create, update, remove };
