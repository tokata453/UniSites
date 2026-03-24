'use strict';
const { Op } = require('sequelize');
const db = require('../models');
const { success, created, error, notFound } = require('../utils/response.utils');
const { getPagination, paginateResponse } = require('../utils/pagination.utils');
const { uniqueSlug } = require('../utils/slug.utils');

const normalizeImages = (payload = {}) => {
  const image_urls = Array.isArray(payload.image_urls) ? payload.image_urls.filter(Boolean) : [];
  return { ...payload, image_urls, cover_url: image_urls[0] || payload.cover_url || null };
};

const list = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const organization = await db.Organization.findByPk(req.params.organizationId, { attributes: ['id', 'owner_id'] });
    if (!organization) return notFound(res, 'Organization not found');

    const canViewAll = req.user && (
      req.user.Role?.name === 'admin' ||
      organization.owner_id === req.user.id
    );

    const where = { organization_id: req.params.organizationId };
    if (!canViewAll) where.is_published = true;
    if (search) where.title = { [Op.iLike]: `%${search}%` };

    const { count, rows } = await db.OrganizationNews.findAndCountAll({
      where,
      ...getPagination({ page, limit }),
      order: [['is_pinned', 'DESC'], ['published_at', 'DESC'], ['created_at', 'DESC']],
      include: [{ model: db.User, as: 'Author', attributes: ['id', 'name', 'avatar_url'] }],
    });
    return success(res, paginateResponse(rows, count, page, limit));
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const create = async (req, res) => {
  try {
    const news = await db.OrganizationNews.create({
      ...normalizeImages(req.body),
      slug: uniqueSlug(req.body.title),
      organization_id: req.params.organizationId,
      author_id: req.user.id,
      published_at: req.body.is_published ? new Date() : null,
    });
    return created(res, { news });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const update = async (req, res) => {
  try {
    const news = await db.OrganizationNews.findByPk(req.params.id);
    if (!news) return notFound(res);
    const publishNow = req.body.is_published && !news.published_at;
    await news.update({ ...normalizeImages(req.body), ...(publishNow && { published_at: new Date() }) });
    return success(res, { news });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const remove = async (req, res) => {
  try {
    const news = await db.OrganizationNews.findByPk(req.params.id);
    if (!news) return notFound(res);
    await news.destroy();
    return success(res, {}, 'News deleted');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

module.exports = { list, create, update, remove };
