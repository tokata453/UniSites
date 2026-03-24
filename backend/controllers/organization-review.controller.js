'use strict';
const db = require('../models');
const { success, created, error, notFound, forbidden } = require('../utils/response.utils');
const { getPagination, paginateResponse } = require('../utils/pagination.utils');

const list = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const { count, rows } = await db.OrganizationReview.findAndCountAll({
      where: { organization_id: req.params.organizationId, is_approved: true },
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
    const existing = await db.OrganizationReview.findOne({
      where: { organization_id: req.params.organizationId, author_id: req.user.id },
    });
    if (existing) return error(res, 'You have already reviewed this organization');

    const review = await db.OrganizationReview.create({
      ...req.body,
      organization_id: req.params.organizationId,
      author_id: req.user.id,
      is_approved: true,
    });
    return created(res, { review }, 'Review published successfully.');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const ownerList = async (req, res) => {
  try {
    const reviews = await db.OrganizationReview.findAll({
      where: { organization_id: req.organization.id },
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
    const review = await db.OrganizationReview.findByPk(req.params.id);
    if (!review) return notFound(res, 'Review not found');
    if (review.organization_id !== req.organization.id) return forbidden(res, 'This review does not belong to your organization');

    await review.update({
      owner_reply: req.body.owner_reply?.trim() || null,
      owner_replied_at: req.body.owner_reply?.trim() ? new Date() : null,
    });

    return success(res, { review }, review.owner_reply ? 'Reply saved' : 'Reply removed');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const ownerApprove = async (req, res) => {
  try {
    const review = await db.OrganizationReview.findByPk(req.params.id);
    if (!review) return notFound(res, 'Review not found');
    if (review.organization_id !== req.organization.id) return forbidden(res, 'This review does not belong to your organization');

    await review.update({ is_approved: !review.is_approved });
    return success(res, { review }, `Review ${review.is_approved ? 'is now visible' : 'has been hidden'}`);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const ownerRemove = async (req, res) => {
  try {
    const review = await db.OrganizationReview.findByPk(req.params.id);
    if (!review) return notFound(res, 'Review not found');
    if (review.organization_id !== req.organization.id) return forbidden(res, 'This review does not belong to your organization');

    await review.destroy();
    return success(res, {}, 'Review deleted');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

module.exports = { list, create, ownerList, ownerReply, ownerApprove, ownerRemove };
