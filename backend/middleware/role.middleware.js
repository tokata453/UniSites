'use strict';
const { forbidden, notFound } = require('../utils/response.utils');
const db = require('../models');

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return forbidden(res, 'Authentication required');
  if (!roles.includes(req.user.Role?.name)) {
    return forbidden(res, `Requires role: ${roles.join(' or ')}`);
  }
  next();
};

const isAdmin  = requireRole('admin');
const isOwner  = requireRole('owner', 'admin');
const isOpportunityManager = requireRole('owner', 'organization', 'admin');

const isUniversityOwner = (paramKey = 'universityId') => async (req, res, next) => {
  try {
    const university = await db.University.findByPk(req.params[paramKey]);
    if (!university) return notFound(res, 'University not found');

    if (req.user.Role?.name === 'admin') {
      req.university = university;
      return next();
    }

    if (university.owner_id !== req.user.id) {
      return forbidden(res, 'You do not own this university');
    }

    req.university = university;
    next();
  } catch (err) {
    return forbidden(res, err.message);
  }
};

const isOpportunityOwner = () => async (req, res, next) => {
  try {
    const opp = await db.Opportunity.findByPk(req.params.id);
    if (!opp) return notFound(res, 'Opportunity not found');

    if (req.user.Role?.name === 'admin') {
      req.opportunity = opp;
      return next();
    }

    if (opp.posted_by !== req.user.id) {
      return forbidden(res, 'You do not own this opportunity');
    }

    req.opportunity = opp;
    next();
  } catch (err) {
    return forbidden(res, err.message);
  }
};

module.exports = { requireRole, isAdmin, isOwner, isOpportunityManager, isUniversityOwner, isOpportunityOwner };
