import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    if (exception instanceof HttpException) {
      const body = exception.getResponse();
      if (typeof body === 'object' && body !== null && 'error' in body) {
        response.status(exception.getStatus()).json(body);
        return;
      }
      const messages = typeof body === 'object' && body !== null && 'message' in body ? (body as { message?: unknown }).message : undefined;
      response.status(exception.getStatus()).json({
        error: {
          code: exception.getStatus() === HttpStatus.BAD_REQUEST ? 'VALIDATION_ERROR' : 'HTTP_ERROR',
          message: Array.isArray(messages) ? 'Invalid request' : (messages as string | undefined) ?? 'Request failed',
          ...(Array.isArray(messages) ? { details: { messages } } : {})
        }
      });
      return;
    }
    this.logger.error(exception);
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' } });
  }
}
