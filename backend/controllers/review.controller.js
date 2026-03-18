'use strict';
const db = require('../models');
const { success, created, error, notFound, forbidden } = require('../utils/response.utils');
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
      is_approved:   true,
    });
    await recalcRating(review.university_id);
    return created(res, { review }, 'Review published successfully.');
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

const ownerList = async (req, res) => {
  try {
    const reviews = await db.Review.findAll({
      where: { university_id: req.university.id },
      order: [['created_at', 'DESC']],
      include: [{ model: db.User, as: 'Author', attributes: ['id', 'name', 'email', 'avatar_url'] }],
    });
    return success(res, { reviews });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const ownerReply = async (req, res) => {
  try {
    const review = await db.Review.findByPk(req.params.id);
    if (!review) return notFound(res, 'Review not found');
    if (review.university_id !== req.university.id) return forbidden(res, 'This review does not belong to your university');

    await review.update({
      owner_reply: req.body.owner_reply?.trim() || null,
      owner_replied_at: req.body.owner_reply?.trim() ? new Date() : null,
    });

    return success(res, { review }, review.owner_reply ? 'Reply saved' : 'Reply removed');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const ownerFlag = async (req, res) => {
  try {
    const review = await db.Review.findByPk(req.params.id);
    if (!review) return notFound(res, 'Review not found');
    if (review.university_id !== req.university.id) return forbidden(res, 'This review does not belong to your university');

    const reason = req.body.reason?.trim() || null;
    await review.update({
      flagged_for_recheck: !!reason,
      flag_reason: reason,
      flagged_at: reason ? new Date() : null,
    });

    return success(res, { review }, reason ? 'Review flagged for admin re-check' : 'Review flag cleared');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const ownerApprove = async (req, res) => {
  try {
    const review = await db.Review.findByPk(req.params.id);
    if (!review) return notFound(res, 'Review not found');
    if (review.university_id !== req.university.id) return forbidden(res, 'This review does not belong to your university');

    await review.update({ is_approved: !review.is_approved });
    await recalcRating(review.university_id);

    return success(
      res,
      { review },
      `Review ${review.is_approved ? 'is now visible' : 'has been hidden'}`
    );
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const ownerRemove = async (req, res) => {
  try {
    const review = await db.Review.findByPk(req.params.id);
    if (!review) return notFound(res, 'Review not found');
    if (review.university_id !== req.university.id) return forbidden(res, 'This review does not belong to your university');

    await review.destroy();
    await recalcRating(req.university.id);
    return success(res, {}, 'Review deleted');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

module.exports = { list, create, approve, remove, ownerList, ownerReply, ownerFlag, ownerApprove, ownerRemove };
