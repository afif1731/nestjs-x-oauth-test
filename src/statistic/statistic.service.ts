/* eslint-disable unicorn/no-nested-ternary */
import { HttpStatus, Injectable } from '@nestjs/common';

import { Prisma } from '@prisma/client';
import { ErrorResponse } from 'common';
import { format } from 'date-fns';
import * as uuid from 'uuid';
import { fakerID_ID } from '@faker-js/faker';

import { PrismaService } from 'infra/database/prisma/prisma.service';

@Injectable()
export class StatisticService {
  constructor(private readonly prisma: PrismaService) {}

  async getMutedTweetMonthly(user_id: string, filter?: string) {
    const isUserExist = await this.prisma.userTwitterData.findFirst({
      where: { id: user_id },
    });

    if (!isUserExist)
      throw new ErrorResponse(HttpStatus.BAD_REQUEST, 'user not found');

    const result = await this.prisma.$queryRaw<
      Array<{ month: string; year: number; count: bigint }>
    >(
      Prisma.sql`
        SELECT 
          EXTRACT(MONTH FROM "created_at") AS month,
          EXTRACT(YEAR FROM "created_at") AS year,
          COUNT(*) AS count
        FROM "userTwitterMuted"
        WHERE "author_id" = ${user_id}
        ${
          filter === 'sexual_harassment'
            ? Prisma.sql`AND "is_sexual_harassment" = true`
            : filter === 'hate_speech'
              ? Prisma.sql`AND "is_hate_speech" = true`
              : Prisma.empty
        }
        GROUP BY year, month
        ORDER BY year ASC, month ASC
        LIMIT 12;
      `,
    );

    const formattedResult = result.map(row => {
      const date = new Date(Number(row.year), Number(row.month) - 1);

      return {
        month: format(date, 'MMMM yyyy'),
        amount: Number(row.count),
      };
    });

    if (formattedResult.length < 12) {
      let fakeData = this.generateFakeTweetData(
        result.length === 0 ? 2025 : Number(result[0].year),
        result.length === 0 ? 5 : Number(result[0].month),
        12 - formattedResult.length,
      );
      fakeData.push(...formattedResult);

      return fakeData;
    }

    return formattedResult;
  }

  async getMutedUser(user_id: string, filter?: string) {
    const isUserExist = await this.prisma.userTwitterData.findFirst({
      where: { id: user_id },
    });

    if (!isUserExist)
      throw new ErrorResponse(HttpStatus.BAD_REQUEST, 'user not found');

    const data = await this.prisma.userTwitterMuted.findMany({
      where: {
        AND: [
          { author_id: user_id },
          {
            is_sexual_harassment:
              filter === 'sexual_harassment' ? true : undefined,
          },
          { is_hate_speech: filter === 'hate_speech' ? true : undefined },
        ],
      },
      select: {
        blocked_user_id: true,
        blocked_tweet_id: true,
        blocked_username: true,
        created_at: true,
      },
      orderBy: {
        created_at: 'asc',
      },
    });

    if (data.length < 20) {
      let fakeData = this.generateFakeUserData(
        data.length === 0
          ? new Date(Date.now())
          : data[data.length - 1].created_at,
        20 - data.length,
      );
      fakeData.push(...data);

      return fakeData;
    }

    return data;
  }

  generateFakeTweetData(lastYear: number, lastMonth: number, amount: number) {
    let result: { month: string; amount: number }[] = [];
    let year: number = lastYear;
    let month: number = lastMonth - 1;

    if (month === 0) {
      year--;
      month = 12;
    }

    for (let i = 0; i < amount; i++) {
      const date = new Date(Number(year), Number(month) - 1);
      const fakeAmount = Math.ceil(Math.random() * 10000 + 100) % 50000;

      result.push({
        month: format(date, 'MMMM yyyy'),
        amount: fakeAmount,
      });

      month--;

      if (month === 0) {
        year--;
        month = 12;
      }
    }

    return result.reverse();
  }

  generateFakeUserData(lastTime: Date, amount: number) {
    let result: {
      blocked_user_id: string;
      blocked_tweet_id: string;
      blocked_username: string;
      created_at: Date;
    }[] = [];
    let time: Date = new Date(lastTime);

    for (let i = 0; i < amount; i++) {
      time = new Date(time.getTime() - (Math.ceil(Math.random() * 1000) % 50));

      result.push({
        blocked_tweet_id: uuid.v4(),
        blocked_user_id: uuid.v4(),
        blocked_username: `${fakerID_ID.person.firstName()}${fakerID_ID.person.lastName()}`,
        created_at: time,
      });
    }

    return result.reverse();
  }
}
