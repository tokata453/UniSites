'use strict';
const { Op } = require('sequelize');
const db = require('../models');
const { success, created, error } = require('../utils/response.utils');

const VALID_TYPES = new Set(['news', 'opportunity', 'event']);

const ensureValidType = (itemType) => {
  if (!VALID_TYPES.has(itemType)) {
    const err = new Error('Unsupported feed item type');
    err.statusCode = 400;
    throw err;
  }
};

const ensureItemExists = async (itemType, itemId) => {
  ensureValidType(itemType);

  let item = null;
  if (itemType === 'news') {
    item = await db.UniversityNews.findByPk(itemId) || await db.OrganizationNews.findByPk(itemId);
  } else if (itemType === 'event') {
    item = await db.OrganizationEvent.findByPk(itemId);
  } else {
    item = await db.Opportunity.findByPk(itemId);
  }

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
  if (groupedIds.event?.length) likeWhere.push({ item_type: 'event', item_id: { [Op.in]: groupedIds.event } });

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

const getItemTimestamp = (item) => new Date(
  item.kind === 'news'
    ? (item.News?.published_at || item.News?.created_at)
    : item.kind === 'event'
      ? (item.Event?.event_date || item.Event?.created_at)
      : item.Opportunity?.created_at
);

const getRankingScore = (item) => {
  const createdAt = getItemTimestamp(item);
  const ageHours = Math.max((Date.now() - createdAt.getTime()) / (1000 * 60 * 60), 1);
  const views = item.kind === 'news'
    ? Number(item.News?.views_count || 0)
    : item.kind === 'event'
      ? 0
      : Number(item.Opportunity?.views_count || 0);
  const popularityScore =
    (Number(item.comment_count || 0) * 4) +
    (Number(item.like_count || 0) * 2) +
    Math.min(views / 20, 12);
  const editorialBoost =
    (item.kind === 'news' && item.News?.is_pinned ? 8 : 0) +
    (item.kind === 'event' && item.Event?.is_featured ? 8 : 0) +
    (item.kind === 'opportunity' && item.Opportunity?.is_featured ? 8 : 0);
  const freshnessScore = 36 / Math.pow(ageHours + 2, 0.55);

  return freshnessScore + popularityScore + editorialBoost;
};

const list = async (req, res) => {
  try {
    const { page = 1, limit = 24, kind = 'all', search = '' } = req.query;
    const safeLimit = Math.min(Math.max(Number(limit) || 24, 1), 60);
    const safePage = Math.max(Number(page) || 1, 1);
    const offset = (safePage - 1) * safeLimit;
    const term = String(search || '').trim();

    const newsWhere = { is_published: true };
    const eventWhere = { is_published: true };
    const opportunityWhere = { is_published: true };
    const kindFilter = String(kind || 'all');

    const wantsAnyNews = ['all', 'news', 'university-news', 'organization-news'].includes(kindFilter);
    const wantsUniversityNews = ['all', 'news', 'university-news'].includes(kindFilter);
    const wantsOrganizationNews = ['all', 'news', 'organization-news'].includes(kindFilter);
    const wantsEvents = ['all', 'event', 'organization-event'].includes(kindFilter);
    const wantsAnyOpportunities = ['all', 'opportunity', 'university-opportunity', 'organization-opportunity'].includes(kindFilter);
    const wantsUniversityOpportunities = ['all', 'opportunity', 'university-opportunity'].includes(kindFilter);
    const wantsOrganizationOpportunities = ['all', 'opportunity', 'organization-opportunity'].includes(kindFilter);

    if (term) {
      newsWhere[Op.or] = [
        { title: { [Op.iLike]: `%${term}%` } },
        { excerpt: { [Op.iLike]: `%${term}%` } },
        { content: { [Op.iLike]: `%${term}%` } },
      ];
      eventWhere[Op.or] = [
        { title: { [Op.iLike]: `%${term}%` } },
        { description: { [Op.iLike]: `%${term}%` } },
        { location: { [Op.iLike]: `%${term}%` } },
      ];
      opportunityWhere[Op.or] = [
        { title: { [Op.iLike]: `%${term}%` } },
        { description: { [Op.iLike]: `%${term}%` } },
        { country: { [Op.iLike]: `%${term}%` } },
      ];
    }

    const fetchSize = safePage * safeLimit;

    const [newsResult, eventResult, opportunityResult] = await Promise.all([
      !wantsAnyNews
        ? { count: 0, rows: [] }
        : Promise.all([
            wantsUniversityNews
              ? db.UniversityNews.findAll({
                  where: newsWhere,
                  limit: fetchSize,
                  order: [['is_pinned', 'DESC'], ['published_at', 'DESC'], ['created_at', 'DESC']],
                  include: [
                    { model: db.University, as: 'University', attributes: ['id', 'name', 'slug', 'logo_url', 'province'] },
                    { model: db.User, as: 'Author', attributes: ['id', 'name', 'avatar_url'] },
                  ],
                })
              : [],
            wantsOrganizationNews
              ? db.OrganizationNews.findAll({
                  where: newsWhere,
                  limit: fetchSize,
                  order: [['is_pinned', 'DESC'], ['published_at', 'DESC'], ['created_at', 'DESC']],
                  include: [
                    { model: db.Organization, as: 'Organization', attributes: ['id', 'name', 'slug', 'logo_url', 'location'] },
                    { model: db.User, as: 'Author', attributes: ['id', 'name', 'avatar_url'] },
                  ],
                })
              : [],
          ]).then(([universityNews, organizationNews]) => ({
            count: universityNews.length + organizationNews.length,
            rows: [...universityNews, ...organizationNews],
          })),
      !wantsEvents
        ? { count: 0, rows: [] }
        : db.OrganizationEvent.findAndCountAll({
            where: eventWhere,
            limit: fetchSize,
            order: [['is_featured', 'DESC'], ['event_date', 'ASC'], ['created_at', 'DESC']],
            include: [
              { model: db.Organization, as: 'Organization', attributes: ['id', 'name', 'slug', 'logo_url', 'location'] },
            ],
          }),
      !wantsAnyOpportunities
        ? { count: 0, rows: [] }
        : db.Opportunity.findAndCountAll({
            where: {
              ...opportunityWhere,
              ...(wantsUniversityOpportunities && !wantsOrganizationOpportunities
                ? { university_id: { [Op.ne]: null }, organization_id: null }
                : {}),
              ...(wantsOrganizationOpportunities && !wantsUniversityOpportunities
                ? { organization_id: { [Op.ne]: null } }
                : {}),
            },
            limit: fetchSize,
            order: [['is_featured', 'DESC'], ['created_at', 'DESC']],
            include: [
              { model: db.OpportunityTag, as: 'Tags' },
              { model: db.University, as: 'University', required: false, attributes: ['id', 'name', 'slug', 'logo_url', 'province'] },
              { model: db.Organization, as: 'Organization', required: false, attributes: ['id', 'name', 'slug', 'logo_url', 'location'] },
              { model: db.User, as: 'PostedBy', required: false, attributes: ['id', 'name', 'avatar_url'] },
            ],
          }),
    ]);

    const rawItems = [
      ...(newsResult.rows || []).map((item) => ({
        id: item.id,
        kind: 'news',
        created_at: item.published_at || item.created_at,
        News: item,
      })),
      ...(eventResult.rows || []).map((item) => ({
        id: item.id,
        kind: 'event',
        created_at: item.event_date || item.created_at,
        Event: item,
      })),
      ...(opportunityResult.rows || []).map((item) => ({
        id: item.id,
        kind: 'opportunity',
        created_at: item.created_at,
        Opportunity: item,
      })),
    ];

    const total = Number(newsResult.count || 0) + Number(eventResult.count || 0) + Number(opportunityResult.count || 0);
    const rankedItems = await attachInteractionMeta(rawItems, req.user?.id || null);
    rankedItems.sort((a, b) => {
      const scoreDiff = getRankingScore(b) - getRankingScore(a);
      if (Math.abs(scoreDiff) > 0.01) return scoreDiff;
      return getItemTimestamp(b) - getItemTimestamp(a);
    });

    const items = rankedItems.slice(offset, offset + safeLimit);
    return success(res, {
      items,
      meta: {
        total,
        page: safePage,
        limit: safeLimit,
        totalPages: Math.ceil(total / safeLimit),
        hasNext: offset + items.length < total,
        hasPrev: safePage > 1,
      },
    });
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
