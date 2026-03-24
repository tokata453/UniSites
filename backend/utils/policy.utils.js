'use strict';

const canManageOpportunity = ({
  isAdmin = false,
  role,
  userId,
  opportunity,
  ownedUniversityId = null,
  ownedOrganizationId = null,
}) => {
  if (isAdmin) return true;
  if (!userId || !opportunity) return false;

  if (role === 'owner') {
    return (
      opportunity.posted_by === userId
      || (ownedUniversityId && opportunity.university_id === ownedUniversityId)
    );
  }

  if (role === 'organization') {
    return Boolean(ownedOrganizationId && opportunity.organization_id === ownedOrganizationId);
  }

  return opportunity.posted_by === userId;
};

const canAccessConversation = ({
  conversation,
  userId,
  isAdmin = false,
  hasUniversityAccess = false,
  hasOrganizationAccess = false,
}) => {
  if (!conversation || !userId) return false;
  if (isAdmin) return true;

  if (conversation.conversation_context === 'university') {
    return (
      conversation.participant_user_id === userId
      || hasUniversityAccess
      || [conversation.user_one_id, conversation.user_two_id].includes(userId)
    );
  }

  if (conversation.conversation_context === 'organization') {
    return (
      conversation.participant_user_id === userId
      || hasOrganizationAccess
      || [conversation.user_one_id, conversation.user_two_id].includes(userId)
    );
  }

  return [conversation.user_one_id, conversation.user_two_id].includes(userId);
};

module.exports = {
  canManageOpportunity,
  canAccessConversation,
};
