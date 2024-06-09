import { HttpStatus } from '@nestjs/common';

export const DEFAULT_ERROR = Object.freeze({
  message: 'Unknown error',
  statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
  error: 'Internal Server Error :(',
});
