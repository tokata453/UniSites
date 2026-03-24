'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const { getRegistrationApprovalState, isOrganizationApproved } = require('../utils/status.utils');

test('organization registration starts with approved user and pending organization', () => {
  const state = getRegistrationApprovalState('organization');

  assert.equal(state.userIsApproved, true);
  assert.equal(state.organizationIsApproved, false);
});

test('student registration does not create organization approval state', () => {
  const state = getRegistrationApprovalState('student');

  assert.equal(state.userIsApproved, true);
  assert.equal(state.organizationIsApproved, null);
});

test('organization approval helper reads boolean status safely', () => {
  assert.equal(isOrganizationApproved({ is_approved: true }), true);
  assert.equal(isOrganizationApproved({ is_approved: false }), false);
  assert.equal(isOrganizationApproved(null), false);
});
