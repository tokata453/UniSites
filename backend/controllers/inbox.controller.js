'use strict';
const { Op } = require('sequelize');
const db = require('../models');
const { success, error, notFound, forbidden, created } = require('../utils/response.utils');
const { getIO } = require('../config/socket');

const userPreviewAttributes = ['id', 'name', 'email', 'avatar_url', 'role_id'];
const institutionPreviewAttributes = ['id', 'name', 'slug', 'logo_url', 'owner_id'];

const conversationWhereForUser = (userId) => ({
  [Op.or]: [{ user_one_id: userId }, { user_two_id: userId }],
});

const conversationInclude = [
  { model: db.User, as: 'UserOne', attributes: userPreviewAttributes, required: false },
  { model: db.User, as: 'UserTwo', attributes: userPreviewAttributes, required: false },
  { model: db.User, as: 'ParticipantUser', attributes: userPreviewAttributes, required: false },
  { model: db.University, as: 'University', attributes: institutionPreviewAttributes, required: false },
  { model: db.Organization, as: 'Organization', attributes: institutionPreviewAttributes, required: false },
];

const normalizeConversationContext = (value) => {
  if (!value) return null;
  return ['personal', 'university', 'organization', 'admin', 'all'].includes(value) ? value : 'personal';
};

const isPlatformAdmin = (user) => user?.Role?.name === 'admin';

const participantFor = (conversation, userId) => {
  if (!conversation) return null;

  if (['university', 'organization'].includes(conversation.conversation_context)) {
    return conversation.ParticipantUser
      || (conversation.user_one_id === userId ? conversation.UserTwo : null)
      || (conversation.user_two_id === userId ? conversation.UserOne : null)
      || conversation.UserOne
      || conversation.UserTwo
      || null;
  }

  if (conversation.user_one_id === userId) return conversation.UserTwo || null;
  if (conversation.user_two_id === userId) return conversation.UserOne || null;
  return conversation.ParticipantUser || null;
};

const legacyInstitutionUserId = (entity, fallbackUserId) => entity?.owner_id || fallbackUserId || null;

const emitSafe = (room, event, payload) => {
  try {
    const io = getIO();
    io.to(room).emit(event, payload);
  } catch (_) {
    // Socket delivery is optional.
  }
};

const getManagedUniversity = async (user) => {
  if (!user?.id) return null;

  const ownedUniversity = await db.University.findOne({
    where: { owner_id: user.id },
    attributes: institutionPreviewAttributes,
  });
  if (ownedUniversity) return ownedUniversity;

  const access = await db.UniversityInboxAccess.findOne({
    where: { user_id: user.id },
    include: [{ model: db.University, as: 'University', attributes: institutionPreviewAttributes }],
    order: [['created_at', 'ASC']],
  });

  return access?.University || null;
};

const getManagedOrganization = async (user) => {
  if (!user?.id) return null;

  const ownedOrganization = await db.Organization.findOne({
    where: { owner_id: user.id },
    attributes: institutionPreviewAttributes,
  });
  if (ownedOrganization) return ownedOrganization;

  const access = await db.OrganizationInboxAccess.findOne({
    where: { user_id: user.id },
    include: [{ model: db.Organization, as: 'Organization', attributes: institutionPreviewAttributes }],
    order: [['created_at', 'ASC']],
  });

  return access?.Organization || null;
};

const userHasUniversityAccess = async (user, universityId) => {
  if (!user?.id || !universityId) return false;
  if (isPlatformAdmin(user)) return true;

  const university = await db.University.findByPk(universityId, {
    attributes: ['id', 'owner_id'],
  });
  if (!university) return false;
  if (university.owner_id === user.id) return true;

  const access = await db.UniversityInboxAccess.findOne({
    where: { university_id: universityId, user_id: user.id },
    attributes: ['id'],
  });

  return Boolean(access);
};

const userHasOrganizationAccess = async (user, organizationId) => {
  if (!user?.id || !organizationId) return false;
  if (isPlatformAdmin(user)) return true;

  const organization = await db.Organization.findByPk(organizationId, {
    attributes: ['id', 'owner_id'],
  });
  if (!organization) return false;
  if (organization.owner_id === user.id) return true;

  const access = await db.OrganizationInboxAccess.findOne({
    where: { organization_id: organizationId, user_id: user.id },
    attributes: ['id'],
  });

  return Boolean(access);
};

const canAccessConversation = async (conversation, user) => {
  if (!conversation || !user?.id) return false;

  if (conversation.conversation_context === 'university') {
    return (
      conversation.participant_user_id === user.id
      || await userHasUniversityAccess(user, conversation.university_id)
      || [conversation.user_one_id, conversation.user_two_id].includes(user.id)
    );
  }

  if (conversation.conversation_context === 'organization') {
    return (
      conversation.participant_user_id === user.id
      || await userHasOrganizationAccess(user, conversation.organization_id)
      || [conversation.user_one_id, conversation.user_two_id].includes(user.id)
    );
  }

  return [conversation.user_one_id, conversation.user_two_id].includes(user.id);
};

const ensureAccessibleConversation = async (conversationId, user) => {
  const conversation = await db.Conversation.findByPk(conversationId, {
    include: conversationInclude,
  });

  if (!conversation) return null;
  if (!(await canAccessConversation(conversation, user))) return false;
  return conversation;
};

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

const createMessageNotification = async (userId, sender, message, conversationId) => {
  if (!userId) return;

  await db.Notification.create({
    user_id: userId,
    type: 'message',
    title: `New message from ${sender.name}`,
    message: message.body.slice(0, 160),
    link: '/dashboard/inbox',
    data: { conversation_id: conversationId, sender_id: sender.id },
  });
};

const getInstitutionRecipients = async (conversation, excludeUserId = null) => {
  const recipients = new Map();

  if (conversation.conversation_context === 'university' && conversation.university_id) {
    const [university, accessRows] = await Promise.all([
      conversation.University
        ? Promise.resolve(conversation.University)
        : db.University.findByPk(conversation.university_id, { attributes: institutionPreviewAttributes }),
      db.UniversityInboxAccess.findAll({
        where: { university_id: conversation.university_id },
        include: [{ model: db.User, as: 'User', attributes: userPreviewAttributes }],
      }),
    ]);

    if (university?.owner_id) {
      const owner = await db.User.findByPk(university.owner_id, { attributes: userPreviewAttributes });
      if (owner) recipients.set(String(owner.id), owner);
    }

    accessRows.forEach((row) => {
      if (row.User?.id) recipients.set(String(row.User.id), row.User);
    });
  }

  if (conversation.conversation_context === 'organization' && conversation.organization_id) {
    const [organization, accessRows] = await Promise.all([
      conversation.Organization
        ? Promise.resolve(conversation.Organization)
        : db.Organization.findByPk(conversation.organization_id, { attributes: institutionPreviewAttributes }),
      db.OrganizationInboxAccess.findAll({
        where: { organization_id: conversation.organization_id },
        include: [{ model: db.User, as: 'User', attributes: userPreviewAttributes }],
      }),
    ]);

    if (organization?.owner_id) {
      const owner = await db.User.findByPk(organization.owner_id, { attributes: userPreviewAttributes });
      if (owner) recipients.set(String(owner.id), owner);
    }

    accessRows.forEach((row) => {
      if (row.User?.id) recipients.set(String(row.User.id), row.User);
    });
  }

  if (excludeUserId) recipients.delete(String(excludeUserId));
  return Array.from(recipients.values());
};

const getConversationDeliveryTargets = async (conversation, senderId) => {
  if (conversation.conversation_context === 'university' || conversation.conversation_context === 'organization') {
    const institutionRecipients = await getInstitutionRecipients(conversation, senderId);
    const participant = conversation.ParticipantUser
      || (conversation.participant_user_id
        ? await db.User.findByPk(conversation.participant_user_id, { attributes: userPreviewAttributes })
        : null);

    const targets = new Map();
    institutionRecipients.forEach((user) => {
      targets.set(String(user.id), user);
    });
    if (participant?.id && String(participant.id) !== String(senderId)) {
      targets.set(String(participant.id), participant);
    }
    return Array.from(targets.values());
  }

  const recipient = participantFor(conversation, senderId);
  return recipient?.id ? [recipient] : [];
};

const dispatchConversationUpdate = async ({ conversation, sender, message, clientTempId = null }) => {
  const deliveryTargets = await getConversationDeliveryTargets(conversation, sender.id);
  const targetIds = Array.from(new Set([sender.id, ...deliveryTargets.map((user) => user.id)]));
  const summaries = await Promise.all(targetIds.map(async (userId) => ([
    userId,
    await loadConversationSummary(conversation.id, userId),
  ])));
  const summaryMap = new Map(summaries);

  emitSafe(`user_${sender.id}`, 'message:new', {
    conversationId: conversation.id,
    conversation: summaryMap.get(sender.id),
    message,
    clientTempId,
  });

  await Promise.all(deliveryTargets.map(async (targetUser) => {
    await createMessageNotification(targetUser.id, sender, message, conversation.id);
    emitSafe(`user_${targetUser.id}`, 'message:new', {
      conversationId: conversation.id,
      conversation: summaryMap.get(targetUser.id),
      message,
      clientTempId,
    });
  }));
};

exports.listConversations = async (req, res) => {
  try {
    const requestedContext = normalizeConversationContext(req.query.context);
    const [managedUniversity, managedOrganization] = await Promise.all([
      requestedContext === 'university' ? getManagedUniversity(req.user) : Promise.resolve(null),
      requestedContext === 'organization' ? getManagedOrganization(req.user) : Promise.resolve(null),
    ]);

    if (requestedContext === 'university' && !managedUniversity) {
      return success(res, { conversations: [], context: 'university', university: null, organization: null });
    }
    if (requestedContext === 'organization' && !managedOrganization) {
      return success(res, { conversations: [], context: 'organization', university: null, organization: null });
    }

    let where;
    if (requestedContext === 'university') {
      where = { conversation_context: 'university', university_id: managedUniversity.id };
    } else if (requestedContext === 'organization') {
      where = { conversation_context: 'organization', organization_id: managedOrganization.id };
    } else {
      where = {
        ...conversationWhereForUser(req.user.id),
        ...(requestedContext && requestedContext !== 'all' ? { conversation_context: requestedContext } : {}),
      };
    }

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
      university: managedUniversity,
      organization: managedOrganization,
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
    const requestedContext = normalizeConversationContext(req.body.context) || 'personal';

    let conversation;

    if (requestedContext === 'university') {
      if (!req.body.university_id) return error(res, 'University context requires a university_id');

      const contextUniversity = await db.University.findByPk(req.body.university_id, {
        attributes: institutionPreviewAttributes,
      });
      if (!contextUniversity) return notFound(res, 'University not found');
      const institutionUserId = legacyInstitutionUserId(contextUniversity, req.user.id);

      conversation = await db.Conversation.findOne({
        where: {
          conversation_context: 'university',
          university_id: contextUniversity.id,
          [Op.or]: [
            { participant_user_id: req.user.id },
            {
              [Op.or]: [
                { user_one_id: req.user.id, user_two_id: institutionUserId },
                { user_one_id: institutionUserId, user_two_id: req.user.id },
              ],
            },
          ],
        },
        include: conversationInclude,
      });

      if (!conversation) {
        conversation = await db.Conversation.create({
          user_one_id: req.user.id,
          user_two_id: institutionUserId,
          participant_user_id: req.user.id,
          conversation_context: 'university',
          university_id: contextUniversity.id,
          organization_id: null,
          last_message_at: message?.trim() ? new Date() : null,
        });
        conversation = await db.Conversation.findByPk(conversation.id, { include: conversationInclude });
      }
    } else if (requestedContext === 'organization') {
      if (!req.body.organization_id) return error(res, 'Organization context requires an organization_id');

      const contextOrganization = await db.Organization.findByPk(req.body.organization_id, {
        attributes: institutionPreviewAttributes,
      });
      if (!contextOrganization) return notFound(res, 'Organization not found');
      const institutionUserId = legacyInstitutionUserId(contextOrganization, req.user.id);

      conversation = await db.Conversation.findOne({
        where: {
          conversation_context: 'organization',
          organization_id: contextOrganization.id,
          [Op.or]: [
            { participant_user_id: req.user.id },
            {
              [Op.or]: [
                { user_one_id: req.user.id, user_two_id: institutionUserId },
                { user_one_id: institutionUserId, user_two_id: req.user.id },
              ],
            },
          ],
        },
        include: conversationInclude,
      });

      if (!conversation) {
        conversation = await db.Conversation.create({
          user_one_id: req.user.id,
          user_two_id: institutionUserId,
          participant_user_id: req.user.id,
          conversation_context: 'organization',
          organization_id: contextOrganization.id,
          university_id: null,
          last_message_at: message?.trim() ? new Date() : null,
        });
        conversation = await db.Conversation.findByPk(conversation.id, { include: conversationInclude });
      }
    } else {
      if (!recipient_id && !recipient_email) return error(res, 'Recipient is required');

      const recipient = await db.User.findOne({
        where: recipient_id ? { id: recipient_id } : { email: recipient_email },
        attributes: ['id', 'name', 'email', 'avatar_url', 'role_id'],
        include: [{ model: db.Role, as: 'Role', attributes: ['name'] }],
      });
      if (!recipient) return notFound(res, 'Recipient not found');
      if (recipient.id === req.user.id) return error(res, 'You cannot start a chat with yourself');

      const effectiveContext = requestedContext === 'admin'
        ? 'admin'
        : (recipient.Role?.name === 'admin' && req.user?.Role?.name !== 'admin' ? 'admin' : 'personal');

      if (effectiveContext === 'admin' && recipient.Role?.name !== 'admin') {
        return error(res, 'Admin context requires an admin recipient', 400);
      }

      conversation = await db.Conversation.findOne({
        where: {
          conversation_context: effectiveContext,
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
          participant_user_id: null,
          conversation_context: effectiveContext,
          university_id: null,
          organization_id: null,
          last_message_at: message?.trim() ? new Date() : null,
        });
        conversation = await db.Conversation.findByPk(conversation.id, { include: conversationInclude });
      }
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
      createdMessageWithSender = await db.Message.findByPk(createdMessage.id, {
        include: [{ model: db.User, as: 'Sender', attributes: ['id', 'name', 'avatar_url'] }],
      });

      await dispatchConversationUpdate({
        conversation,
        sender: req.user,
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
    const conversation = await ensureAccessibleConversation(req.params.id, req.user);
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
    const conversation = await ensureAccessibleConversation(req.params.id, req.user);
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

    const withSender = await db.Message.findByPk(message.id, {
      include: [{ model: db.User, as: 'Sender', attributes: ['id', 'name', 'avatar_url'] }],
    });

    await dispatchConversationUpdate({
      conversation,
      sender: req.user,
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
    const conversation = await ensureAccessibleConversation(req.params.id, req.user);
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
      const deliveryTargets = await getConversationDeliveryTargets(conversation, req.user.id);
      const recipientIds = new Set([req.user.id, ...deliveryTargets.map((user) => user.id)]);

      recipientIds.forEach((userId) => {
        emitSafe(`user_${userId}`, 'conversation:read', {
          conversationId: conversation.id,
          readerId: req.user.id,
          readAt,
        });
      });
    }

    return success(res, {}, 'Conversation marked as read');
  } catch (err) {
    return error(res, err.message, 500);
  }
};
