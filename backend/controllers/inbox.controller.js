'use strict';
const { Op } = require('sequelize');
const db = require('../models');
const { success, error, notFound, forbidden, created } = require('../utils/response.utils');
const { getIO } = require('../config/socket');

const conversationWhereForUser = (userId) => ({
  [Op.or]: [{ user_one_id: userId }, { user_two_id: userId }],
});

const participantFor = (conversation, userId) => (
  conversation.user_one_id === userId ? conversation.UserTwo : conversation.UserOne
);

const conversationInclude = [
  { model: db.User, as: 'UserOne', attributes: ['id', 'name', 'email', 'avatar_url', 'role_id'] },
  { model: db.User, as: 'UserTwo', attributes: ['id', 'name', 'email', 'avatar_url', 'role_id'] },
  { model: db.University, as: 'University', attributes: ['id', 'name', 'slug', 'logo_url'], required: false },
  { model: db.Organization, as: 'Organization', attributes: ['id', 'name', 'slug', 'logo_url'], required: false },
];

const normalizeConversationContext = (value) => {
  if (!value) return null;
  return ['personal', 'university', 'organization', 'admin', 'all'].includes(value) ? value : 'personal';
};

const getOwnedUniversity = async (userId) => db.University.findOne({
  where: { owner_id: userId },
  attributes: ['id', 'name', 'slug', 'logo_url'],
});

const getOwnedOrganization = async (userId) => db.Organization.findOne({
  where: { owner_id: userId },
  attributes: ['id', 'name', 'slug', 'logo_url'],
});

const loadConversationSummary = async (conversationId, userId) => {
  const conversation = await db.Conversation.findByPk(conversationId, {
    include: conversationInclude,
  });

  if (!conversation) return null;

  const [latestMessage, unreadCount] = await Promise.all([
    db.Message.findOne({
      where: { conversation_id: conversation.id },
      order: [['created_at', 'DESC']],
      include: [{ model: db.User, as: 'Sender', attributes: ['id', 'name', 'avatar_url'] }],
    }),
    db.Message.count({
      where: {
        conversation_id: conversation.id,
        sender_id: { [Op.ne]: userId },
        is_read: false,
      },
    }),
  ]);

  return {
    ...conversation.toJSON(),
    participant: participantFor(conversation, userId),
    latestMessage,
    unreadCount,
  };
};

const ensureParticipant = async (conversationId, userId) => {
  const conversation = await db.Conversation.findByPk(conversationId, {
    include: conversationInclude,
  });

  if (!conversation) return null;
  if (![conversation.user_one_id, conversation.user_two_id].includes(userId)) return false;
  return conversation;
};

const emitSafe = (room, event, payload) => {
  try {
    const io = getIO();
    io.to(room).emit(event, payload);
  } catch (_) {
    // Socket delivery is optional
  }
};

exports.listConversations = async (req, res) => {
  try {
    const requestedContext = normalizeConversationContext(req.query.context);
    const ownedUniversity = requestedContext === 'university'
      ? await getOwnedUniversity(req.user.id)
      : null;
    const ownedOrganization = requestedContext === 'organization'
      ? await getOwnedOrganization(req.user.id)
      : null;

    if (requestedContext === 'university' && !ownedUniversity) {
      return success(res, { conversations: [], context: 'university', university: null, organization: null });
    }
    if (requestedContext === 'organization' && !ownedOrganization) {
      return success(res, { conversations: [], context: 'organization', university: null, organization: null });
    }

    const where = {
      ...conversationWhereForUser(req.user.id),
      ...(requestedContext && requestedContext !== 'all' ? { conversation_context: requestedContext } : {}),
      ...(requestedContext === 'university' ? { university_id: ownedUniversity.id } : {}),
      ...(requestedContext === 'organization' ? { organization_id: ownedOrganization.id } : {}),
    };

    const conversations = await db.Conversation.findAll({
      where,
      include: conversationInclude,
      order: [['last_message_at', 'DESC'], ['updated_at', 'DESC']],
    });

    const rows = await Promise.all(conversations.map(async (conversation) => {
      const [latestMessage, unreadCount] = await Promise.all([
        db.Message.findOne({
          where: { conversation_id: conversation.id },
          order: [['created_at', 'DESC']],
          include: [{ model: db.User, as: 'Sender', attributes: ['id', 'name'] }],
        }),
        db.Message.count({
          where: {
            conversation_id: conversation.id,
            sender_id: { [Op.ne]: req.user.id },
            is_read: false,
          },
        }),
      ]);

      return {
        ...conversation.toJSON(),
        participant: participantFor(conversation, req.user.id),
        latestMessage,
        unreadCount,
      };
    }));

    return success(res, {
      conversations: rows,
      context: requestedContext || 'all',
      university: ownedUniversity,
      organization: ownedOrganization,
    });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.searchUsers = async (req, res) => {
  try {
    const q = req.query.q?.trim();
    if (!q) return success(res, { users: [] });

    const users = await db.User.findAll({
      where: {
        id: { [Op.ne]: req.user.id },
        [Op.or]: [
          { name: { [Op.iLike]: `%${q}%` } },
          { email: { [Op.iLike]: `%${q}%` } },
        ],
      },
      attributes: ['id', 'name', 'email', 'avatar_url'],
      limit: 8,
      order: [['name', 'ASC']],
    });

    return success(res, { users });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.createConversation = async (req, res) => {
  try {
    const { recipient_id, recipient_email, message, client_temp_id } = req.body;
    const requestedContext = normalizeConversationContext(req.body.context);
    if (!recipient_id && !recipient_email) return error(res, 'Recipient is required');

    const recipient = await db.User.findOne({
      where: recipient_id ? { id: recipient_id } : { email: recipient_email },
      attributes: ['id', 'name', 'email', 'avatar_url', 'role_id'],
      include: [{ model: db.Role, as: 'Role', attributes: ['name'] }],
    });
    if (!recipient) return notFound(res, 'Recipient not found');
    if (recipient.id === req.user.id) return error(res, 'You cannot start a chat with yourself');

    const effectiveContext = requestedContext
      || (recipient.Role?.name === 'admin' && req.user?.Role?.name !== 'admin' ? 'admin' : 'personal');

    let contextUniversity = null;
    let contextOrganization = null;
    if (effectiveContext === 'university') {
      if (!req.body.university_id) return error(res, 'University context requires a university_id');

      contextUniversity = await db.University.findOne({
        where: { id: req.body.university_id, owner_id: recipient.id },
        attributes: ['id', 'name', 'slug', 'logo_url', 'owner_id'],
      });

      if (!contextUniversity) {
        return error(res, 'This university inbox is not available for the selected recipient', 400);
      }
    }
    if (effectiveContext === 'organization') {
      if (!req.body.organization_id) return error(res, 'Organization context requires an organization_id');

      contextOrganization = await db.Organization.findOne({
        where: { id: req.body.organization_id, owner_id: recipient.id },
        attributes: ['id', 'name', 'slug', 'logo_url', 'owner_id'],
      });

      if (!contextOrganization) {
        return error(res, 'This organization inbox is not available for the selected recipient', 400);
      }
    }
    if (effectiveContext === 'admin' && recipient.Role?.name !== 'admin') {
      return error(res, 'Admin context requires an admin recipient', 400);
    }

    let conversation = await db.Conversation.findOne({
      where: {
        conversation_context: effectiveContext,
        ...(effectiveContext === 'university' ? { university_id: contextUniversity.id } : {}),
        ...(effectiveContext === 'organization' ? { organization_id: contextOrganization.id } : {}),
        [Op.or]: [
          { user_one_id: req.user.id, user_two_id: recipient.id },
          { user_one_id: recipient.id, user_two_id: req.user.id },
        ],
      },
      include: conversationInclude,
    });

    if (!conversation) {
      conversation = await db.Conversation.create({
        user_one_id: req.user.id,
        user_two_id: recipient.id,
        conversation_context: effectiveContext,
        university_id: effectiveContext === 'university' ? contextUniversity.id : null,
        organization_id: effectiveContext === 'organization' ? contextOrganization.id : null,
        last_message_at: message?.trim() ? new Date() : null,
      });
      conversation = await db.Conversation.findByPk(conversation.id, {
        include: conversationInclude,
      });
    }

    let createdMessage = null;
    let createdMessageWithSender = null;
    if (message?.trim()) {
      createdMessage = await db.Message.create({
        conversation_id: conversation.id,
        sender_id: req.user.id,
        body: message.trim(),
      });
      await conversation.update({ last_message_at: createdMessage.createdAt });

      await db.Notification.create({
        user_id: recipient.id,
        type: 'message',
        title: `New message from ${req.user.name}`,
        message: message.trim().slice(0, 160),
        link: '/inbox',
        data: { conversation_id: conversation.id, sender_id: req.user.id },
      });
      createdMessageWithSender = await db.Message.findByPk(createdMessage.id, {
        include: [{ model: db.User, as: 'Sender', attributes: ['id', 'name', 'avatar_url'] }],
      });

      const [senderConversation, recipientConversation] = await Promise.all([
        loadConversationSummary(conversation.id, req.user.id),
        loadConversationSummary(conversation.id, recipient.id),
      ]);

      emitSafe(`user_${req.user.id}`, 'message:new', {
        conversationId: conversation.id,
        conversation: senderConversation,
        message: createdMessageWithSender,
        clientTempId: client_temp_id || null,
      });
      emitSafe(`user_${recipient.id}`, 'message:new', {
        conversationId: conversation.id,
        conversation: recipientConversation,
        message: createdMessageWithSender,
        clientTempId: client_temp_id || null,
      });
    }

    return created(res, {
      conversation: await loadConversationSummary(conversation.id, req.user.id),
      message: createdMessageWithSender || createdMessage,
      clientTempId: client_temp_id || null,
    }, 'Conversation ready');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.getMessages = async (req, res) => {
  try {
    const conversation = await ensureParticipant(req.params.id, req.user.id);
    if (conversation === null) return notFound(res, 'Conversation not found');
    if (conversation === false) return forbidden(res, 'You do not have access to this conversation');

    const messages = await db.Message.findAll({
      where: { conversation_id: conversation.id },
      include: [{ model: db.User, as: 'Sender', attributes: ['id', 'name', 'avatar_url'] }],
      order: [['created_at', 'ASC']],
    });

    return success(res, {
      conversation: {
        ...conversation.toJSON(),
        participant: participantFor(conversation, req.user.id),
      },
      messages,
    });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const conversation = await ensureParticipant(req.params.id, req.user.id);
    if (conversation === null) return notFound(res, 'Conversation not found');
    if (conversation === false) return forbidden(res, 'You do not have access to this conversation');
    if (!req.body.body?.trim()) return error(res, 'Message body is required');
    const clientTempId = req.body.client_temp_id || null;

    const message = await db.Message.create({
      conversation_id: conversation.id,
      sender_id: req.user.id,
      body: req.body.body.trim(),
    });
    await conversation.update({ last_message_at: message.createdAt });

    const recipient = participantFor(conversation, req.user.id);
    await db.Notification.create({
      user_id: recipient.id,
      type: 'message',
      title: `New message from ${req.user.name}`,
      message: message.body.slice(0, 160),
      link: '/inbox',
      data: { conversation_id: conversation.id, sender_id: req.user.id },
    });

    const withSender = await db.Message.findByPk(message.id, {
      include: [{ model: db.User, as: 'Sender', attributes: ['id', 'name', 'avatar_url'] }],
    });

    const [senderConversation, recipientConversation] = await Promise.all([
      loadConversationSummary(conversation.id, req.user.id),
      loadConversationSummary(conversation.id, recipient.id),
    ]);

    emitSafe(`user_${req.user.id}`, 'message:new', {
      conversationId: conversation.id,
      conversation: senderConversation,
      message: withSender,
      clientTempId,
    });
    emitSafe(`user_${recipient.id}`, 'message:new', {
      conversationId: conversation.id,
      conversation: recipientConversation,
      message: withSender,
      clientTempId,
    });

    return created(res, { message: withSender, clientTempId }, 'Message sent');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.markConversationRead = async (req, res) => {
  try {
    const conversation = await ensureParticipant(req.params.id, req.user.id);
    if (conversation === null) return notFound(res, 'Conversation not found');
    if (conversation === false) return forbidden(res, 'You do not have access to this conversation');

    const readAt = new Date();
    const [updatedCount] = await db.Message.update(
      { is_read: true, read_at: readAt },
      {
        where: {
          conversation_id: conversation.id,
          sender_id: { [Op.ne]: req.user.id },
          is_read: false,
        },
      }
    );

    if (updatedCount > 0) {
      const otherParticipant = participantFor(conversation, req.user.id);
      emitSafe(`user_${otherParticipant.id}`, 'conversation:read', {
        conversationId: conversation.id,
        readerId: req.user.id,
        readAt,
      });
      emitSafe(`user_${req.user.id}`, 'conversation:read', {
        conversationId: conversation.id,
        readerId: req.user.id,
        readAt,
      });
    }

    return success(res, {}, 'Conversation marked as read');
  } catch (err) {
    return error(res, err.message, 500);
  }
};
