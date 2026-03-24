'use strict';
const { forbidden, notFound } = require('../utils/response.utils');
const { canManageOpportunity } = require('../utils/policy.utils');
const { isOrganizationApproved } = require('../utils/status.utils');
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
  if (role !== 'organization') return next();

  db.Organization.findOne({
    where: { owner_id: req.user.id },
    attributes: ['id', 'is_approved'],
  })
    .then((organization) => {
      if (!isOrganizationApproved(organization)) {
        return forbidden(res, 'Organization is pending admin approval');
      }
      req.organization = req.organization || organization;
      return next();
    })
    .catch((err) => forbidden(res, err.message));
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

const isOrganizationOwner = (paramKey = 'organizationId') => async (req, res, next) => {
  try {
    const organization = await db.Organization.findByPk(req.params[paramKey]);
    if (!organization) return notFound(res, 'Organization not found');

    if (req.user.Role?.name === 'admin') {
      req.organization = organization;
      return next();
    }

    if (organization.owner_id !== req.user.id) {
      return forbidden(res, 'You do not own this organization');
    }

    req.organization = organization;
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

      if (canManageOpportunity({
        role: 'owner',
        userId: req.user.id,
        opportunity: opp,
        ownedUniversityId: ownedUniversity?.id || null,
      })) {
        req.opportunity = opp;
        return next();
      }
    }

    if (req.user.Role?.name === 'organization') {
      const ownedOrganization = await db.Organization.findOne({
        where: { owner_id: req.user.id },
        attributes: ['id'],
      });

      if (!canManageOpportunity({
        role: 'organization',
        userId: req.user.id,
        opportunity: opp,
        ownedOrganizationId: ownedOrganization?.id || null,
      })) {
        return forbidden(res, 'You do not own this opportunity');
      }

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

module.exports = { requireRole, isAdmin, isOwner, isOpportunityManager, isUniversityOwner, isOrganizationOwner, isOpportunityOwner };
