import { Controller, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @MessagePattern({ cmd: 'subcribe' })
  testCall(@Payload() payload: { id: string }) {
    return this.paymentsService.subscribe(payload.id);
  }
}
