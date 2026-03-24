'use strict';
const { Op } = require('sequelize');
const db = require('../models');
const { success, created, error, notFound } = require('../utils/response.utils');
const { getPagination, paginateResponse } = require('../utils/pagination.utils');

const normalizeImages = (payload = {}) => {
  const image_urls = Array.isArray(payload.image_urls) ? payload.image_urls.filter(Boolean) : [];
  return { ...payload, image_urls, cover_url: image_urls[0] || payload.cover_url || null };
};

const list = async (req, res) => {
  try {
    const { page = 1, limit = 10, upcoming } = req.query;
    const organization = await db.Organization.findByPk(req.params.organizationId, { attributes: ['id', 'owner_id'] });
    if (!organization) return notFound(res, 'Organization not found');

    const canViewAll = req.user && (
      req.user.Role?.name === 'admin' ||
      organization.owner_id === req.user.id
    );

    const where = { organization_id: req.params.organizationId };
    if (!canViewAll) where.is_published = true;
    if (upcoming === 'true') where.event_date = { [Op.gte]: new Date() };

    const { count, rows } = await db.OrganizationEvent.findAndCountAll({
      where,
      ...getPagination({ page, limit }),
      order: [['is_featured', 'DESC'], ['event_date', 'ASC']],
    });
    return success(res, paginateResponse(rows, count, page, limit));
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const create = async (req, res) => {
  try {
    const event = await db.OrganizationEvent.create({ ...normalizeImages(req.body), organization_id: req.params.organizationId });
    return created(res, { event });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const update = async (req, res) => {
  try {
    const event = await db.OrganizationEvent.findByPk(req.params.id);
    if (!event) return notFound(res);
    await event.update(normalizeImages(req.body));
    return success(res, { event });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const remove = async (req, res) => {
  try {
    const event = await db.OrganizationEvent.findByPk(req.params.id);
    if (!event) return notFound(res);
    await event.destroy();
    return success(res, {}, 'Event deleted');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

module.exports = { list, create, update, remove };
