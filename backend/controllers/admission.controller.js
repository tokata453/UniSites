'use strict';
const db = require('../models');
const { success, created, error, notFound } = require('../utils/response.utils');

const list = async (req, res) => {
  try {
    const admissions = await db.AdmissionRequirement.findAll({
      where: { university_id: req.params.universityId },
      order: [['sort_order', 'ASC']],
    });
    return success(res, { admissions });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const create = async (req, res) => {
  try {
    const admission = await db.AdmissionRequirement.create({ ...req.body, university_id: req.params.universityId });
    return created(res, { admission });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const update = async (req, res) => {
  try {
    const admission = await db.AdmissionRequirement.findByPk(req.params.id);
    if (!admission) return notFound(res);
    await admission.update(req.body);
    return success(res, { admission });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const remove = async (req, res) => {
  try {
    const admission = await db.AdmissionRequirement.findByPk(req.params.id);
    if (!admission) return notFound(res);
    await admission.destroy();
    return success(res, {}, 'Admission requirement deleted');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

module.exports = { list, create, update, remove };
