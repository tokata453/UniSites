'use strict';
const db = require('../models');
const { success, created, error, notFound } = require('../utils/response.utils');

const list = async (req, res) => {
  try {
    const faculties = await db.Faculty.findAll({
      where: { university_id: req.params.universityId },
      include: [{ model: db.Program, as: 'Programs' }],
      order: [['sort_order', 'ASC']],
    });
    return success(res, { faculties });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const create = async (req, res) => {
  try {
    const faculty = await db.Faculty.create({ ...req.body, university_id: req.params.universityId });
    return created(res, { faculty });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const update = async (req, res) => {
  try {
    const faculty = await db.Faculty.findByPk(req.params.id);
    if (!faculty) return notFound(res);
    await faculty.update(req.body);
    return success(res, { faculty });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const remove = async (req, res) => {
  try {
    const faculty = await db.Faculty.findByPk(req.params.id);
    if (!faculty) return notFound(res);
    await faculty.destroy();
    return success(res, {}, 'Faculty deleted');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

module.exports = { list, create, update, remove };
