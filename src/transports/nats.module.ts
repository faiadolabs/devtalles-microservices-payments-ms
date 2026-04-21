import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { envs } from 'src/config/envs';
import { NATS_SERVICE } from './config/services';


@Module({
    
    // Los módulos van en los imports
    imports: [
      ClientsModule.register([
        { 
          name: NATS_SERVICE, 
          transport: Transport.NATS,
          options: {
            servers: envs.natsServers,
          }
        },
      ]),
    ],
    exports: [
        ClientsModule.register([
            { 
              name: NATS_SERVICE, 
              transport: Transport.NATS,
              options: {
                servers: envs.natsServers,
              }
            },
          ]),
    ]
})
export class NatsModule {}
