import { Module } from '@nestjs/common';

import { PrismaService } from 'infra/database/prisma/prisma.service';

import { StatisticController } from './statistic.controller';
import { StatisticService } from './statistic.service';

@Module({
  controllers: [StatisticController],
  providers: [StatisticService, PrismaService],
})
export class StatisticModule {}
