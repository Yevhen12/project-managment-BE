// src/payments/controllers/stripe.controller.ts

import {
  Controller,
  Post,
  Headers,
  Req,
  Res,
  RawBodyRequest,
  Inject,
} from '@nestjs/common';
import Stripe from 'stripe';
import { Response, Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { USERS_SERVICE } from '@/shared';

@Controller('stripe')
export class StripeController {
  private stripe: Stripe;

  constructor(
    private readonly configService: ConfigService,
    @Inject(USERS_SERVICE) private readonly usersService: ClientProxy,
  ) {
    this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY'));
  }

  @Post('webhook')
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Res() res: Response,
    @Headers('stripe-signature') signature: string,
  ) {
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        (req as any).body,
        signature,
        this.configService.get('STRIPE_WEBHOOK_SECRET'),
      );
    } catch (err) {
      console.error('Invalid Stripe signature:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;

      if (userId) {
        try {
          await this.usersService
            .send({ cmd: 'mark-user-premium' }, { userId })
            .toPromise();
          console.log(`User ${userId} marked as premium`);
        } catch (error) {
          console.error('Failed to mark user as premium:', error.message);
        }
      } else {
        console.warn('No userId found in session metadata.');
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.userId;

      if (userId) {
        try {
          await this.usersService
            .send({ cmd: 'mark-user-not-premium' }, { userId })
            .toPromise();
          console.log(
            `User ${userId} marked as NOT premium (subscription deleted)`,
          );
        } catch (error) {
          console.error('Failed to mark user as not premium:', error.message);
        }
      }
    }

    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      const subscription = invoice.subscription as string;

      if (subscription) {
        const sub = await this.stripe.subscriptions.retrieve(subscription);
        const userId = sub.metadata?.userId;

        if (userId) {
          await this.usersService
            .send({ cmd: 'mark-user-not-premium' }, { userId })
            .toPromise();
          console.log(`User ${userId} marked as NOT premium (payment failed)`);
        }
      }
    }

    return res.sendStatus(200);
  }
}
