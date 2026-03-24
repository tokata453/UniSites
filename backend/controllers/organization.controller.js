'use strict';

const { Op } = require('sequelize');
const { uniqueSlug } = require('../utils/slug.utils');
const { success, created, error, notFound } = require('../utils/response.utils');
const db = require('../models');

const list = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 12, 1), 100);
    const offset = (page - 1) * limit;
    const sort = req.query.sort || 'name';
    const order = String(req.query.order || 'ASC').toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const where = { is_published: true };
    if (req.query.search?.trim()) {
      const q = req.query.search.trim();
      where[Op.or] = [
        { name: { [Op.iLike]: `%${q}%` } },
        { tagline: { [Op.iLike]: `%${q}%` } },
        { category: { [Op.iLike]: `%${q}%` } },
        { industry: { [Op.iLike]: `%${q}%` } },
        { location: { [Op.iLike]: `%${q}%` } },
      ];
    }
    if (req.query.category?.trim()) where.category = { [Op.iLike]: `%${req.query.category.trim()}%` };
    if (req.query.location?.trim()) where.location = { [Op.iLike]: `%${req.query.location.trim()}%` };
    if (req.query.verified === 'true') where.is_verified = true;

    const sortableFields = new Set(['name', 'created_at', 'updated_at', 'founded_year']);
    const orderBy = sortableFields.has(sort) ? [[sort, order]] : [['name', 'ASC']];

    const { rows, count } = await db.Organization.findAndCountAll({
      where,
      attributes: [
        'id',
        'slug',
        'name',
        'tagline',
        'category',
        'industry',
        'location',
        'team_size',
        'founded_year',
        'description',
        'logo_url',
        'cover_url',
        'website_url',
        'is_verified',
        'owner_id',
        'created_at',
      ],
      order: orderBy,
      limit,
      offset,
    });

    const organizationIds = rows.map((item) => item.id).filter(Boolean);
    const opportunities = organizationIds.length
      ? await db.Opportunity.findAll({
          where: { organization_id: organizationIds, is_published: true },
          attributes: ['organization_id'],
        })
      : [];

    const opportunityCounts = opportunities.reduce((acc, item) => {
      const key = String(item.organization_id);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const organizations = rows.map((item) => ({
      ...item.toJSON(),
      opportunity_count: opportunityCounts[String(item.id)] || 0,
    }));

    return success(res, {
      organizations,
      total: count,
      meta: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const getMine = async (req, res) => {
  try {
    let organization = await db.Organization.findOne({
      where: { owner_id: req.user.id },
      include: [
        { model: db.User, as: 'Owner', attributes: ['id', 'name', 'email', 'avatar_url'] },
        { model: db.OrganizationContact, as: 'Contact', required: false },
        { model: db.OrganizationGallery, as: 'Gallery', required: false },
        { model: db.OrganizationFAQ, as: 'FAQs', required: false },
      ],
    });

    if (!organization) return notFound(res, 'Organization profile not found');

    return success(res, { organization });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const getBySlug = async (req, res) => {
  try {
    const organization = await db.Organization.findOne({
      where: { slug: req.params.slug, is_published: true },
      include: [
        { model: db.User, as: 'Owner', attributes: ['id', 'name', 'email', 'avatar_url'], required: false },
      ],
    });

    if (!organization) return notFound(res, 'Organization profile not found');
    const [contact, gallery, faqs, news, events, reviews, opportunities] = await Promise.all([
      db.OrganizationContact.findOne({ where: { organization_id: organization.id } }),
      db.OrganizationGallery.findAll({ where: { organization_id: organization.id }, order: [['sort_order', 'ASC'], ['created_at', 'ASC']] }),
      db.OrganizationFAQ.findAll({ where: { organization_id: organization.id, is_published: true }, order: [['sort_order', 'ASC'], ['created_at', 'ASC']] }),
      db.OrganizationNews.findAll({
        where: { organization_id: organization.id, is_published: true },
        limit: 10,
        order: [['is_pinned', 'DESC'], ['published_at', 'DESC'], ['created_at', 'DESC']],
        include: [{ model: db.User, as: 'Author', attributes: ['id', 'name', 'avatar_url'], required: false }],
      }),
      db.OrganizationEvent.findAll({
        where: { organization_id: organization.id, is_published: true },
        limit: 10,
        order: [['is_featured', 'DESC'], ['event_date', 'ASC']],
      }),
      db.OrganizationReview.findAll({
        where: { organization_id: organization.id, is_approved: true },
        limit: 10,
        order: [['created_at', 'DESC']],
        include: [{ model: db.User, as: 'Author', attributes: ['id', 'name', 'avatar_url'], required: false }],
      }),
      db.Opportunity.findAll({
        where: { organization_id: organization.id, is_published: true },
        attributes: ['id', 'slug', 'title', 'type', 'deadline', 'cover_url', 'is_featured', 'is_fully_funded', 'country'],
        order: [['created_at', 'DESC']],
      }),
    ]);

    const organizationJson = organization.toJSON();
    organizationJson.Contact = contact;
    organizationJson.Gallery = gallery;
    organizationJson.FAQs = faqs;
    organizationJson.News = news;
    organizationJson.Events = events;
    organizationJson.Reviews = reviews;
    organizationJson.Opportunities = opportunities;

    return success(res, { organization: organizationJson });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const upsertMine = async (req, res) => {
  try {
    const payload = {
      name: req.body.name,
      tagline: req.body.tagline,
      category: req.body.category,
      industry: req.body.industry,
      description: req.body.description ?? req.body.bio,
      mission: req.body.mission,
      vision: req.body.vision,
      location: req.body.location,
      address: req.body.address,
      founded_year: req.body.founded_year || null,
      team_size: req.body.team_size,
      website_url: req.body.website_url,
      contact_phone: req.body.contact_phone,
      email: req.body.email || req.user.email,
      facebook_url: req.body.facebook_url,
      telegram_url: req.body.telegram_url,
      instagram_url: req.body.instagram_url,
      linkedin_url: req.body.linkedin_url,
    };

    if (req.file) payload.logo_url = req.file.path;

    let organization = await db.Organization.findOne({ where: { owner_id: req.user.id } });
    if (!organization) {
      organization = await db.Organization.create({
        owner_id: req.user.id,
        slug: uniqueSlug(payload.name || req.user.name || 'organization'),
        name: payload.name || req.user.name || 'Organization',
        email: payload.email || req.user.email || null,
        ...payload,
      });
      const hydrated = await db.Organization.findByPk(organization.id, {
        include: [
          { model: db.User, as: 'Owner', attributes: ['id', 'name', 'email', 'avatar_url'] },
          { model: db.OrganizationContact, as: 'Contact', required: false },
          { model: db.OrganizationGallery, as: 'Gallery', required: false },
          { model: db.OrganizationFAQ, as: 'FAQs', required: false },
        ],
      });
      return created(res, { organization: hydrated }, 'Organization profile created');
    }

    if (payload.name && payload.name !== organization.name) {
      payload.slug = uniqueSlug(payload.name);
    }

    await organization.update(payload);
    organization = await db.Organization.findByPk(organization.id, {
      include: [
        { model: db.User, as: 'Owner', attributes: ['id', 'name', 'email', 'avatar_url'] },
        { model: db.OrganizationContact, as: 'Contact', required: false },
        { model: db.OrganizationGallery, as: 'Gallery', required: false },
        { model: db.OrganizationFAQ, as: 'FAQs', required: false },
      ],
    });

    return success(res, { organization }, 'Organization profile updated');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

module.exports = { list, getMine, getBySlug, upsertMine };
