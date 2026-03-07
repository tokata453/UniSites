'use strict';
const db = require('../models');
const { success, error } = require('../utils/response.utils');

const getAnalytics = async (req, res) => {
  try {
    const university = await db.University.findOne({
      where: { id: req.params.universityId, owner_id: req.user.id },
    });
    if (!university && req.user.Role?.name !== 'admin') return error(res, 'Forbidden', 403);

    const uni = university || await db.University.findByPk(req.params.universityId);
    const [analytics] = await db.UniversityAnalytics.findOrCreate({
      where: { university_id: req.params.universityId },
      defaults: { university_id: req.params.universityId },
    });

    return success(res, {
      analytics,
      university: {
        id: uni.id, name: uni.name,
        views_count: uni.views_count, rating_avg: uni.rating_avg,
        review_count: uni.review_count, is_published: uni.is_published,
      },
    });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const trackClick = async (req, res) => {
  try {
    const { type, university_id } = req.body;
    const allowed = ['website_clicks', 'application_clicks', 'contact_clicks', 'opportunity_views', 'gallery_views'];
    if (!allowed.includes(type)) return error(res, 'Invalid click type');
    await db.UniversityAnalytics.increment(type, { where: { university_id } });
    return success(res, {});
  } catch (err) {
    return error(res, err.message, 500);
  }
};

module.exports = { getAnalytics, trackClick };
