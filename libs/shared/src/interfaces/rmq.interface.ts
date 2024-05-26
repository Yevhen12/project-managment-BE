import { RmqOptions } from '@nestjs/microservices';

export interface RmqServiceInterface {
  getRmqOptions(queue: string): RmqOptions;
}
