'use strict';

const { uniqueSlug } = require('../utils/slug.utils');
const { success, created, error, notFound } = require('../utils/response.utils');
const db = require('../models');

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

const upsertMine = async (req, res) => {
  try {
    const payload = {
      name: req.body.name,
      description: req.body.description ?? req.body.bio,
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

module.exports = { getMine, upsertMine };
