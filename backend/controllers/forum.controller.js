'use strict';
const { Op } = require('sequelize');
const db = require('../models');
const { success, created, error, notFound } = require('../utils/response.utils');
const { getPagination, paginateResponse } = require('../utils/pagination.utils');
const { uniqueSlug } = require('../utils/slug.utils');
const { getIO } = require('../config/socket');

// ── Categories ────────────────────────────────────────────────────────────
const getCategories = async (req, res) => {
  try {
    const categories = await db.ForumCategory.findAll({
      where: { is_active: true },
      order: [['sort_order', 'ASC']],
    });
    return success(res, { categories });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// ── Threads ───────────────────────────────────────────────────────────────
const getThreads = async (req, res) => {
  try {
    const { page = 1, limit = 20, category_id, search } = req.query;
    const where = {};
    if (category_id) where.category_id = category_id;
    if (search)      where.title       = { [Op.iLike]: `%${search}%` };

    const { count, rows } = await db.ForumThread.findAndCountAll({
      where,
      ...getPagination({ page, limit }),
      order: [['is_pinned', 'DESC'], ['last_reply_at', 'DESC'], ['created_at', 'DESC']],
      include: [
        { model: db.User,          as: 'Author',   attributes: ['id', 'name', 'avatar_url'] },
        { model: db.ForumCategory, as: 'Category', attributes: ['id', 'name', 'slug', 'color', 'icon'] },
      ],
    });
    return success(res, paginateResponse(rows, count, page, limit));
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const getThread = async (req, res) => {
  try {
    const thread = await db.ForumThread.findOne({
      where: { slug: req.params.slug },
      include: [
        {
          model: db.User, as: 'Author', attributes: ['id', 'name', 'avatar_url'],
          include: [{ model: db.Role, as: 'Role', attributes: ['name'] }],
        },
        { model: db.ForumCategory, as: 'Category' },
        {
          model: db.ForumReply, as: 'Replies',
          where: { is_deleted: false }, required: false,
          order: [['created_at', 'ASC']],
          include: [
            {
              model: db.User, as: 'Author', attributes: ['id', 'name', 'avatar_url'],
              include: [{ model: db.Role, as: 'Role', attributes: ['name'] }],
            },
            { model: db.ForumLike, as: 'Likes', attributes: ['user_id'] },
          ],
        },
      ],
    });
    if (!thread) return notFound(res, 'Thread not found');
    await thread.increment('views');
    return success(res, { thread });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const createThread = async (req, res) => {
  try {
    const isOfficial = ['owner', 'admin'].includes(req.user.Role?.name);
    const thread = await db.ForumThread.create({
      ...req.body,
      slug:          uniqueSlug(req.body.title),
      author_id:     req.user.id,
      is_official:   isOfficial,
      last_reply_at: new Date(),
    });
    await db.ForumCategory.increment('thread_count', { where: { id: req.body.category_id } });
    return created(res, { thread });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const updateThread = async (req, res) => {
  try {
    const thread = await db.ForumThread.findByPk(req.params.id);
    if (!thread) return notFound(res);
    if (thread.author_id !== req.user.id && req.user.Role?.name !== 'admin') return error(res, 'Forbidden', 403);
    await thread.update(req.body);
    return success(res, { thread });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const deleteThread = async (req, res) => {
  try {
    const thread = await db.ForumThread.findByPk(req.params.id);
    if (!thread) return notFound(res);
    if (thread.author_id !== req.user.id && req.user.Role?.name !== 'admin') return error(res, 'Forbidden', 403);
    await thread.destroy();
    await db.ForumCategory.decrement('thread_count', { where: { id: thread.category_id } });
    return success(res, {}, 'Thread deleted');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// ── Replies ───────────────────────────────────────────────────────────────
const createReply = async (req, res) => {
  try {
    const thread = await db.ForumThread.findByPk(req.params.threadId);
    if (!thread) return notFound(res, 'Thread not found');
    if (thread.is_locked) return error(res, 'This thread is locked', 403);

    const isOfficial = ['owner', 'admin'].includes(req.user.Role?.name);
    const reply = await db.ForumReply.create({
      ...req.body,
      thread_id:   thread.id,
      author_id:   req.user.id,
      is_official: isOfficial,
    });

    await thread.increment('reply_count');
    await thread.update({ last_reply_at: new Date() });

    const hydratedReply = await db.ForumReply.findByPk(reply.id, {
      include: [{
        model: db.User, as: 'Author', attributes: ['id', 'name', 'avatar_url'],
        include: [{ model: db.Role, as: 'Role', attributes: ['name'] }],
      }],
    });

    try {
      getIO().to(`thread_${thread.id}`).emit('reply_received', { reply: hydratedReply, threadId: thread.id });
    } catch { /* socket not critical */ }

    return created(res, { reply: hydratedReply });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const updateReply = async (req, res) => {
  try {
    const reply = await db.ForumReply.findByPk(req.params.id);
    if (!reply) return notFound(res);
    if (reply.author_id !== req.user.id && req.user.Role?.name !== 'admin') return error(res, 'Forbidden', 403);
    await reply.update({ content: req.body.content });
    return success(res, { reply });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const deleteReply = async (req, res) => {
  try {
    const reply = await db.ForumReply.findByPk(req.params.id);
    if (!reply) return notFound(res);
    if (reply.author_id !== req.user.id && req.user.Role?.name !== 'admin') return error(res, 'Forbidden', 403);
    await reply.update({ is_deleted: true, content: '[deleted]' });
    return success(res, {}, 'Reply deleted');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// ── Likes ─────────────────────────────────────────────────────────────────
const toggleLike = async (req, res) => {
  try {
    const reply = await db.ForumReply.findByPk(req.params.replyId);
    if (!reply) return notFound(res);

    const existing = await db.ForumLike.findOne({ where: { reply_id: reply.id, user_id: req.user.id } });
    if (existing) {
      await existing.destroy();
      await reply.decrement('like_count');
      return success(res, { liked: false, like_count: reply.like_count - 1 });
    }
    await db.ForumLike.create({ reply_id: reply.id, user_id: req.user.id });
    await reply.increment('like_count');
    return success(res, { liked: true, like_count: reply.like_count + 1 });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const acceptReply = async (req, res) => {
  try {
    const reply  = await db.ForumReply.findByPk(req.params.replyId);
    if (!reply) return notFound(res);
    const thread = await db.ForumThread.findByPk(reply.thread_id);
    if (thread.author_id !== req.user.id && req.user.Role?.name !== 'admin') return error(res, 'Only the thread author can accept a reply', 403);
    await db.ForumReply.update({ is_accepted: false }, { where: { thread_id: thread.id } });
    await reply.update({ is_accepted: true });
    return success(res, { reply }, 'Reply marked as accepted answer');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

module.exports = { getCategories, getThreads, getThread, createThread, updateThread, deleteThread, createReply, updateReply, deleteReply, toggleLike, acceptReply };
