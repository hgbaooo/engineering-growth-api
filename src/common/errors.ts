import { HttpException, HttpStatus } from '@nestjs/common';

export class AppException extends HttpException {
  constructor(status: HttpStatus, code: string, message: string, details?: Record<string, unknown>) {
    super({ error: { code, message, ...(details ? { details } : {}) } }, status);
  }
}

export const notFound = (resource: string) => new AppException(HttpStatus.NOT_FOUND, 'NOT_FOUND', `${resource} was not found.`);
export const conflict = (message: string) => new AppException(HttpStatus.CONFLICT, 'CONFLICT', message);
export const invalidMove = () => new AppException(HttpStatus.CONFLICT, 'INVALID_MOVE', 'This item cannot be moved further.');
