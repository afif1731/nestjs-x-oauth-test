import { Controller, Get, HttpStatus, Query, UseGuards } from '@nestjs/common';

import { GET_USER, JwtGuard, SuccessResponse } from 'common';

import { StatisticFilter } from './interface';
import { StatisticService } from './statistic.service';

@Controller('statistic')
export class StatisticController {
  constructor(private readonly statisticService: StatisticService) {}

  @UseGuards(JwtGuard)
  @Get('muted-monthly')
  async getMutedTweetStatistic(
    @GET_USER('id') user_id: string,
    @Query('filter') filter?: string,
  ) {
    const cleanedFilter =
      typeof filter === 'string' &&
      Object.values(StatisticFilter).includes(filter)
        ? filter
        : undefined;
    const result = await this.statisticService.getMutedTweetMonthly(
      user_id,
      cleanedFilter,
    );

    return new SuccessResponse(
      HttpStatus.OK,
      'monthly muted statistic received successfully',
      result,
    );
  }

  @UseGuards(JwtGuard)
  @Get('muted-user')
  async getMutedUserStatistic(
    @GET_USER('id') user_id: string,
    @Query('filter') filter?: string,
  ) {
    const cleanedFilter =
      typeof filter === 'string' &&
      Object.values(StatisticFilter).includes(filter)
        ? filter
        : undefined;
    const result = await this.statisticService.getMutedUser(
      user_id,
      cleanedFilter,
    );

    return new SuccessResponse(
      HttpStatus.OK,
      'user muted statistic received successfully',
      result,
    );
  }
}
