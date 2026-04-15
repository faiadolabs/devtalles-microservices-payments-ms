import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { envs } from './config/envs';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const logger = new Logger('Main-Payments');

  const app = await NestFactory.create(AppModule, {
    // Necesario para stripe: envía el body como un buffer
    rawBody: true,
  });

  app.setGlobalPrefix('api');

  // Configuración global de pipes
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
  })
  );

  //! Nota importante: para que se valide el DTO también por @MessagePattern hay que realizar
  //! en "main.ts" esta configuración ({ inheritAppConfig: true }) que está aquí documentado:
  //! https://docs.nestjs.com/faq/hybrid-application#sharing-configuration
  //! Retornará un http 500 cuando no pueda validar el DTO
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.NATS,
    options: {
      servers: envs.natsServers,
    }
  }, 
  { inheritAppConfig: true },
)

  await app.startAllMicroservices();
  await app.listen(envs.port);

  logger.log(`Payments running on port ${envs.port}`);
}
bootstrap();
