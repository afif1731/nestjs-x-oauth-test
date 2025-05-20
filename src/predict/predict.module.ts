import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { PrismaService } from 'infra/database/prisma/prisma.service';

import { PredictController } from './predict.controller';
import { PredictService } from './predict.service';

@Module({
  controllers: [PredictController],
  providers: [PredictService, PrismaService],
  imports: [HttpModule],
})
export class PredictModule {}
