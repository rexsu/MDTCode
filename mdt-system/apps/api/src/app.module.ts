import { Module } from '@nestjs/common';
import { TasksModule } from './tasks/tasks.module';
import { PrismaModule } from './prisma/prisma.module';
import { EventsModule } from './events/events.module';

@Module({
  imports: [
    PrismaModule,
    EventsModule,
    TasksModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
