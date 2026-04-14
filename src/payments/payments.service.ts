import { Injectable } from "@nestjs/common";
import Stripe from "node_modules/stripe/esm/stripe.esm.node";
import { envs } from "src/config/envs";
import { PaymentSessionDto, PaymentSessionItemDto } from "./dto/payment-session.dto";
import { Request, response, Response } from "express";

@Injectable()
export class PaymentsService {
    private readonly stripe = new Stripe(envs.stripeSecret);

    async createPaymentSession(paymentSessionDto: PaymentSessionDto) {

        const { currency, items, orderId } = paymentSessionDto;

        const line_items = items.map((item) => ({
            price_data: {
                currency: currency,
                product_data: {
                    name: item.name,
                },
                // stripe cobra en céntimos 1200 son $12.00
                unit_amount: Math.round(item.price * 100),
            },
            quantity: item.quantity,
        }))

        const session = await this.stripe.checkout.sessions.create({
            payment_intent_data: {
                metadata: {
                    orderId: orderId,
                }
            },
            line_items: line_items,
            mode: `payment`,
            success_url: 'http://nodedev:3003/api/payments/success',
            cancel_url: 'http://nodedev:3003/api/payments/cancel',
        });
        return session;
    }

    async stripeWebhookPaymentHandler(req: Request, res: Response) {
        const sig = req.headers['stripe-signature'] || '';
        
        let event: Stripe.Event;

        // Para testing: recuerda que al levantarlo con
        // docker run --rm -it -v ~/.config/stripe:/root/.config/stripe stripe/stripe-cli:latest listen --forward-to http://172.17.0.1:3003/api/payments/webhook
        // Obtienes este endpoingSecret
        const endpointSecret = 'whsec_fccadb4c824ec53a30b644de4c00bc387995f692786d131c6b46600585f003c5'

        // Para prod, cuando añades un webhook en stripe, te da el Signing secret (que no es el STRIPE_SECRET)
        // const endpointSecret = ''

        try {
            event = this.stripe.webhooks.constructEvent(req['rawBody'], sig, endpointSecret)
        } catch (error) {
            if (error instanceof Error) {
                console.log(`Este es el error: ${error.message}`)
                return res.status(400).send(`Webhook Error: ${error.message}`);
            }
            return res.status(400).send(`Webhook Error`);
        }

        switch( event.type ){
            case 'charge.succeeded':
                //TODO: llamar microservicio
                const chargeSucceded = event.data.object;
                console.log({ 
                    sig,
                    event, 
                    metadata: chargeSucceded.metadata,
                });
                break;
            default:
                // En el caso del resto de eventos no hay nada que hacer
                console.log(`Event \'${event.type}\' not handled`);
                
        }
        return res.status(200).json({
            sig,
        })
    }
}