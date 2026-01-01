import { Module, Global } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { FunAsrService } from './funasr.service';
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [EventsGateway, FunAsrService],
  exports: [EventsGateway],
})
export class EventsModule {}
