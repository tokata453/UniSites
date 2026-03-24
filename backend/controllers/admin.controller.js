'use strict';
const db = require('../models');
const { Op } = require('sequelize');
const { success, error, notFound, forbidden, serverError } = require('../utils/response.utils');

const isAdmin = (req, res) => {
  if (req.user?.Role?.name !== 'admin') { forbidden(res, 'Admin access required'); return false; }
  return true;
};

const attachOwnedUniversitySummary = async (users) => {
  await Promise.all(
    users.map(async (user) => {
      const [ownedUniversity, ownedOrganization] = await Promise.all([
        db.University.findOne({
          where: { owner_id: user.id },
          attributes: ['id', 'name', 'slug'],
          order: [['created_at', 'ASC']],
        }),
        db.Organization.findOne({
          where: { owner_id: user.id },
          attributes: ['id', 'name', 'slug'],
          order: [['created_at', 'ASC']],
        }),
      ]);

      user.setDataValue('owned_university_id', ownedUniversity?.id || null);
      user.setDataValue('owned_university_name', ownedUniversity?.name || null);
      user.setDataValue('owned_university_slug', ownedUniversity?.slug || null);
      user.setDataValue('owned_organization_id', ownedOrganization?.id || null);
      user.setDataValue('owned_organization_name', ownedOrganization?.name || null);
      user.setDataValue('owned_organization_slug', ownedOrganization?.slug || null);
    }),
  );
};

const validateOwnerAvailability = async ({ ownerId, universityId = null }) => {
  if (!ownerId) return null;

  const ownerUser = await db.User.findByPk(ownerId, {
    include: [{ model: db.Role, as: 'Role', attributes: ['name'] }],
    attributes: ['id'],
  });

  if (!ownerUser) {
    return 'Selected owner user was not found.';
  }

  if (ownerUser.Role?.name !== 'owner') {
    return 'Only users with the owner role can own a university.';
  }

  const existingOwnedUniversity = await db.University.findOne({
    where: {
      owner_id: ownerId,
      ...(universityId ? { id: { [Op.ne]: universityId } } : {}),
    },
    attributes: ['id', 'name'],
  });

  if (!existingOwnedUniversity) return null;

  return `This owner already owns "${existingOwnedUniversity.name}". Transfer ownership from their current university first.`;
};

const validateOrganizationOwnerAvailability = async ({ ownerId, organizationId = null }) => {
  if (!ownerId) return null;

  const ownerUser = await db.User.findByPk(ownerId, {
    include: [{ model: db.Role, as: 'Role', attributes: ['name'] }],
    attributes: ['id'],
  });

  if (!ownerUser) {
    return 'Selected organization owner was not found.';
  }

  if (ownerUser.Role?.name !== 'organization') {
    return 'Only users with the organization role can own an organization profile.';
  }

  const existingOwnedOrganization = await db.Organization.findOne({
    where: {
      owner_id: ownerId,
      ...(organizationId ? { id: { [Op.ne]: organizationId } } : {}),
    },
    attributes: ['id', 'name'],
  });

  if (!existingOwnedOrganization) return null;

  return `This owner already owns "${existingOwnedOrganization.name}". Transfer ownership from their current organization first.`;
};

const recalcUniversityRating = async (universityId) => {
  const reviews = await db.UniversityReview.findAll({
    where: { university_id: universityId, is_approved: true },
    attributes: ['rating'],
  });

  const count = reviews.length;
  const avg = count ? reviews.reduce((sum, review) => sum + review.rating, 0) / count : 0;

  await db.University.update(
    { rating_avg: parseFloat(avg.toFixed(2)), review_count: count },
    { where: { id: universityId } }
  );
};

const attachFeedInteractionMeta = async (items) => {
  if (!items.length) return items;

  const groupedIds = items.reduce((acc, item) => {
    acc[item.kind] ||= [];
    acc[item.kind].push(item.id);
    return acc;
  }, {});

  const likeWhere = [];
  if (groupedIds.news?.length) likeWhere.push({ item_type: 'news', item_id: { [Op.in]: groupedIds.news } });
  if (groupedIds.opportunity?.length) likeWhere.push({ item_type: 'opportunity', item_id: { [Op.in]: groupedIds.opportunity } });

  const [likes, comments] = await Promise.all([
    likeWhere.length ? db.FeedLike.findAll({ where: { [Op.or]: likeWhere }, attributes: ['item_type', 'item_id'] }) : [],
    likeWhere.length ? db.FeedComment.findAll({ where: { [Op.or]: likeWhere }, attributes: ['item_type', 'item_id'] }) : [],
  ]);

  const countMap = (records) =>
    records.reduce((acc, record) => {
      const key = `${record.item_type}:${record.item_id}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

  const likeCounts = countMap(likes);
  const commentCounts = countMap(comments);

  return items.map((item) => {
    const key = `${item.kind}:${item.id}`;
    return {
      ...item,
      like_count: likeCounts[key] || 0,
      comment_count: commentCounts[key] || 0,
    };
  });
};

// ── Stats overview ────────────────────────────────────────────────────────────
exports.getStats = async (req, res) => {
  try {
    if (!isAdmin(req, res)) return;
    const [users, universities, opportunities, reviews] = await Promise.all([
      db.User.count(),
      db.University.count(),
      db.Opportunity.count(),
      db.UniversityReview.count(),
    ]);
    const [students, owners, organizations, admins] = await Promise.all([
      db.User.count({ include: [{ model: db.Role, as: 'Role', where: { name: 'student' } }] }),
      db.User.count({ include: [{ model: db.Role, as: 'Role', where: { name: 'owner' } }] }),
      db.Organization.count(),
      db.User.count({ include: [{ model: db.Role, as: 'Role', where: { name: 'admin' } }] }),
    ]);
    const pendingUnis = await db.University.count({ where: { is_published: false } });
    const pendingReviews = await db.UniversityReview.count({ where: { is_approved: false } });
    const pendingOrganizations = await db.Organization.count({ where: { is_approved: false } });
    const pendingOpps = await db.Opportunity.count({ where: { is_published: false } });
    return success(res, { stats: { users, universities, opportunities, reviews, students, owners, organizations, admins, pendingUnis, pendingReviews, pendingOrganizations, pendingOpps } });
  } catch (e) { serverError(res, e.message); }
};

// ── Feed ─────────────────────────────────────────────────────────────────────
exports.getFeedItems = async (req, res) => {
  try {
    if (!isAdmin(req, res)) return;
    const { page = 1, limit = 12, kind = 'all', search = '', published } = req.query;
    const safeLimit = Math.min(Math.max(Number(limit) || 12, 1), 50);
    const safePage = Math.max(Number(page) || 1, 1);
    const offset = (safePage - 1) * safeLimit;
    const term = String(search || '').trim();

    const newsWhere = {};
    const opportunityWhere = {};

    if (published !== undefined && published !== '') {
      newsWhere.is_published = published === 'true';
      opportunityWhere.is_published = published === 'true';
    }

    if (term) {
      newsWhere[Op.or] = [
        { title: { [Op.iLike]: `%${term}%` } },
        { excerpt: { [Op.iLike]: `%${term}%` } },
        { content: { [Op.iLike]: `%${term}%` } },
        { '$University.name$': { [Op.iLike]: `%${term}%` } },
      ];
      opportunityWhere[Op.or] = [
        { title: { [Op.iLike]: `%${term}%` } },
        { description: { [Op.iLike]: `%${term}%` } },
        { country: { [Op.iLike]: `%${term}%` } },
        { '$University.name$': { [Op.iLike]: `%${term}%` } },
        { '$PostedBy.name$': { [Op.iLike]: `%${term}%` } },
      ];
    }

    const fetchSize = safePage * safeLimit;

    const [newsResult, opportunityResult] = await Promise.all([
      kind === 'opportunity'
        ? { count: 0, rows: [] }
        : db.UniversityNews.findAndCountAll({
            where: newsWhere,
            limit: fetchSize,
            order: [['created_at', 'DESC']],
            include: [
              { model: db.University, as: 'University', attributes: ['id', 'name', 'slug', 'logo_url', 'province'], required: false },
              { model: db.User, as: 'Author', attributes: ['id', 'name', 'avatar_url'], required: false },
            ],
          }),
      kind === 'news'
        ? { count: 0, rows: [] }
        : db.Opportunity.findAndCountAll({
            where: opportunityWhere,
            limit: fetchSize,
            order: [['created_at', 'DESC']],
            include: [
              { model: db.OpportunityTag, as: 'Tags', required: false },
              { model: db.University, as: 'University', attributes: ['id', 'name', 'slug', 'logo_url', 'province'], required: false },
              { model: db.User, as: 'PostedBy', attributes: ['id', 'name', 'avatar_url'], required: false },
            ],
          }),
    ]);

    const rawItems = [
      ...(newsResult.rows || []).map((item) => ({
        id: item.id,
        kind: 'news',
        created_at: item.published_at || item.created_at,
        News: item,
      })),
      ...(opportunityResult.rows || []).map((item) => ({
        id: item.id,
        kind: 'opportunity',
        created_at: item.created_at,
        Opportunity: item,
      })),
    ];

    rawItems.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    const items = await attachFeedInteractionMeta(rawItems.slice(offset, offset + safeLimit));
    const total = Number(newsResult.count || 0) + Number(opportunityResult.count || 0);

    return success(res, {
      items,
      meta: {
        total,
        page: safePage,
        limit: safeLimit,
        totalPages: Math.ceil(total / safeLimit),
      },
    });
  } catch (e) { serverError(res, e.message); }
};

exports.updateFeedNews = async (req, res) => {
  try {
    if (!isAdmin(req, res)) return;
    const news = await db.UniversityNews.findByPk(req.params.id);
    if (!news) return notFound(res, 'News item not found');

    const nextData = { ...req.body };
    if (Object.prototype.hasOwnProperty.call(nextData, 'is_published')) {
      nextData.published_at = nextData.is_published
        ? (news.published_at || new Date())
        : null;
    }

    await news.update(nextData);
    return success(res, { news }, 'Feed news updated');
  } catch (e) { serverError(res, e.message); }
};

// ── Organizations ─────────────────────────────────────────────────────────────
exports.getOrganizations = async (req, res) => {
  try {
    if (!isAdmin(req, res)) return;
    const { page = 1, limit = 20, search, published, approved } = req.query;
    const where = {};
    const ownerWhere = {};

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
      ownerWhere[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (published !== undefined) where.is_published = published === 'true';
    if (approved !== undefined) where.is_approved = approved === 'true';

    const { count, rows } = await db.Organization.findAndCountAll({
      where,
      limit: +limit,
      offset: (+page - 1) * +limit,
      include: [
        {
          model: db.User,
          as: 'Owner',
          attributes: ['id', 'name', 'email', 'avatar_url', 'is_active'],
          where: ownerWhere,
          required: Object.keys(ownerWhere).length > 0,
        },
      ],
      order: [['created_at', 'DESC']],
    });

    return success(res, {
      organizations: rows,
      total: count,
      page: +page,
      pages: Math.ceil(count / +limit),
    });
  } catch (e) { serverError(res, e.message); }
};

exports.createOrganization = async (req, res) => {
  try {
    if (!isAdmin(req, res)) return;

    const ownerError = await validateOrganizationOwnerAvailability({
      ownerId: req.body.owner_id || null,
    });
    if (ownerError) return error(res, ownerError, 400);

    const organization = await db.Organization.create({
      slug: req.body.slug,
      name: req.body.name,
      logo_url: req.body.logo_url || null,
      cover_url: req.body.cover_url || null,
      description: req.body.description || null,
      website_url: req.body.website_url || null,
      email: req.body.email || null,
      contact_phone: req.body.contact_phone || null,
      facebook_url: req.body.facebook_url || null,
      telegram_url: req.body.telegram_url || null,
      instagram_url: req.body.instagram_url || null,
      linkedin_url: req.body.linkedin_url || null,
      owner_id: req.body.owner_id,
      is_approved: Object.prototype.hasOwnProperty.call(req.body, 'is_approved')
        ? Boolean(req.body.is_approved)
        : false,
      is_verified: Boolean(req.body.is_verified),
      is_published: Object.prototype.hasOwnProperty.call(req.body, 'is_published')
        ? Boolean(req.body.is_published)
        : true,
    });

    return success(res, { organization }, 'Organization created');
  } catch (e) { serverError(res, e.message); }
};

exports.updateOrganization = async (req, res) => {
  try {
    if (!isAdmin(req, res)) return;
    const organization = await db.Organization.findByPk(req.params.id);
    if (!organization) return notFound(res, 'Organization not found');

    if (Object.prototype.hasOwnProperty.call(req.body, 'owner_id')) {
      const ownerError = await validateOrganizationOwnerAvailability({
        ownerId: req.body.owner_id || null,
        organizationId: organization.id,
      });
      if (ownerError) return error(res, ownerError, 400);
    }

    await organization.update(req.body);
    return success(res, { organization }, 'Organization updated');
  } catch (e) { serverError(res, e.message); }
};

exports.deleteOrganization = async (req, res) => {
  try {
    if (!isAdmin(req, res)) return;
    const organization = await db.Organization.findByPk(req.params.id);
    if (!organization) return notFound(res, 'Organization not found');
    await organization.destroy();
    return success(res, {}, 'Organization deleted');
  } catch (e) { serverError(res, e.message); }
};

// ── Users ─────────────────────────────────────────────────────────────────────
exports.getUsers = async (req, res) => {
  try {
    if (!isAdmin(req, res)) return;
    const { page = 1, limit = 20, search, role } = req.query;
    const where = {};
    if (search) where[Op.or] = [{ name: { [Op.iLike]: `%${search}%` } }, { email: { [Op.iLike]: `%${search}%` } }];
    const roleWhere = role ? { name: role } : {};
    const { count, rows } = await db.User.findAndCountAll({
      where, limit: +limit, offset: (+page - 1) * +limit,
      include: [
        { model: db.Role, as: 'Role', where: roleWhere, required: !!role },
        { model: db.Organization, as: 'Organization', required: false, attributes: ['id', 'name', 'slug', 'is_approved'] },
      ],
      attributes: { exclude: ['password', 'provider_id'] },
      order: [['created_at', 'DESC']],
    });

    await attachOwnedUniversitySummary(rows);
    return success(res, { users: rows, total: count, page: +page, pages: Math.ceil(count / +limit) });
  } catch (e) { serverError(res, e.message); }
};

exports.getUser = async (req, res) => {
  try {
    if (!isAdmin(req, res)) return;
    const user = await db.User.findByPk(req.params.id, {
      attributes: { exclude: ['password', 'provider_id'] },
      include: [
        { model: db.Role, as: 'Role' },
        { model: db.Organization, as: 'Organization', required: false, attributes: ['id', 'name', 'slug', 'is_approved'] },
      ],
    });
    if (!user) return notFound(res, 'User not found');

    const [opportunitiesPosted, universitiesOwned] = await Promise.all([
      db.Opportunity.count({ where: { posted_by: user.id } }),
      db.University.count({ where: { owner_id: user.id } }),
    ]);

    return success(res, {
      user,
      stats: {
        opportunitiesPosted,
        universitiesOwned,
      },
    });
  } catch (e) { serverError(res, e.message); }
};

exports.updateUser = async (req, res) => {
  try {
    if (!isAdmin(req, res)) return;
    const user = await db.User.findByPk(req.params.id);
    if (!user) return notFound(res, 'User not found');
    const { name, email, bio, website_url, contact_phone, is_active, is_approved, role } = req.body;
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (bio !== undefined) user.bio = bio;
    if (website_url !== undefined) user.website_url = website_url;
    if (contact_phone !== undefined) user.contact_phone = contact_phone;
    if (is_active !== undefined) user.is_active = is_active;
    if (is_approved !== undefined) user.is_approved = is_approved;
    if (role) {
      const roleRow = await db.Role.findOne({ where: { name: role } });
      if (roleRow) user.role_id = roleRow.id;
    }
    await user.save();
    return success(res, { user }, 'User updated');
  } catch (e) { serverError(res, e.message); }
};

exports.deleteUser = async (req, res) => {
  try {
    if (!isAdmin(req, res)) return;
    const user = await db.User.findByPk(req.params.id);
    if (!user) return notFound(res, 'User not found');
    await user.destroy();
    return success(res, {}, 'User deleted');
  } catch (e) { serverError(res, e.message); }
};

// ── Universities ──────────────────────────────────────────────────────────────
exports.getUniversities = async (req, res) => {
  try {
    if (!isAdmin(req, res)) return;
    const { page = 1, limit = 20, search, type, published } = req.query;
    const where = {};
    if (search) where.name = { [Op.iLike]: `%${search}%` };
    if (type) where.university_type = type;
    if (published !== undefined) where.is_published = published === 'true';
    const { count, rows } = await db.University.findAndCountAll({
      where, limit: +limit, offset: (+page - 1) * +limit,
      include: [{ model: db.User, as: 'Owner', attributes: ['id', 'name', 'email'] }],
      order: [['created_at', 'DESC']],
    });
    return success(res, { universities: rows, total: count, page: +page, pages: Math.ceil(count / +limit) });
  } catch (e) { serverError(res, e.message); }
};

exports.getUniversitySources = async (req, res) => {
  try {
    if (!isAdmin(req, res)) return;
    const university = await db.University.findByPk(req.params.id, {
      include: [
        {
          model: db.UniversityContact,
          as: 'Contact',
          required: false,
        },
      ],
    });
    if (!university) return notFound(res, 'University not found');
    const sources = await db.UniversitySource.findAll({
      where: { university_id: university.id },
      order: [['updated_at', 'DESC']],
    });
    return success(res, { university, sources });
  } catch (e) { serverError(res, e.message); }
};

exports.updateUniversity = async (req, res) => {
  try {
    if (!isAdmin(req, res)) return;
    const uni = await db.University.findByPk(req.params.id);
    if (!uni) return notFound(res, 'University not found');

    if (Object.prototype.hasOwnProperty.call(req.body, 'owner_id')) {
      const ownerError = await validateOwnerAvailability({
        ownerId: req.body.owner_id || null,
        universityId: uni.id,
      });
      if (ownerError) return error(res, ownerError, 400);
    }

    await uni.update(req.body);
    return success(res, { university: uni }, 'University updated');
  } catch (e) { serverError(res, e.message); }
};

exports.deleteUniversity = async (req, res) => {
  try {
    if (!isAdmin(req, res)) return;
    const uni = await db.University.findByPk(req.params.id);
    if (!uni) return notFound(res, 'University not found');
    await uni.destroy();
    return success(res, {}, 'University deleted');
  } catch (e) { serverError(res, e.message); }
};

// ── Opportunities ─────────────────────────────────────────────────────────────
exports.getOpportunities = async (req, res) => {
  try {
    if (!isAdmin(req, res)) return;
    const { page = 1, limit = 20, search, type, published } = req.query;
    const where = {};
    if (search) where.title = { [Op.iLike]: `%${search}%` };
    if (type) where.type = type;
    if (published !== undefined) where.is_published = published === 'true';
    const { count, rows } = await db.Opportunity.findAndCountAll({
      where, limit: +limit, offset: (+page - 1) * +limit,
      include: [
        { model: db.University, as: 'University', attributes: ['id', 'name'] },
        { model: db.User, as: 'PostedBy', attributes: ['id', 'name', 'email', 'avatar_url'], include: [{ model: db.Role, as: 'Role', attributes: ['name'] }], required: false },
      ],
      order: [['created_at', 'DESC']],
    });
    return success(res, { opportunities: rows, total: count, page: +page, pages: Math.ceil(count / +limit) });
  } catch (e) { serverError(res, e.message); }
};

exports.updateOpportunity = async (req, res) => {
  try {
    if (!isAdmin(req, res)) return;
    const opp = await db.Opportunity.findByPk(req.params.id);
    if (!opp) return notFound(res, 'Opportunity not found');
    await opp.update(req.body);
    return success(res, { opportunity: opp }, 'Opportunity updated');
  } catch (e) { serverError(res, e.message); }
};

exports.deleteOpportunity = async (req, res) => {
  try {
    if (!isAdmin(req, res)) return;
    const opp = await db.Opportunity.findByPk(req.params.id);
    if (!opp) return notFound(res, 'Opportunity not found');
    await opp.destroy();
    return success(res, {}, 'Opportunity deleted');
  } catch (e) { serverError(res, e.message); }
};

// ── Reviews ───────────────────────────────────────────────────────────────────
exports.getReviews = async (req, res) => {
  try {
    if (!isAdmin(req, res)) return;
    const { page = 1, limit = 20, approved, flagged, search } = req.query;
    const where = {};
    if (approved !== undefined) where.is_approved = approved === 'true';
    if (flagged !== undefined) where.flagged_for_recheck = flagged === 'true';
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { content: { [Op.iLike]: `%${search}%` } },
        { pros: { [Op.iLike]: `%${search}%` } },
        { cons: { [Op.iLike]: `%${search}%` } },
        { owner_reply: { [Op.iLike]: `%${search}%` } },
        { flag_reason: { [Op.iLike]: `%${search}%` } },
        { '$University.name$': { [Op.iLike]: `%${search}%` } },
        { '$Author.name$': { [Op.iLike]: `%${search}%` } },
        { '$Author.email$': { [Op.iLike]: `%${search}%` } },
      ];
    }
    const { count, rows } = await db.UniversityReview.findAndCountAll({
      where, limit: +limit, offset: (+page - 1) * +limit,
      include: [
        { model: db.University, as: 'University', attributes: ['id', 'name'] },
        { model: db.User, as: 'Author', attributes: ['id', 'name', 'email'] },
      ],
      order: [['created_at', 'DESC']],
    });
    return success(res, { reviews: rows, total: count, page: +page, pages: Math.ceil(count / +limit) });
  } catch (e) { serverError(res, e.message); }
};

exports.approveReview = async (req, res) => {
  try {
    if (!isAdmin(req, res)) return;
    const review = await db.UniversityReview.findByPk(req.params.id);
    if (!review) return notFound(res, 'Review not found');
    review.is_approved = !review.is_approved;
    await review.save();
    await recalcUniversityRating(review.university_id);
    return success(res, { review }, `Review ${review.is_approved ? 'approved' : 'unapproved'}`);
  } catch (e) { serverError(res, e.message); }
};

exports.deleteReview = async (req, res) => {
  try {
    if (!isAdmin(req, res)) return;
    const review = await db.UniversityReview.findByPk(req.params.id);
    if (!review) return notFound(res, 'Review not found');
    const universityId = review.university_id;
    await review.destroy();
    await recalcUniversityRating(universityId);
    return success(res, {}, 'Review deleted');
  } catch (e) { serverError(res, e.message); }
};

exports.createUniversity = async (req, res) => {
  try {
    if (!isAdmin(req, res)) return;
    const { name, university_type, province, description, website_url, email, phone,
            facebook_url, tuition_min, tuition_max, founded_year, student_count,
            scholarship_available, dormitory_available, international_students,
            owner_id } = req.body;

    if (!name || !university_type) return error(res, 'Name and type are required');

    const ownerError = await validateOwnerAvailability({
      ownerId: owner_id || null,
    });
    if (ownerError) return error(res, ownerError, 400);

    const { uniqueSlug } = require('../utils/slug.utils');
    const university = await db.University.create({
      name, slug: uniqueSlug(name),
      university_type, province, description,
      website_url, email, phone, facebook_url,
      tuition_min: tuition_min || null,
      tuition_max: tuition_max || null,
      tuition_currency: 'USD',
      founded_year: founded_year || null,
      student_count: student_count || null,
      scholarship_available: !!scholarship_available,
      dormitory_available:   !!dormitory_available,
      international_students: !!international_students,
      owner_id: owner_id || null,
      is_published: false,
      is_verified:  false,
      is_featured:  false,
      views_count: 0,
      rating_avg: 0,
    });
    return res.status(201).json({ success: true, message: 'University created', university });
  } catch (e) { serverError(res, e.message); }
};
