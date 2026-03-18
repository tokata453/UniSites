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
const isOpportunityManager = (req, res, next) => {
  if (!req.user) return forbidden(res, 'Authentication required');
  const role = req.user.Role?.name;
  if (!['owner', 'organization', 'admin'].includes(role)) {
    return forbidden(res, 'Requires role: owner or organization or admin');
  }
  if (role === 'organization' && !req.user.is_approved) {
    return forbidden(res, 'Organization account is pending admin approval');
  }
  next();
};

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

    if (req.user.Role?.name === 'owner') {
      const ownedUniversity = await db.University.findOne({
        where: { owner_id: req.user.id },
        attributes: ['id'],
      });

      if (opp.posted_by === req.user.id || (ownedUniversity?.id && opp.university_id === ownedUniversity.id)) {
        req.opportunity = opp;
        return next();
      }
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
