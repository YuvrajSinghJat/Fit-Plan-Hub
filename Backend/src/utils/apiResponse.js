class ApiResponse {
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
    this.timestamp = new Date().toISOString();
  }

  static success(data, message = "Request successful") {
    return new ApiResponse(200, data, message);
  }

  static created(data, message = "Resource created successfully") {
    return new ApiResponse(201, data, message);
  }

  static noContent(message = "No content") {
    return new ApiResponse(204, null, message);
  }

  static badRequest(message = "Bad request") {
    return new ApiResponse(400, null, message);
  }

  static unauthorized(message = "Unauthorized access") {
    return new ApiResponse(401, null, message);
  }

  static forbidden(message = "Forbidden") {
    return new ApiResponse(403, null, message);
  }

  static notFound(message = "Resource not found") {
    return new ApiResponse(404, null, message);
  }

  static conflict(message = "Conflict") {
    return new ApiResponse(409, null, message);
  }

  static unprocessableEntity(message = "Unprocessable entity") {
    return new ApiResponse(422, null, message);
  }

  static serverError(message = "Internal server error") {
    return new ApiResponse(500, null, message);
  }
}

export default ApiResponse;