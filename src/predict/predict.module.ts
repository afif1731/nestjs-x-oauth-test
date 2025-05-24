import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { TwitterService } from 'twitter/twitter.service';

import { PrismaService } from 'infra/database/prisma/prisma.service';

import { PredictController } from './predict.controller';
import { PredictService } from './predict.service';

@Module({
  controllers: [PredictController],
  providers: [PredictService, PrismaService, TwitterService],
  imports: [HttpModule],
})
export class PredictModule {}
