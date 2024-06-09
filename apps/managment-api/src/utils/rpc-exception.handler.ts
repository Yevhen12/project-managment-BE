import { HttpException, HttpStatus } from '@nestjs/common';

interface RpcError {
  message: string;
  statusCode: number;
  error: string;
}

export class RpcErrorToHttpException extends HttpException {
  constructor(rpcError: RpcError) {
    super(rpcError, rpcError.statusCode || HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
