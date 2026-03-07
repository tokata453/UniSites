'use strict';
const db = require('../models');
const { success, error } = require('../utils/response.utils');

const get = async (req, res) => {
  try {
    const contact = await db.UniversityContact.findOne({ where: { university_id: req.params.universityId } });
    return success(res, { contact });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const upsert = async (req, res) => {
  try {
    const [contact, isNew] = await db.UniversityContact.findOrCreate({
      where: { university_id: req.params.universityId },
      defaults: { ...req.body, university_id: req.params.universityId },
    });
    if (!isNew) await contact.update(req.body);
    return success(res, { contact }, isNew ? 'Contact created' : 'Contact updated');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

module.exports = { get, upsert };
