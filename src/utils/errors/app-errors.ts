import { HttpException, HttpStatus } from '@nestjs/common';

export abstract class AppError extends Error {
  abstract toHTTPResponse(): HttpException;
}

export class AppErrorBadRequest extends AppError {
  toHTTPResponse() {
    return new HttpException(this.message, HttpStatus.BAD_REQUEST);
  }
}

export class AppErrorTooManyRequests extends AppError {
  toHTTPResponse() {
    return new HttpException(this.message, HttpStatus.TOO_MANY_REQUESTS);
  }
}

export class AppErrorUnauthorized extends AppError {
  toHTTPResponse() {
    return new HttpException(this.message, HttpStatus.UNAUTHORIZED);
  }
}

export class AppErrorForbidden extends AppError {
  toHTTPResponse() {
    return new HttpException(this.message, HttpStatus.FORBIDDEN);
  }
}

export class AppErrorNotFound extends AppError {
  toHTTPResponse() {
    return new HttpException(this.message, HttpStatus.NOT_FOUND);
  }
}

export class AppErrorMethodNotAllowed extends AppError {
  toHTTPResponse() {
    return new HttpException(this.message, HttpStatus.METHOD_NOT_ALLOWED);
  }
}

export class AppErrorConflict extends AppError {
  toHTTPResponse() {
    return new HttpException(this.message, HttpStatus.CONFLICT);
  }
}

export class AppErrorUnprocessableEntity extends AppError {
  toHTTPResponse() {
    return new HttpException(this.message, HttpStatus.UNPROCESSABLE_ENTITY);
  }
}

export class AppErrorInternal extends AppError {
  toHTTPResponse() {
    return new HttpException(this.message, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

export class AppErrorNotImplemented extends AppError {
  toHTTPResponse() {
    return new HttpException(this.message, HttpStatus.NOT_IMPLEMENTED);
  }
}

export class AppErrorServiceUnavailable extends AppError {
  toHTTPResponse() {
    return new HttpException(this.message, HttpStatus.SERVICE_UNAVAILABLE);
  }
}

export class AppErrorImATeapot extends AppError {
  toHTTPResponse(): HttpException {
    return new HttpException(this.message, HttpStatus.I_AM_A_TEAPOT);
  }
}
