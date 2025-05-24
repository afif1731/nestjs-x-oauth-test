import { Module } from '@nestjs/common';

import { PrismaService } from 'infra/database/prisma/prisma.service';

import { TwitterService } from './twitter.service';

@Module({
  providers: [TwitterService, PrismaService],
})
export class TwitterModule {}
