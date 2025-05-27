import { StripeService } from '../services/stripe.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PaymentsService {
  constructor(private readonly stripeService: StripeService) {}

  async subscribe(userId: string) {
    const session = await this.stripeService.createCheckoutSession(userId);
    return { url: session.url };
  }
}
