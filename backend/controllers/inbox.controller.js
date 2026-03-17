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

const ensureParticipant = async (conversationId, userId) => {
  const conversation = await db.Conversation.findByPk(conversationId, {
    include: [
      { model: db.User, as: 'UserOne', attributes: ['id', 'name', 'email', 'avatar_url', 'role_id'] },
      { model: db.User, as: 'UserTwo', attributes: ['id', 'name', 'email', 'avatar_url', 'role_id'] },
    ],
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
    const conversations = await db.Conversation.findAll({
      where: conversationWhereForUser(req.user.id),
      include: [
        { model: db.User, as: 'UserOne', attributes: ['id', 'name', 'email', 'avatar_url'] },
        { model: db.User, as: 'UserTwo', attributes: ['id', 'name', 'email', 'avatar_url'] },
      ],
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

    return success(res, { conversations: rows });
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
    const { recipient_id, recipient_email, message } = req.body;
    if (!recipient_id && !recipient_email) return error(res, 'Recipient is required');

    const recipient = await db.User.findOne({
      where: recipient_id ? { id: recipient_id } : { email: recipient_email },
      attributes: ['id', 'name', 'email', 'avatar_url'],
    });
    if (!recipient) return notFound(res, 'Recipient not found');
    if (recipient.id === req.user.id) return error(res, 'You cannot start a chat with yourself');

    let conversation = await db.Conversation.findOne({
      where: {
        [Op.or]: [
          { user_one_id: req.user.id, user_two_id: recipient.id },
          { user_one_id: recipient.id, user_two_id: req.user.id },
        ],
      },
      include: [
        { model: db.User, as: 'UserOne', attributes: ['id', 'name', 'email', 'avatar_url'] },
        { model: db.User, as: 'UserTwo', attributes: ['id', 'name', 'email', 'avatar_url'] },
      ],
    });

    if (!conversation) {
      conversation = await db.Conversation.create({
        user_one_id: req.user.id,
        user_two_id: recipient.id,
        last_message_at: message?.trim() ? new Date() : null,
      });
      conversation = await db.Conversation.findByPk(conversation.id, {
        include: [
          { model: db.User, as: 'UserOne', attributes: ['id', 'name', 'email', 'avatar_url'] },
          { model: db.User, as: 'UserTwo', attributes: ['id', 'name', 'email', 'avatar_url'] },
        ],
      });
    }

    let createdMessage = null;
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

      emitSafe(`user_${recipient.id}`, 'message:new', {
        conversationId: conversation.id,
        senderId: req.user.id,
      });
    }

    return created(res, {
      conversation: {
        ...conversation.toJSON(),
        participant: participantFor(conversation, req.user.id),
      },
      message: createdMessage,
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

    emitSafe(`user_${recipient.id}`, 'message:new', {
      conversationId: conversation.id,
      senderId: req.user.id,
    });

    const withSender = await db.Message.findByPk(message.id, {
      include: [{ model: db.User, as: 'Sender', attributes: ['id', 'name', 'avatar_url'] }],
    });

    return created(res, { message: withSender }, 'Message sent');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.markConversationRead = async (req, res) => {
  try {
    const conversation = await ensureParticipant(req.params.id, req.user.id);
    if (conversation === null) return notFound(res, 'Conversation not found');
    if (conversation === false) return forbidden(res, 'You do not have access to this conversation');

    await db.Message.update(
      { is_read: true, read_at: new Date() },
      {
        where: {
          conversation_id: conversation.id,
          sender_id: { [Op.ne]: req.user.id },
          is_read: false,
        },
      }
    );

    return success(res, {}, 'Conversation marked as read');
  } catch (err) {
    return error(res, err.message, 500);
  }
};
