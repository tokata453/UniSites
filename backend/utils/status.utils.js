'use strict';

const getRegistrationApprovalState = (requestedRole = 'student') => ({
  userIsApproved: true,
  organizationIsApproved: requestedRole === 'organization' ? false : null,
});

const isOrganizationApproved = (organization) => Boolean(organization?.is_approved);

module.exports = {
  getRegistrationApprovalState,
  isOrganizationApproved,
};
