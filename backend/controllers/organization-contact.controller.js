'use strict';
const db = require('../models');
const { success, error } = require('../utils/response.utils');

const get = async (req, res) => {
  try {
    const contact = await db.OrganizationContact.findOne({ where: { organization_id: req.params.organizationId } });
    return success(res, { contact });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const upsert = async (req, res) => {
  try {
    const [contact, isNew] = await db.OrganizationContact.findOrCreate({
      where: { organization_id: req.params.organizationId },
      defaults: { ...req.body, organization_id: req.params.organizationId },
    });
    if (!isNew) await contact.update(req.body);
    return success(res, { contact }, isNew ? 'Contact created' : 'Contact updated');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

module.exports = { get, upsert };
