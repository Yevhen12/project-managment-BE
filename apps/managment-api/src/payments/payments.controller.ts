import {
  AuthGuard,
  PAYMENTS_SERVICE,
  UpdateUserProfileDto,
  UserRequest,
  USERS_SERVICE,
} from '@/shared';
import {
  Body,
  Controller,
  Get,
  Inject,
  Patch,
  Post,
  Req,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller('payments')
export class PaymentsController {
  constructor(
    @Inject(PAYMENTS_SERVICE) private readonly paymentsService: ClientProxy,
  ) {}

  @UseGuards(AuthGuard)
  @Post('subscribe')
  async subscribe(@Req() req: UserRequest) {
    const userId = req.user.id;

    console.log('323232323', userId);
    const session = await firstValueFrom(
      this.paymentsService.send({ cmd: 'subcribe' }, { id: userId }),
    );

    return {
      status: 200,
      data: session,
      message: 'Stripe checkout session created',
    };
  }
}
