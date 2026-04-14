import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentSessionDto } from './dto/payment-session.dto';
import type { Request, Response } from 'express';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-payment-session')
  createPaymentSession(@Body( ) paymentSessionDto: PaymentSessionDto) {
    return this.paymentsService.createPaymentSession(paymentSessionDto);
  }

  @Get('success')
  success() {
    return {
      ok: true,
      message: 'Payment successful',
    }
  }

  @Get('cancel')
  cancel() {
    return {
      ok: true,
      message: 'Payment cancelled',
    }
  }

  // Tomo la req y res directamente (de express) porque stripe pide Raw-Body
  @Post('webhook')
  async webhook(@Req() req: Request, @Res() res: Response) {
    
    // En desarrollo, utilizo el cli para el forwarding del webhook
    // docker run --rm -it -v ~/.config/stripe:/root/.config/stripe stripe/stripe-cli:latest listen --forward-to http://172.17.0.1:3003/api/payments/webhook
    
    // Para disparar manualmente el trigger que lanza la petición al webhook, se puede hacer:
    // docker run --rm -it -v ~/.config/stripe:/root/.config/stripe stripe/stripe-cli:latest trigger payment_intent.succeeded

    // console.log('stripe-webhook called');
    return this.paymentsService.stripeWebhookPaymentHandler(req, res)
  }
}
