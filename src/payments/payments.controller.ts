import { Body, Controller, Get, Logger, Post, Req, Res } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentSessionDto } from './dto/payment-session.dto';
import type { Request, Response } from 'express';
import { MessagePattern } from '@nestjs/microservices';

@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger('Controller-Payments');

  constructor(private readonly paymentsService: PaymentsService) {}

  // Podría mantener el @Post, pero solo me va a valer para invocar esto desde Insomnia
  // Ya que será otro microservicio quien envíe un mensaje a NATS y no será usando la RestFullApi
  //! Nota importante: para que se valide el DTO también por @MessagePattern hay que realizar
  //! en "main.ts" esta configuración ({ inheritAppConfig: true }) que está aquí documentado:
  //! https://docs.nestjs.com/faq/hybrid-application#sharing-configuration
  //! Retornará un http 500 cuando no pueda validar el DTO
  @Post('create-payment-session')
  @MessagePattern('create.payment.session')
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
    this.logger.debug("Se recibe un webhook");

    // En desarrollo, lanzo la cli y hago login, generando un token que luego me valdrá para lanzar listen y trigger
    // docker run --rm -it -v ~/.config/stripe:/root/.config/stripe stripe/stripe-cli:latest login

    // En desarrollo, utilizo el cli para el forwarding del webhook
    // docker run --rm -it -v ~/.config/stripe:/root/.config/stripe stripe/stripe-cli:latest listen --forward-to http://172.17.0.1:3003/api/payments/webhook
    
    // Para disparar manualmente el trigger que lanza la petición al webhook, se puede hacer:
    // docker run --rm -it -v ~/.config/stripe:/root/.config/stripe stripe/stripe-cli:latest trigger payment_intent.succeeded

    // console.log('stripe-webhook called');
    return this.paymentsService.stripeWebhookPaymentHandler(req, res)
  }
}
