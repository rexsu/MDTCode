import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TasksModule } from './tasks/tasks.module';
import { PrismaModule } from './prisma/prisma.module';
import { EventsModule } from './events/events.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 设置为全局模块，无需在每个模块中导入
      envFilePath: ['.env'], // 显式指定 .env 文件路径（虽然默认也是这个，但显式更安全）
    }),
    PrismaModule,
    EventsModule,
    TasksModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
