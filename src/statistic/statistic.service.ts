/* eslint-disable unicorn/no-nested-ternary */
import { HttpStatus, Injectable } from '@nestjs/common';

import { Prisma } from '@prisma/client';
import { ErrorResponse } from 'common';
import { format } from 'date-fns';

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

    return data;
  }
}
