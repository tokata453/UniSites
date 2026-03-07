'use strict';

const success = (res, data = {}, message = 'Success', statusCode = 200) =>
  res.status(statusCode).json({ success: true, message, ...data });

const created = (res, data = {}, message = 'Created successfully') =>
  success(res, data, message, 201);

const error = (res, message = 'An error occurred', statusCode = 400, errors = null) =>
  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
  });

const notFound      = (res, message = 'Resource not found')    => error(res, message, 404);
const unauthorized  = (res, message = 'Unauthorized')          => error(res, message, 401);
const forbidden     = (res, message = 'Forbidden')             => error(res, message, 403);
const serverError   = (res, message = 'Internal server error') => error(res, message, 500);

module.exports = { success, created, error, notFound, unauthorized, forbidden, serverError };
