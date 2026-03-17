'use strict';
const db = require('../models');
const { Op } = require('sequelize');
const { success, error, notFound, forbidden, serverError } = require('../utils/response.utils');

const isAdmin = (req, res) => {
  if (req.user?.Role?.name !== 'admin') { forbidden(res, 'Admin access required'); return false; }
  return true;
};

const recalcUniversityRating = async (universityId) => {
  const reviews = await db.Review.findAll({
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

// ── Stats overview ────────────────────────────────────────────────────────────
exports.getStats = async (req, res) => {
  try {
    if (!isAdmin(req, res)) return;
    const [users, universities, opportunities, threads, reviews] = await Promise.all([
      db.User.count(),
      db.University.count(),
      db.Opportunity.count(),
      db.ForumThread.count(),
      db.Review.count(),
    ]);
    const [students, owners, organizations, admins] = await Promise.all([
      db.User.count({ include: [{ model: db.Role, as: 'Role', where: { name: 'student' } }] }),
      db.User.count({ include: [{ model: db.Role, as: 'Role', where: { name: 'owner' } }] }),
      db.User.count({ include: [{ model: db.Role, as: 'Role', where: { name: 'organization' } }] }),
      db.User.count({ include: [{ model: db.Role, as: 'Role', where: { name: 'admin' } }] }),
    ]);
    const pendingUnis = await db.University.count({ where: { is_published: false } });
    const pendingReviews = await db.Review.count({ where: { is_approved: false } });
    const pendingOrganizations = await db.User.count({
      where: { is_approved: false },
      include: [{ model: db.Role, as: 'Role', where: { name: 'organization' } }],
    });
    const pendingOpps = await db.Opportunity.count({ where: { is_published: false } });
    return success(res, { stats: { users, universities, opportunities, threads, reviews, students, owners, organizations, admins, pendingUnis, pendingReviews, pendingOrganizations, pendingOpps } });
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
      include: [{ model: db.Role, as: 'Role', where: roleWhere, required: !!role }],
      attributes: { exclude: ['password', 'provider_id'] },
      order: [['created_at', 'DESC']],
    });
    return success(res, { users: rows, total: count, page: +page, pages: Math.ceil(count / +limit) });
  } catch (e) { serverError(res, e.message); }
};

exports.getUser = async (req, res) => {
  try {
    if (!isAdmin(req, res)) return;
    const user = await db.User.findByPk(req.params.id, {
      attributes: { exclude: ['password', 'provider_id'] },
      include: [{ model: db.Role, as: 'Role' }],
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
    const { is_active, is_approved, role } = req.body;
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

exports.updateUniversity = async (req, res) => {
  try {
    if (!isAdmin(req, res)) return;
    const uni = await db.University.findByPk(req.params.id);
    if (!uni) return notFound(res, 'University not found');
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
    const { page = 1, limit = 20, approved, flagged } = req.query;
    const where = {};
    if (approved !== undefined) where.is_approved = approved === 'true';
    if (flagged !== undefined) where.flagged_for_recheck = flagged === 'true';
    const { count, rows } = await db.Review.findAndCountAll({
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
    const review = await db.Review.findByPk(req.params.id);
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
    const review = await db.Review.findByPk(req.params.id);
    if (!review) return notFound(res, 'Review not found');
    const universityId = review.university_id;
    await review.destroy();
    await recalcUniversityRating(universityId);
    return success(res, {}, 'Review deleted');
  } catch (e) { serverError(res, e.message); }
};

// ── Forum ─────────────────────────────────────────────────────────────────────
exports.getThreads = async (req, res) => {
  try {
    if (!isAdmin(req, res)) return;
    const { page = 1, limit = 20, search } = req.query;
    const where = {};
    if (search) where.title = { [Op.iLike]: `%${search}%` };
    const { count, rows } = await db.ForumThread.findAndCountAll({
      where, limit: +limit, offset: (+page - 1) * +limit,
      include: [
        { model: db.User, as: 'Author', attributes: ['id', 'name', 'email'] },
        { model: db.ForumCategory, as: 'Category', attributes: ['id', 'name'] },
      ],
      order: [['created_at', 'DESC']],
    });
    return success(res, { threads: rows, total: count, page: +page, pages: Math.ceil(count / +limit) });
  } catch (e) { serverError(res, e.message); }
};

exports.deleteThread = async (req, res) => {
  try {
    if (!isAdmin(req, res)) return;
    const thread = await db.ForumThread.findByPk(req.params.id);
    if (!thread) return notFound(res, 'Thread not found');
    await thread.destroy();
    return success(res, {}, 'Thread deleted');
  } catch (e) { serverError(res, e.message); }
};

exports.pinThread = async (req, res) => {
  try {
    if (!isAdmin(req, res)) return;
    const thread = await db.ForumThread.findByPk(req.params.id);
    if (!thread) return notFound(res, 'Thread not found');
    thread.is_pinned = !thread.is_pinned;
    await thread.save();
    return success(res, { thread }, `Thread ${thread.is_pinned ? 'pinned' : 'unpinned'}`);
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
