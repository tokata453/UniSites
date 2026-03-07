'use strict';
const { Op } = require('sequelize');
const db = require('../models');
const { success, created, error, notFound } = require('../utils/response.utils');
const { getPagination, paginateResponse } = require('../utils/pagination.utils');
const { uniqueSlug } = require('../utils/slug.utils');

const list = async (req, res) => {
  try {
    const { page = 1, limit = 12, search, field_of_study, is_stem, job_demand } = req.query;
    const where = {};
    if (search)         where.name           = { [Op.iLike]: `%${search}%` };
    if (field_of_study) where.field_of_study = field_of_study;
    if (is_stem === 'true') where.is_stem    = true;
    if (job_demand)     where.job_demand     = job_demand;

    const { count, rows } = await db.Major.findAndCountAll({
      where,
      ...getPagination({ page, limit }),
      order: [['name', 'ASC']],
    });
    return success(res, paginateResponse(rows, count, page, limit));
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const getFeatured = async (req, res) => {
  try {
    const majors = await db.Major.findAll({ where: { is_featured: true }, limit: 8, order: [['name', 'ASC']] });
    return success(res, { majors });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const getBySlug = async (req, res) => {
  try {
    const major = await db.Major.findOne({ where: { slug: req.params.slug } });
    if (!major) return notFound(res, 'Major not found');

    const programs = await db.Program.findAll({
      where: { major_id: major.id, is_available: true },
      include: [{ model: db.University, required: false, attributes: ['id', 'name', 'slug', 'logo_url', 'province', 'rating_avg', 'is_verified'] }],
      limit: 20,
    });

    return success(res, { major, programs });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const getQuizQuestions = async (req, res) => {
  try {
    const questions = await db.MajorQuizQuestion.findAll({
      where: { is_active: true },
      order: [['sort_order', 'ASC']],
    });
    return success(res, { questions });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const getRecommendations = async (req, res) => {
  try {
    const { answers } = req.body;
    if (!answers || typeof answers !== 'object') return error(res, 'answers object is required');

    const questions = await db.MajorQuizQuestion.findAll({ where: { is_active: true } });
    const scores    = {};

    questions.forEach(q => {
      const chosen = answers[q.id];
      if (!chosen) return;
      const weights = q.major_weights?.[chosen] || {};
      Object.entries(weights).forEach(([slug, weight]) => {
        scores[slug] = (scores[slug] || 0) + weight;
      });
    });

    const topSlugs = Object.entries(scores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([slug]) => slug);

    if (!topSlugs.length) {
      const majors = await db.Major.findAll({ where: { is_featured: true }, limit: 5 });
      return success(res, { recommendations: majors });
    }

    const majors  = await db.Major.findAll({ where: { slug: topSlugs } });
    const ordered = topSlugs.map(slug => majors.find(m => m.slug === slug)).filter(Boolean);
    return success(res, { recommendations: ordered });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const create = async (req, res) => {
  try {
    const major = await db.Major.create({ ...req.body, slug: uniqueSlug(req.body.name) });
    return created(res, { major });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const update = async (req, res) => {
  try {
    const major = await db.Major.findByPk(req.params.id);
    if (!major) return notFound(res);
    await major.update(req.body);
    return success(res, { major });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

module.exports = { list, getFeatured, getBySlug, getQuizQuestions, getRecommendations, create, update };
