'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const { validateRegistrationInput } = require('../utils/validation.utils');

test('registration validation requires name email and password', () => {
  assert.equal(
    validateRegistrationInput({ name: '', email: 'user@example.com', password: 'password123' }),
    'name, email and password are required'
  );
});

test('registration validation requires password length of at least 8 characters', () => {
  assert.equal(
    validateRegistrationInput({ name: 'Test User', email: 'user@example.com', password: 'short' }),
    'Password must be at least 8 characters'
  );
});

test('registration validation accepts complete input', () => {
  assert.equal(
    validateRegistrationInput({ name: 'Test User', email: 'user@example.com', password: 'password123' }),
    null
  );
});
