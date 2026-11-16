// src/utils/ApiResponse.js
// Standardized response shape for all API endpoints.

export class ApiResponse {
  /**
   * @param {import('express').Response} res
   * @param {number} status  HTTP status code
   * @param {string} message Human-readable message
   * @param {*}      data    Response payload (optional)
   * @param {object} meta    Pagination / extra metadata (optional)
   */
  static send(res, status, message, data = null, meta = null) {
    const body = { success: status < 400, message };
    if (data !== null) body.data = data;
    if (meta !== null) body.meta = meta;
    return res.status(status).json(body);
  }

  static ok(res, message, data, meta)      { return ApiResponse.send(res, 200, message, data, meta); }
  static created(res, message, data)        { return ApiResponse.send(res, 201, message, data); }
  static noContent(res)                     { return res.status(204).end(); }
  static badRequest(res, message, errors)   { return ApiResponse.send(res, 400, message, errors ?? null); }
  static unauthorized(res, message = 'Authentication required') {
    return ApiResponse.send(res, 401, message);
  }
  static forbidden(res, message = 'Insufficient privileges', data = null) {
    return ApiResponse.send(res, 403, message, data);
  }
  static notFound(res, message = 'Resource not found') {
    return ApiResponse.send(res, 404, message);
  }
  static conflict(res, message)             { return ApiResponse.send(res, 409, message); }
  static serverError(res, message = 'Internal server error') {
    return ApiResponse.send(res, 500, message);
  }
}
