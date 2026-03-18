'use strict';
const { Op } = require('sequelize');
const db = require('../models');
const { success, created, error } = require('../utils/response.utils');

const VALID_TYPES = new Set(['news', 'opportunity']);

const ensureValidType = (itemType) => {
  if (!VALID_TYPES.has(itemType)) {
    const err = new Error('Unsupported feed item type');
    err.statusCode = 400;
    throw err;
  }
};

const getItemModel = (itemType) => (itemType === 'news' ? db.UniversityNews : db.Opportunity);

const ensureItemExists = async (itemType, itemId) => {
  ensureValidType(itemType);
  const Model = getItemModel(itemType);
  const item = await Model.findByPk(itemId);
  if (!item) {
    const err = new Error('Feed item not found');
    err.statusCode = 404;
    throw err;
  }
  return item;
};

const attachInteractionMeta = async (items, userId = null) => {
  if (!items.length) return items;

  const groupedIds = items.reduce((acc, item) => {
    acc[item.kind] ||= [];
    acc[item.kind].push(item.id);
    return acc;
  }, {});

  const likeWhere = [];
  if (groupedIds.news?.length) likeWhere.push({ item_type: 'news', item_id: { [Op.in]: groupedIds.news } });
  if (groupedIds.opportunity?.length) likeWhere.push({ item_type: 'opportunity', item_id: { [Op.in]: groupedIds.opportunity } });

  const [likes, comments, myLikes] = await Promise.all([
    likeWhere.length ? db.FeedLike.findAll({ where: { [Op.or]: likeWhere }, attributes: ['item_type', 'item_id', 'user_id'] }) : [],
    likeWhere.length ? db.FeedComment.findAll({ where: { [Op.or]: likeWhere }, attributes: ['item_type', 'item_id'] }) : [],
    userId && likeWhere.length
      ? db.FeedLike.findAll({ where: { user_id: userId, [Op.or]: likeWhere }, attributes: ['item_type', 'item_id'] })
      : [],
  ]);

  const countMap = (records) =>
    records.reduce((acc, record) => {
      const key = `${record.item_type}:${record.item_id}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

  const likeCounts = countMap(likes);
  const commentCounts = countMap(comments);
  const myLikeSet = new Set(myLikes.map((record) => `${record.item_type}:${record.item_id}`));

  return items.map((item) => {
    const key = `${item.kind}:${item.id}`;
    return {
      ...item,
      like_count: likeCounts[key] || 0,
      comment_count: commentCounts[key] || 0,
      liked_by_me: myLikeSet.has(key),
    };
  });
};

const list = async (req, res) => {
  try {
    const { limit = 24, kind = 'all', search = '' } = req.query;
    const safeLimit = Math.min(Math.max(Number(limit) || 24, 1), 60);
    const term = String(search || '').trim();

    const newsWhere = { is_published: true };
    const opportunityWhere = { is_published: true };

    if (term) {
      newsWhere[Op.or] = [
        { title: { [Op.iLike]: `%${term}%` } },
        { excerpt: { [Op.iLike]: `%${term}%` } },
        { content: { [Op.iLike]: `%${term}%` } },
      ];
      opportunityWhere[Op.or] = [
        { title: { [Op.iLike]: `%${term}%` } },
        { description: { [Op.iLike]: `%${term}%` } },
        { country: { [Op.iLike]: `%${term}%` } },
      ];
    }

    const [newsItems, opportunityItems] = await Promise.all([
      kind === 'opportunity'
        ? []
        : db.UniversityNews.findAll({
            where: newsWhere,
            limit: safeLimit,
            order: [['is_pinned', 'DESC'], ['published_at', 'DESC'], ['created_at', 'DESC']],
            include: [
              { model: db.University, as: 'University', attributes: ['id', 'name', 'slug', 'logo_url', 'province'] },
              { model: db.User, as: 'Author', attributes: ['id', 'name', 'avatar_url'] },
            ],
          }),
      kind === 'news'
        ? []
        : db.Opportunity.findAll({
            where: opportunityWhere,
            limit: safeLimit,
            order: [['is_featured', 'DESC'], ['created_at', 'DESC']],
            include: [
              { model: db.OpportunityTag, as: 'Tags' },
              { model: db.University, as: 'University', required: false, attributes: ['id', 'name', 'slug', 'logo_url', 'province'] },
              { model: db.User, as: 'PostedBy', required: false, attributes: ['id', 'name', 'avatar_url'] },
            ],
          }),
    ]);

    const rawItems = [
      ...newsItems.map((item) => ({
        id: item.id,
        kind: 'news',
        created_at: item.published_at || item.created_at,
        News: item,
      })),
      ...opportunityItems.map((item) => ({
        id: item.id,
        kind: 'opportunity',
        created_at: item.created_at,
        Opportunity: item,
      })),
    ]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, safeLimit);

    const items = await attachInteractionMeta(rawItems, req.user?.id || null);
    return success(res, { items });
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
};

const getComments = async (req, res) => {
  try {
    const { itemType, itemId } = req.params;
    await ensureItemExists(itemType, itemId);

    const comments = await db.FeedComment.findAll({
      where: { item_type: itemType, item_id: itemId },
      include: [{ model: db.User, as: 'Author', attributes: ['id', 'name', 'avatar_url'] }],
      order: [['created_at', 'DESC']],
      limit: 50,
    });

    return success(res, { comments });
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
};

const addComment = async (req, res) => {
  try {
    const { itemType, itemId } = req.params;
    const content = String(req.body.content || '').trim();
    if (!content) return error(res, 'Comment content is required', 400);

    await ensureItemExists(itemType, itemId);

    const comment = await db.FeedComment.create({
      item_type: itemType,
      item_id: itemId,
      user_id: req.user.id,
      content,
    });

    const hydrated = await db.FeedComment.findByPk(comment.id, {
      include: [{ model: db.User, as: 'Author', attributes: ['id', 'name', 'avatar_url'] }],
    });

    return created(res, { comment: hydrated }, 'Comment added');
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
};

const toggleLike = async (req, res) => {
  try {
    const { itemType, itemId } = req.params;
    await ensureItemExists(itemType, itemId);

    const existing = await db.FeedLike.findOne({
      where: { item_type: itemType, item_id: itemId, user_id: req.user.id },
    });

    if (existing) {
      await existing.destroy();
      const like_count = await db.FeedLike.count({ where: { item_type: itemType, item_id: itemId } });
      return success(res, { liked: false, like_count }, 'Like removed');
    }

    await db.FeedLike.create({
      item_type: itemType,
      item_id: itemId,
      user_id: req.user.id,
    });
    const like_count = await db.FeedLike.count({ where: { item_type: itemType, item_id: itemId } });
    return success(res, { liked: true, like_count }, 'Post liked');
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
};

module.exports = { list, getComments, addComment, toggleLike };
