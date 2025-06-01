import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import Stripe from 'stripe';
import { USERS_SERVICE } from '@/shared';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(
    @Inject(USERS_SERVICE) private readonly usersService: ClientProxy,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  }

  async createCheckoutSession(userId: string) {
    const isPremium = await firstValueFrom(
      this.usersService.send({ cmd: 'check-user-premium' }, { userId }),
    );

    if (isPremium) {
      throw new BadRequestException('User already has a premium subscription');
    }

    return await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID!,
          quantity: 1,
        },
      ],
      metadata: { userId },
      success_url: 'http://localhost:3005/subscription/success',
      cancel_url: 'http://localhost:3005/subscription/cancel',
    });
  }
}
