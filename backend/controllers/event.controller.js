'use strict';
const { Op } = require('sequelize');
const db = require('../models');
const { success, created, error, notFound } = require('../utils/response.utils');
const { getPagination, paginateResponse } = require('../utils/pagination.utils');

const list = async (req, res) => {
  try {
    const { page = 1, limit = 10, upcoming } = req.query;
    const where = { university_id: req.params.universityId, is_published: true };
    if (upcoming === 'true') where.event_date = { [Op.gte]: new Date() };

    const { count, rows } = await db.UniversityEvent.findAndCountAll({
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
    const event = await db.UniversityEvent.create({ ...req.body, university_id: req.params.universityId });
    return created(res, { event });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const update = async (req, res) => {
  try {
    const event = await db.UniversityEvent.findByPk(req.params.id);
    if (!event) return notFound(res);
    await event.update(req.body);
    return success(res, { event });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const remove = async (req, res) => {
  try {
    const event = await db.UniversityEvent.findByPk(req.params.id);
    if (!event) return notFound(res);
    await event.destroy();
    return success(res, {}, 'Event deleted');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

module.exports = { list, create, update, remove };
