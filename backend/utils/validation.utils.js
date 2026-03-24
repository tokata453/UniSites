'use strict';

const validateRegistrationInput = ({ name, email, password }) => {
  if (!name || !email || !password) {
    return 'name, email and password are required';
  }

  if (String(password).length < 8) {
    return 'Password must be at least 8 characters';
  }

  return null;
};

module.exports = {
  validateRegistrationInput,
};
