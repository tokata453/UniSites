'use strict';
const { Op } = require('sequelize');
const db = require('../models');
const { success, created, error, notFound } = require('../utils/response.utils');
const { getPagination, paginateResponse } = require('../utils/pagination.utils');
const { uniqueSlug } = require('../utils/slug.utils');

const normalizeImages = (payload = {}) => {
  const image_urls = Array.isArray(payload.image_urls)
    ? payload.image_urls.filter(Boolean)
    : [];

  return {
    ...payload,
    image_urls,
    cover_url: image_urls[0] || payload.cover_url || null,
  };
};

const list = async (req, res) => {
  try {
    const { page = 1, limit = 12, search, type, field_of_study, country, is_fully_funded, source, sort = 'created_at', order = 'DESC' } = req.query;

    const where = { is_published: true };
    if (search) {
      where[Op.or] = [
        { title:   { [Op.iLike]: `%${search}%` } },
        { country: { [Op.iLike]: `%${search}%` } },
      ];
    }
    if (type)                     where.type            = type;
    if (country)                  where.country         = { [Op.iLike]: `%${country}%` };
    if (is_fully_funded === 'true') where.is_fully_funded = true;
    if (source)                   where.source          = source;
    if (field_of_study)           where.field_of_study  = { [Op.contains]: [field_of_study] };

    const allowed   = ['created_at', 'deadline', 'views_count', 'title'];
    const safeSort  = allowed.includes(sort) ? sort : 'created_at';
    const safeOrder = order === 'ASC' ? 'ASC' : 'DESC';

    const { count, rows } = await db.Opportunity.findAndCountAll({
      where,
      ...getPagination({ page, limit }),
      distinct: true,
      order: [[safeSort, safeOrder]],
      include: [
        { model: db.OpportunityTag, as: 'Tags' },
        {
          model: db.University,
          as: 'University',
          required: false,
          attributes: ['id', 'name', 'slug', 'logo_url', 'owner_id'],
          include: [{ model: db.User, as: 'Owner', attributes: ['id', 'name', 'avatar_url'] }],
        },
        { model: db.Organization, as: 'Organization', required: false, attributes: ['id', 'name', 'slug', 'logo_url', 'owner_id'] },
        { model: db.User, as: 'PostedBy', required: false, attributes: ['id', 'name', 'avatar_url', 'website_url', 'contact_phone'] },
      ],
    });
    return success(res, paginateResponse(rows, count, page, limit));
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const getFeatured = async (req, res) => {
  try {
    const opportunities = await db.Opportunity.findAll({
      where: { is_featured: true, is_published: true },
      limit: 6,
      order: [['created_at', 'DESC']],
      include: [
        {
          model: db.University,
          as: 'University',
          required: false,
          attributes: ['id', 'name', 'logo_url', 'owner_id'],
          include: [{ model: db.User, as: 'Owner', attributes: ['id', 'name', 'avatar_url'] }],
        },
        { model: db.Organization, as: 'Organization', required: false, attributes: ['id', 'name', 'slug', 'logo_url', 'owner_id'] },
        { model: db.OpportunityTag, as: 'Tags' },
        { model: db.User, as: 'PostedBy', required: false, attributes: ['id', 'name', 'avatar_url', 'website_url', 'contact_phone'] },
      ],
    });
    return success(res, { opportunities });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const getMine = async (req, res) => {
  try {
    const role = req.user.Role?.name;
    let where = { posted_by: req.user.id };

    if (role === 'owner') {
      const ownedUniversity = await db.University.findOne({
        where: { owner_id: req.user.id },
        attributes: ['id'],
      });

      where = ownedUniversity?.id
        ? {
            [Op.or]: [
              { posted_by: req.user.id },
              { university_id: ownedUniversity.id },
            ],
          }
        : { posted_by: req.user.id };
    }

    const opportunities = await db.Opportunity.findAll({
      where,
      include: [
        { model: db.OpportunityTag, as: 'Tags' },
        {
          model: db.University,
          as: 'University',
          required: false,
          attributes: ['id', 'name', 'slug', 'logo_url', 'owner_id'],
          include: [{ model: db.User, as: 'Owner', attributes: ['id', 'name', 'avatar_url'] }],
        },
        { model: db.Organization, as: 'Organization', required: false, attributes: ['id', 'name', 'slug', 'logo_url', 'owner_id'] },
        { model: db.User, as: 'PostedBy', required: false, attributes: ['id', 'name', 'avatar_url', 'website_url', 'contact_phone'] },
      ],
      order: [['created_at', 'DESC']],
    });
    return success(res, { opportunities });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const getBySlug = async (req, res) => {
  try {
    const opportunity = await db.Opportunity.findOne({
      where: { slug: req.params.slug, is_published: true },
      include: [
        { model: db.OpportunityTag, as: 'Tags' },
        {
          model: db.University,
          as: 'University',
          required: false,
          attributes: ['id', 'name', 'slug', 'logo_url', 'province', 'owner_id'],
          include: [{ model: db.User, as: 'Owner', attributes: ['id', 'name', 'avatar_url'] }],
        },
        { model: db.Organization, as: 'Organization', required: false, attributes: ['id', 'name', 'slug', 'logo_url', 'owner_id'] },
        { model: db.User, as: 'PostedBy', required: false, attributes: ['id', 'name', 'avatar_url', 'website_url', 'contact_phone'] },
      ],
    });
    if (!opportunity) return notFound(res, 'Opportunity not found');
    await opportunity.increment('views_count');
    return success(res, { opportunity });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const create = async (req, res) => {
  try {
    const { tags, ...data } = req.body;
    const opportunity = await db.Opportunity.create({
      ...normalizeImages(data),
      slug:         uniqueSlug(data.title),
      posted_by:    req.user.id,
      is_published: false,
    });
    if (tags && tags.length > 0) {
      await db.OpportunityTag.bulkCreate(tags.map(tag => ({ opportunity_id: opportunity.id, tag })));
    }
    return created(res, { opportunity }, 'Opportunity submitted. Pending review.');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const update = async (req, res) => {
  try {
    const { tags, ...data } = req.body;
    await req.opportunity.update(normalizeImages(data));
    if (tags !== undefined) {
      await db.OpportunityTag.destroy({ where: { opportunity_id: req.opportunity.id } });
      if (tags.length > 0) {
        await db.OpportunityTag.bulkCreate(tags.map(tag => ({ opportunity_id: req.opportunity.id, tag })));
      }
    }
    return success(res, { opportunity: req.opportunity }, 'Opportunity updated');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const remove = async (req, res) => {
  try {
    await req.opportunity.destroy();
    return success(res, {}, 'Opportunity deleted');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const trackApplication = async (req, res) => {
  try {
    const opp = await db.Opportunity.findByPk(req.params.id);
    if (!opp) return notFound(res);
    const [record, isNew] = await db.OpportunityApplication.findOrCreate({
      where: { opportunity_id: opp.id, user_id: req.user.id },
      defaults: { status: 'applied', applied_at: new Date() },
    });
    if (!isNew) await record.update({ status: 'applied', applied_at: new Date() });
    await opp.increment('applicant_count');
    return success(res, { application: record });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

module.exports = { list, getFeatured, getMine, getBySlug, create, update, remove, trackApplication };
