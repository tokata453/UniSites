'use strict';
const passport                    = require('passport');
const { generateToken }           = require('../utils/jwt.utils');
const { success, created, error } = require('../utils/response.utils');
const { uniqueSlug }              = require('../utils/slug.utils');
const { getRegistrationApprovalState } = require('../utils/status.utils');
const { validateRegistrationInput } = require('../utils/validation.utils');
const db                          = require('../models');

// ── Local Auth ────────────────────────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const validationError = validateRegistrationInput({ name, email, password });
    if (validationError) return error(res, validationError);

    const exists = await db.User.findOne({ where: { email } });
    if (exists) return error(res, 'An account with that email already exists', 409);

    const requestedRole = ['student', 'organization'].includes(role) ? role : 'student';
    const approvalState = getRegistrationApprovalState(requestedRole);
    const baseRole = await db.Role.findOne({ where: { name: requestedRole } });
    const user = await db.User.create({
      name,
      email,
      password,   // hashed by beforeSave hook
      provider:  'local',
      role_id:   baseRole?.id || null,
      is_approved: approvalState.userIsApproved,
      is_active: true,
    });

    const fresh = await db.User.findByPk(user.id, {
      include: [{ model: db.Role, as: 'Role' }],
    });

    const token = generateToken({ id: fresh.id, email: fresh.email, role: fresh.Role?.name });

    if (requestedRole === 'organization') {
      await db.Organization.create({
        owner_id: fresh.id,
        slug: uniqueSlug('organization'),
        name: 'New Organization',
        email: 'organization@gmail.com',
        is_approved: approvalState.organizationIsApproved,
        is_published: false
      });
    }

    return created(res, { token, user: fresh }, 'Account created successfully');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const login = (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err)   return error(res, err.message, 500);
    if (!user) return error(res, info?.message || 'Invalid credentials', 401);

    const token = generateToken({ id: user.id, email: user.email, role: user.Role?.name });

    // Strip password from response (defaultScope already does this but be safe)
    const { password: _, ...safeUser } = user.toJSON();
    return success(res, { token, user: safeUser }, 'Logged in successfully');
  })(req, res, next);
}; 

// ── OAuth ─────────────────────────────────────────────────────────────────────

const oauthCallback = (req, res) => {
  try {
    const token = generateToken({ id: req.user.id, email: req.user.email, role: req.user.Role?.name });
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
  } catch (err) {
    res.redirect(`${process.env.CLIENT_URL}/auth/error`);
  }
};

// ── User ──────────────────────────────────────────────────────────────────────

const getMe = async (req, res) => {
  try {
    const user = await db.User.findByPk(req.user.id, {
      include: [
        { model: db.Role, as: 'Role' },
        { model: db.Organization, as: 'Organization' },
      ],
    });
    return success(res, { user });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const updateProfile = async (req, res) => {
  try {
    const updates = {
      name: req.body.name,
      bio: req.body.bio,
      website_url: req.body.website_url,
      contact_phone: req.body.contact_phone,
    };
    if (req.file) updates.avatar_url = req.file.path;
    await req.user.update(updates);
    const user = await db.User.findByPk(req.user.id, {
      include: [{ model: db.Role, as: 'Role' }],
    });
    return success(res, { user }, 'Profile updated');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const changePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password)
      return error(res, 'current_password and new_password are required');
    if (new_password.length < 8)
      return error(res, 'New password must be at least 8 characters');

    const user = await db.User.scope('withPassword').findByPk(req.user.id);
    if (user.provider !== 'local')
      return error(res, 'Password change is only available for local accounts');

    const valid = await user.verifyPassword(current_password);
    if (!valid) return error(res, 'Current password is incorrect', 401);

    await user.update({ password: new_password }); // hashed by beforeSave hook
    return success(res, {}, 'Password changed successfully');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const getNotifications = async (req, res) => {
  try {
    const notifications = await db.Notification.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']],
      limit: 30,
    });
    const unreadCount = notifications.filter(n => !n.is_read).length;
    return success(res, { notifications, unreadCount });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const markAllNotificationsRead = async (req, res) => {
  try {
    await db.Notification.update({ is_read: true }, { where: { user_id: req.user.id } });
    return success(res, {}, 'All notifications marked as read');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const markConversationNotificationsRead = async (req, res) => {
  try {
    const conversationId = req.params.conversationId;
    if (!conversationId) return error(res, 'Conversation id is required');

    const notifications = await db.Notification.findAll({
      where: {
        user_id: req.user.id,
        type: 'message',
        is_read: false,
      },
      attributes: ['id', 'data'],
    });

    const matchingIds = notifications
      .filter((item) => String(item.data?.conversation_id || '') === String(conversationId))
      .map((item) => item.id);

    if (matchingIds.length) {
      await db.Notification.update(
        { is_read: true },
        { where: { id: matchingIds } }
      );
    }

    return success(res, { updated: matchingIds.length }, 'Conversation notifications marked as read');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const getSavedItems = async (req, res) => {
  try {
    const rawItems = await db.SavedItem.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']],
    });

    const filteredItems = rawItems.filter((item) => item.item_type !== 'thread');
    const universityIds = filteredItems.filter((item) => item.item_type === 'university').map((item) => item.item_id);
    const opportunityIds = filteredItems.filter((item) => item.item_type === 'opportunity').map((item) => item.item_id);

    const [universities, opportunities] = await Promise.all([
      universityIds.length
        ? db.University.findAll({
            where: { id: universityIds },
            attributes: ['id', 'slug', 'name', 'province', 'type', 'logo_url', 'cover_url', 'rating_avg', 'program_count', 'tuition_min', 'is_featured'],
          })
        : [],
      opportunityIds.length
        ? db.Opportunity.findAll({
            where: { id: opportunityIds },
            attributes: ['id', 'slug', 'title', 'type', 'deadline', 'cover_url', 'is_featured', 'is_fully_funded'],
            include: [{ model: db.University, as: 'University', attributes: ['id', 'name', 'slug'] }],
          })
        : [],
    ]);

    const universityMap = new Map(universities.map((item) => [item.id, item]));
    const opportunityMap = new Map(opportunities.map((item) => [item.id, item]));

    const items = filteredItems.map((item) => ({
      ...item.toJSON(),
      University: item.item_type === 'university' ? universityMap.get(item.item_id) || null : null,
      Opportunity: item.item_type === 'opportunity' ? opportunityMap.get(item.item_id) || null : null,
    }));

    return success(res, { items });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const toggleSavedItem = async (req, res) => {
  try {
    const { item_type, item_id } = req.body;
    const existing = await db.SavedItem.findOne({ where: { user_id: req.user.id, item_type, item_id } });
    if (existing) {
      await existing.destroy();
      return success(res, { saved: false }, 'Removed from saved');
    }
    await db.SavedItem.create({ user_id: req.user.id, item_type, item_id });
    return success(res, { saved: true }, 'Saved successfully');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const logout = (req, res) => success(res, {}, 'Logged out successfully');

module.exports = {
  register, login, oauthCallback,
  getMe, updateProfile, changePassword,
  getNotifications, markAllNotificationsRead, markConversationNotificationsRead,
  getSavedItems, toggleSavedItem, logout,
};
