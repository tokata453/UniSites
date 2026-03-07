'use strict';
const db = require('../models');
const { success, created, error, notFound } = require('../utils/response.utils');
const { getPagination, paginateResponse } = require('../utils/pagination.utils');

const recalcRating = async (universityId) => {
  const reviews = await db.Review.findAll({
    where: { university_id: universityId, is_approved: true },
    attributes: ['rating'],
  });
  const count = reviews.length;
  const avg   = count ? reviews.reduce((s, r) => s + r.rating, 0) / count : 0;
  await db.University.update(
    { rating_avg: parseFloat(avg.toFixed(2)), review_count: count },
    { where: { id: universityId } }
  );
};

const list = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const { count, rows } = await db.Review.findAndCountAll({
      where: { university_id: req.params.universityId, is_approved: true },
      ...getPagination({ page, limit }),
      order: [['created_at', 'DESC']],
      include: [{ model: db.User, as: 'Author', attributes: ['id', 'name', 'avatar_url'] }],
    });
    return success(res, paginateResponse(rows, count, page, limit));
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const create = async (req, res) => {
  try {
    const existing = await db.Review.findOne({ where: { university_id: req.params.universityId, author_id: req.user.id } });
    if (existing) return error(res, 'You have already reviewed this university');

    const review = await db.Review.create({
      ...req.body,
      university_id: req.params.universityId,
      author_id:     req.user.id,
      is_approved:   false,
    });
    return created(res, { review }, 'Review submitted. Pending approval.');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const approve = async (req, res) => {
  try {
    const review = await db.Review.findByPk(req.params.id);
    if (!review) return notFound(res);
    await review.update({ is_approved: true });
    await recalcRating(review.university_id);
    return success(res, { review }, 'Review approved');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const remove = async (req, res) => {
  try {
    const review = await db.Review.findByPk(req.params.id);
    if (!review) return notFound(res);
    await review.destroy();
    await recalcRating(review.university_id);
    return success(res, {}, 'Review deleted');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

module.exports = { list, create, approve, remove };
