import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { NatsModule } from 'src/transports/nats.module';

@Module({
  controllers: [PaymentsController ],
  providers: [ PaymentsService ],
  imports: [
    NatsModule,
  ]
})
export class PaymentsModule {}
