/**
 * Standardised JSON response helpers.
 * All responses follow the shape:
 *   { success: boolean, message: string, data?: any, pagination?: object, errors?: any }
 */

const success = (res, data = null, message = 'Success', statusCode = 200) =>
  res.status(statusCode).json({ success: true, message, data });

const created = (res, data = null, message = 'Created successfully') =>
  res.status(201).json({ success: true, message, data });

const noContent = (res) => res.status(204).send();

const error = (res, message = 'Something went wrong', statusCode = 500, errors = null) =>
  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
  });

const paginated = (res, data, total, page, limit, message = 'Success') =>
  res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / limit),
    },
  });

module.exports = { success, created, noContent, error, paginated };