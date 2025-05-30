/* eslint-disable @typescript-eslint/no-base-to-string */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';

import { Cache } from 'cache-manager';
import { TwitterConfig, ErrorResponse } from 'common';
import { type UserV2, ApiResponseError, TwitterApi } from 'twitter-api-v2';
import { TwitterService } from 'twitter/twitter.service';
import * as uuid from 'uuid';

import { PrismaService } from 'infra/database/prisma/prisma.service';

import { decodeRefreshToken, getToken } from 'utils';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly twitter: TwitterService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  private readonly twitterConfig = TwitterConfig;

  private client = new TwitterApi({
    clientId: this.twitterConfig.TWITTER_APP_CLIENT_ID,
    clientSecret: this.twitterConfig.TWITTER_APP_CLIENT_SECRET,
  });

  async refreshBackendToken(token: string) {
    const userData = await decodeRefreshToken(token);

    const currentTime = Math.floor(Date.now() / 1000);

    if (userData.exp < currentTime) {
      throw new ErrorResponse(
        HttpStatus.UNAUTHORIZED,
        'Refresh token has expired, please login',
      );
    }

    const twitterClient = await this.twitter.createTwitterClient(
      userData.account_id,
    );

    const { data } = await twitterClient.v2.me();

    const tokens = await this.prisma.userTwitterData.findUnique({
      where: { id: userData.account_id },
      select: {
        access_token: true,
        refresh_token: true,
      },
    });

    const backendToken = await getToken(
      userData.account_id,
      data.id,
      data.username,
    );

    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      backend_token: backendToken,
    };
  }

  async twitterLogin() {
    const { url, codeVerifier, state } = this.client.generateOAuth2AuthLink(
      this.twitterConfig.TWITTER_OAUTH_CALLBACK_URL,
      {
        scope: [
          'tweet.read',
          'tweet.write',
          'tweet.moderate.write',
          'users.read',
          'block.read',
          'block.write',
          'mute.read',
          'mute.write',
          'offline.access',
        ],
      },
    );

    const cacheId = uuid.v4();

    await this.cacheManager.set(
      cacheId,
      { codeVerifier, state },
      5 * 60 * 1000,
    );

    return {
      url,
      cache_id: cacheId,
    };
  }

  async twitterCallback(state: string, code: string, cache_id: string) {
    const cacheData = await this.cacheManager.get(cache_id);
    if (!cacheData)
      throw new ErrorResponse(HttpStatus.BAD_REQUEST, 'invalid cache id');

    const { codeVerifier, state: cachedState } = cacheData as {
      codeVerifier: string;
      state: string;
    };

    await this.cacheManager.del(cache_id);

    if (state !== cachedState)
      throw new ErrorResponse(
        HttpStatus.BAD_REQUEST,
        'State Token did not match!',
      );

    let userObject: UserV2;

    let loggedClient: TwitterApi;
    let accessToken: string;
    let refreshToken: string;
    let expiresIn: number;

    try {
      const result = await this.client.loginWithOAuth2({
        code,
        codeVerifier,
        redirectUri: this.twitterConfig.TWITTER_OAUTH_CALLBACK_URL,
      });

      loggedClient = result.client;
      accessToken = result.accessToken;
      refreshToken = result.refreshToken;
      expiresIn = result.expiresIn;

      const { data } = await loggedClient.v2.me();

      userObject = data;
    } catch (error) {
      if (error instanceof ApiResponseError) {
        if (error.code === 400)
          throw new ErrorResponse(
            error.code,
            `Invalid Request: One or more parameters to your request was invalid. Stack: ${error.errors}`,
          );
        else if (error.code === 429)
          throw new ErrorResponse(
            error.code,
            `Invalid Request: ${error.toJSON().error.detail}. ${error}`,
          );
      }

      throw new ErrorResponse(
        HttpStatus.INTERNAL_SERVER_ERROR,
        `An Error Occured. Stack: ${error}`,
      );
    }

    const expireTime = new Date(Date.now() + expiresIn * 1000);

    const user = await this.prisma.userTwitterData.upsert({
      where: { twitter_user_id: userObject.id },
      create: {
        twitter_user_id: userObject.id,
        twitter_username: userObject.username,
        access_token: accessToken,
        refresh_token: refreshToken,
        refresh_token_expire_time: expireTime,
      },
      update: {
        twitter_username: userObject.username,
        access_token: accessToken,
        refresh_token: refreshToken,
        refresh_token_expire_time: expireTime,
      },
    });

    const backendToken = await getToken(
      user.id,
      userObject.id,
      userObject.username,
    );

    return {
      twitter_user_id: userObject.id,
      twitter_username: userObject.username,
      access_token: accessToken,
      backend_token: backendToken,
      expire_in: `${expiresIn}s`,
    };
  }
}
