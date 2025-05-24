/* eslint-disable @typescript-eslint/no-floating-promises */
import { HttpStatus, Injectable } from '@nestjs/common';

import { TwitterApiAutoTokenRefresher } from '@twitter-api-v2/plugin-token-refresher';
import { ErrorResponse, TwitterConfig } from 'common';
import { TwitterApi } from 'twitter-api-v2';

import { PrismaService } from 'infra/database/prisma/prisma.service';

@Injectable()
export class TwitterService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly twitterConfig = TwitterConfig;

  async createTwitterClient(user_id: string) {
    const userData = await this.prisma.userTwitterData.findUnique({
      where: { id: user_id },
    });

    if (!userData)
      throw new ErrorResponse(HttpStatus.BAD_REQUEST, 'user not found');

    const autoRefresherPlugin = new TwitterApiAutoTokenRefresher({
      refreshToken: userData.refresh_token,
      refreshCredentials: {
        clientId: this.twitterConfig.TWITTER_APP_CLIENT_ID,
        clientSecret: this.twitterConfig.TWITTER_APP_CLIENT_SECRET,
      },
      onTokenUpdate: token => {
        this.prisma.userTwitterData.update({
          where: {
            id: user_id,
          },
          data: {
            access_token: token.accessToken,
            refresh_token: token.refreshToken,
            refresh_token_expire_time: token.expiresIn
              ? new Date(Date.now() + token.expiresIn * 1000)
              : undefined,
          },
        });
      },
    });

    return new TwitterApi(userData.access_token, {
      plugins: [autoRefresherPlugin],
    });
  }
}
