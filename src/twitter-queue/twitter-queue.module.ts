import { BullModule } from '@nestjs/bull';
import { Global, Module } from '@nestjs/common';

import { RedisConfig } from 'common';
import { TwitterService } from 'twitter/twitter.service';

import { PrismaService } from 'infra/database/prisma/prisma.service';

import { TwitterQueueProcessor } from './twitter-queue.processor';
import { TwitterQueueService } from './twitter-queue.service';

@Global()
@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host:
          process.env.ENV == 'production'
            ? RedisConfig.production.REDIS_HOST
            : RedisConfig.development.REDIS_HOST,
        port:
          process.env.ENV == 'production'
            ? RedisConfig.production.REDIS_PORT
            : RedisConfig.development.REDIS_PORT,
      },
    }),
    BullModule.registerQueue({
      name: 'twitter-call-queue',
    }),
  ],
  providers: [
    TwitterQueueService,
    TwitterQueueProcessor,
    TwitterService,
    PrismaService,
  ],
  exports: [TwitterQueueService, BullModule],
})
export class TwitterQueueModule {}
