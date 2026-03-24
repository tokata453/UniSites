'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const { canManageOpportunity, canAccessConversation } = require('../utils/policy.utils');

test('organization can manage only opportunities owned by its organization', () => {
  const opportunity = { posted_by: 'user-1', university_id: null, organization_id: 'org-1' };

  assert.equal(
    canManageOpportunity({
      role: 'organization',
      userId: 'user-1',
      opportunity,
      ownedOrganizationId: 'org-1',
    }),
    true
  );

  assert.equal(
    canManageOpportunity({
      role: 'organization',
      userId: 'user-1',
      opportunity,
      ownedOrganizationId: 'org-2',
    }),
    false
  );
});

test('owner can manage opportunities they posted or that belong to their university', () => {
  assert.equal(
    canManageOpportunity({
      role: 'owner',
      userId: 'user-1',
      opportunity: { posted_by: 'user-1', university_id: null, organization_id: null },
    }),
    true
  );

  assert.equal(
    canManageOpportunity({
      role: 'owner',
      userId: 'user-1',
      ownedUniversityId: 'uni-1',
      opportunity: { posted_by: 'user-2', university_id: 'uni-1', organization_id: null },
    }),
    true
  );
});

test('organization inbox access follows participant or org access', () => {
  const conversation = {
    conversation_context: 'organization',
    participant_user_id: 'student-1',
    organization_id: 'org-1',
    user_one_id: 'student-1',
    user_two_id: 'owner-1',
  };

  assert.equal(
    canAccessConversation({ conversation, userId: 'student-1' }),
    true
  );

  assert.equal(
    canAccessConversation({ conversation, userId: 'staff-1', hasOrganizationAccess: true }),
    true
  );

  assert.equal(
    canAccessConversation({ conversation, userId: 'outsider-1' }),
    false
  );
});

test('personal conversations remain user-based', () => {
  const conversation = {
    conversation_context: 'personal',
    user_one_id: 'user-1',
    user_two_id: 'user-2',
  };

  assert.equal(canAccessConversation({ conversation, userId: 'user-1' }), true);
  assert.equal(canAccessConversation({ conversation, userId: 'user-3' }), false);
});
