'use strict';
const db = require('../models');
const { success, created, error, notFound } = require('../utils/response.utils');

const list = async (req, res) => {
  try {
    const programs = await db.Program.findAll({
      where: { university_id: req.params.universityId },
      include: [
        { model: db.Faculty, as: 'Faculty', required: false },
        { model: db.Major,   as: 'Major',   required: false },
      ],
      order: [['name', 'ASC']],
    });
    return success(res, { programs });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const create = async (req, res) => {
  try {
    const program = await db.Program.create({ ...req.body, university_id: req.params.universityId });
    return created(res, { program });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const update = async (req, res) => {
  try {
    const program = await db.Program.findByPk(req.params.id);
    if (!program) return notFound(res);
    await program.update(req.body);
    return success(res, { program });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const remove = async (req, res) => {
  try {
    const program = await db.Program.findByPk(req.params.id);
    if (!program) return notFound(res);
    await program.destroy();
    return success(res, {}, 'Program deleted');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

module.exports = { list, create, update, remove };
