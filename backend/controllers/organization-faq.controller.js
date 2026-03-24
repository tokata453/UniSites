'use strict';
const db = require('../models');
const { success, created, error, notFound } = require('../utils/response.utils');

const list = async (req, res) => {
  try {
    const canViewAll = req.user && (
      req.user.Role?.name === 'admin' ||
      req.organization?.owner_id === req.user.id
    );
    const faqs = await db.OrganizationFAQ.findAll({
      where: {
        organization_id: req.params.organizationId,
        ...(canViewAll ? {} : { is_published: true }),
      },
      order: [['sort_order', 'ASC'], ['created_at', 'ASC']],
    });
    return success(res, { faqs });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const create = async (req, res) => {
  try {
    const faq = await db.OrganizationFAQ.create({ ...req.body, organization_id: req.params.organizationId });
    return created(res, { faq });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const update = async (req, res) => {
  try {
    const faq = await db.OrganizationFAQ.findByPk(req.params.id);
    if (!faq) return notFound(res);
    await faq.update(req.body);
    return success(res, { faq });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const remove = async (req, res) => {
  try {
    const faq = await db.OrganizationFAQ.findByPk(req.params.id);
    if (!faq) return notFound(res);
    await faq.destroy();
    return success(res, {}, 'FAQ deleted');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

module.exports = { list, create, update, remove };
