'use strict';

const getPagination = ({ page = 1, limit = 12 } = {}) => {
  const parsedLimit  = Math.min(parseInt(limit, 10) || 12, 100);
  const parsedPage   = Math.max(parseInt(page, 10) || 1, 1);
  return {
    limit:  parsedLimit,
    offset: (parsedPage - 1) * parsedLimit,
  };
};

const paginateResponse = (rows, count, page, limit) => {
  const parsedPage  = parseInt(page, 10) || 1;
  const parsedLimit = parseInt(limit, 10) || 12;
  const totalPages  = Math.ceil(count / parsedLimit);
  return {
    data: rows,
    meta: {
      total:      count,
      page:       parsedPage,
      limit:      parsedLimit,
      totalPages,
      hasNext:    parsedPage < totalPages,
      hasPrev:    parsedPage > 1,
    },
  };
};

module.exports = { getPagination, paginateResponse };
