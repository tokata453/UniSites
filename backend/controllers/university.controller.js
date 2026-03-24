'use strict';
const { Op } = require('sequelize');
const db = require('../models');
const { success, created, error, notFound } = require('../utils/response.utils');
const { getPagination, paginateResponse } = require('../utils/pagination.utils');
const { uniqueSlug } = require('../utils/slug.utils');

const VIEW_TRACK_TTL_MS = 5 * 60 * 1000;
const recentUniversityViews = new Map();

const getUniversityViewFingerprint = (req, universityId) => {
  const userId = req.user?.id || 'guest';
  const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown-ip';
  const userAgent = req.get('user-agent') || 'unknown-agent';
  return `${universityId}:${userId}:${ip}:${userAgent}`;
};

const shouldTrackUniversityView = (req, universityId) => {
  const fingerprint = getUniversityViewFingerprint(req, universityId);
  const now = Date.now();
  const expiresAt = recentUniversityViews.get(fingerprint) || 0;

  if (expiresAt > now) return false;

  recentUniversityViews.set(fingerprint, now + VIEW_TRACK_TTL_MS);

  // Light cleanup to avoid the in-memory map growing forever.
  if (recentUniversityViews.size > 5000) {
    for (const [key, value] of recentUniversityViews.entries()) {
      if (value <= now) recentUniversityViews.delete(key);
    }
  }

  return true;
};

const list = async (req, res) => {
  try {
    const { page = 1, limit = 12, search, province, type, tuition_min, tuition_max, scholarship, dormitory, sort = 'rating_avg', order = 'DESC' } = req.query;

    const where = { is_published: true };
    if (search) {
      where[Op.or] = [
        { name:          { [Op.iLike]: `%${search}%` } },
        { shortcut_name: { [Op.iLike]: `%${search}%` } },
        { province:      { [Op.iLike]: `%${search}%` } },
      ];
    }
    if (province)              where.province               = province;
    if (type)                  where.type                   = type;
    if (tuition_min)           where.tuition_min            = { [Op.gte]: Number(tuition_min) };
    if (tuition_max)           where.tuition_max            = { [Op.lte]: Number(tuition_max) };
    if (scholarship === 'true') where.scholarship_available = true;
    if (dormitory   === 'true') where.dormitory_available   = true;

    const allowed = ['rating_avg', 'name', 'founded_year', 'tuition_min', 'review_count', 'views_count'];
    const safeSort  = allowed.includes(sort) ? sort : 'rating_avg';
    const safeOrder = order === 'ASC' ? 'ASC' : 'DESC';

    const { count, rows } = await db.University.findAndCountAll({
      where,
      ...getPagination({ page, limit }),
      order: [[safeSort, safeOrder]],
      attributes: ['id', 'slug', 'name', 'shortcut_name', 'name_km', 'logo_url', 'cover_url', 'type', 'province', 'tuition_min', 'tuition_max', 'rating_avg', 'review_count', 'student_count', 'is_verified', 'is_featured', 'scholarship_available', 'dormitory_available', 'founded_year'],
    });
    return success(res, paginateResponse(rows, count, page, limit));
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const getFeatured = async (req, res) => {
  try {
    const universities = await db.University.findAll({
      where: { is_featured: true, is_published: true },
      limit: 6,
      order: [['rating_avg', 'DESC']],
      attributes: ['id', 'slug', 'name', 'shortcut_name', 'logo_url', 'cover_url', 'type', 'province', 'rating_avg', 'review_count', 'is_verified', 'scholarship_available'],
    });
    return success(res, { universities });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const getMine = async (req, res) => {
  try {
    const universities = await db.University.findAll({
      where: { owner_id: req.user.id },
      order: [['created_at', 'DESC']],
    });
    return success(res, { universities });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const getBySlug = async (req, res) => {
  try {
    const university = await db.University.findOne({
      where: { slug: req.params.slug, is_published: true },
      include: [
        { model: db.User,                 as: 'Owner',      attributes: ['id', 'name', 'avatar_url'] },
      ],
    });
    if (!university) return notFound(res, 'University not found');

    const [
      gallery,
      faculties,
      admissionRequirements,
      campusFacilities,
      news,
      events,
      testimonials,
      faqs,
      contact,
      sources,
      reviews,
    ] = await Promise.all([
      db.UniversityGallery.findAll({
        where: { university_id: university.id },
        order: [['sort_order', 'ASC'], ['created_at', 'ASC']],
      }),
      db.UniversityFaculty.findAll({
        where: { university_id: university.id },
        order: [['sort_order', 'ASC'], ['name', 'ASC']],
        include: [{
          model: db.UniversityProgram,
          as: 'Programs',
          required: false,
          order: [['name', 'ASC']],
        }],
      }),
      db.UniversityAdmissionRequirement.findAll({
        where: { university_id: university.id },
        order: [['created_at', 'ASC']],
      }),
      db.UniversityCampusFacility.findAll({
        where: { university_id: university.id },
        order: [['category', 'ASC'], ['created_at', 'ASC']],
      }),
      db.UniversityNews.findAll({
        where: { university_id: university.id, is_published: true },
        limit: 6,
        order: [['published_at', 'DESC'], ['created_at', 'DESC']],
      }),
      db.UniversityEvent.findAll({
        where: { university_id: university.id, is_published: true },
        limit: 6,
        order: [['event_date', 'ASC']],
      }),
      db.UniversityTestimonial.findAll({
        where: { university_id: university.id, is_approved: true },
        limit: 6,
        order: [['created_at', 'DESC']],
      }),
      db.UniversityFAQ.findAll({
        where: { university_id: university.id, is_published: true },
        order: [['created_at', 'ASC']],
      }),
      db.UniversityContact.findOne({
        where: { university_id: university.id },
      }),
      db.UniversitySource.findAll({
        where: { university_id: university.id },
        attributes: ['id', 'source_name', 'source_type', 'source_url', 'confidence_score', 'import_status', 'last_verified_at', 'created_at', 'updated_at'],
        order: [['created_at', 'DESC']],
      }),
      db.UniversityReview.findAll({
        where: { university_id: university.id, is_approved: true },
        limit: 10,
        order: [['created_at', 'DESC']],
        include: [{ model: db.User, as: 'Author', attributes: ['id', 'name', 'avatar_url'] }],
      }),
    ]);

    const universityJson = university.toJSON();
    universityJson.Gallery = gallery;
    universityJson.Faculties = faculties;
    universityJson.AdmissionRequirements = admissionRequirements;
    universityJson.CampusFacilities = campusFacilities;
    universityJson.News = news;
    universityJson.Events = events;
    universityJson.Testimonials = testimonials;
    universityJson.FAQs = faqs;
    universityJson.Contact = contact;
    universityJson.Sources = sources;
    universityJson.Reviews = reviews;

    success(res, { university: universityJson });

    if (!shouldTrackUniversityView(req, university.id)) return;

    Promise.resolve().then(async () => {
      await university.increment('views_count');

      const [analytics] = await db.UniversityAnalytics.findOrCreate({
        where: { university_id: university.id },
        defaults: { university_id: university.id },
      });
      await analytics.increment(['total_views', 'monthly_views', 'weekly_views', 'daily_views']);
    }).catch((trackingErr) => {
      console.error('[University][getBySlug] Failed to update analytics:', trackingErr.message);
    });

    return;
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const create = async (req, res) => {
  try {
    const university = await db.University.create({
      ...req.body,
      slug:         uniqueSlug(req.body.name),
      owner_id:     req.user.id,
      is_published: false,
    });
    await db.UniversityAnalytics.create({ university_id: university.id });
    return created(res, { university }, 'University created. Pending review.');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const update = async (req, res) => {
  try {
    await req.university.update(req.body);
    return success(res, { university: req.university }, 'University updated');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const remove = async (req, res) => {
  try {
    const university = await db.University.findByPk(req.params.id);
    if (!university) return notFound(res);
    await university.destroy();
    return success(res, {}, 'University deleted');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

module.exports = { list, getFeatured, getMine, getBySlug, create, update, remove };
