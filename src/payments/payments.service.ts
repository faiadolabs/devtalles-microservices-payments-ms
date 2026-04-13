import { Injectable } from "@nestjs/common";
import Stripe from "node_modules/stripe/esm/stripe.esm.node";
import { envs } from "src/config/envs";

@Injectable()
export class PaymentsService {
    private readonly stripe = new Stripe(envs.stripeSecret);
    
    async createPaymentSession() {
      const session = await this.stripe.checkout.sessions.create({
        payment_intent_data: {
            metadata: {}
        },
        line_items: [
            {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: 'Camiseta'
                    },
                    unit_amount: 1200,
                },
                quantity: 2,
            }
        ],
        mode: `payment`,
        success_url: 'http://nodedev:3003/api/payments/success',
        cancel_url: 'http://nodedev:3003/api/payments/cancel',
      });
      return session;
    }
}