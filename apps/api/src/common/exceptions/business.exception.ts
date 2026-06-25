import { HttpException, HttpStatus } from '@nestjs/common';

export class BusinessException extends HttpException {
  constructor(
    public readonly code: string,
    message?: string,
    status: number = HttpStatus.BAD_REQUEST,
  ) {
    super(message ?? code, status);
  }
}
