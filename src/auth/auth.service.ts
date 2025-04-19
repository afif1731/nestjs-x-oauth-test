import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';

import { Cache } from 'cache-manager';
import { TwitterConfig, ErrorResponse } from 'common';
import { TwitterApi } from 'twitter-api-v2';
import * as uuid from 'uuid';

import { PrismaService } from 'infra/database/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  private readonly twitterConfig = TwitterConfig;

  // private readonly salt = genSaltSync(12);

  private client = new TwitterApi({
    clientId: this.twitterConfig.TWITTER_APP_CLIENT_ID,
    clientSecret: this.twitterConfig.TWITTER_APP_CLIENT_SECRET,
  });

  // async login(data: LoginDto) {
  //   const isUserExist = await this.findUserByEmail(data.email);

  //   if (!isUserExist)
  //     throw new ErrorResponse(HttpStatus.NOT_FOUND, 'account not found');
  //   if (!isUserExist.is_active)
  //     throw new ErrorResponse(
  //       HttpStatus.FORBIDDEN,
  //       'this account is not activated yet',
  //     );

  //   const isPasswordMatch = compareSync(data.password, isUserExist.password);
  //   if (!isPasswordMatch)
  //     throw new ErrorResponse(HttpStatus.FORBIDDEN, 'invalid credential');

  //   const accessToken = await getToken(
  //     isUserExist.id,
  //     isUserExist.email,
  //     isUserExist.role,
  //   );

  //   return { token: accessToken };
  // }

  // async register(data: RegisterDto) {
  //   const isUserExist = await this.findUserByEmail(data.email);

  //   if (isUserExist)
  //     throw new ErrorResponse(
  //       HttpStatus.BAD_REQUEST,
  //       'email already registered',
  //     );

  //   if (data.password !== data.confirm_password)
  //     throw new ErrorResponse(
  //       HttpStatus.UNPROCESSABLE_ENTITY,
  //       'password is not matched',
  //     );

  //   const encryptedPassword = await hash(data.password, this.salt);

  //   const newAccount = await this.prisma.accounts.create({
  //     data: {
  //       email: data.email,
  //       username: data.username,
  //       password: encryptedPassword,
  //     },
  //   });

  //   return {
  //     username: newAccount.username,
  //     email: newAccount.email,
  //   };
  // }

  // async me(user_id: string, user_role: Role) {
  //   const user = await this.prisma.accounts.findUnique({
  //     where: { id: user_id },
  //     select: {
  //       id: true,
  //       username: true,
  //       email: true,
  //       role: true,
  //       created_at: user_role === 'USER',
  //     },
  //   });

  //   return user;
  // }

  // async findUserByEmail(email: string) {
  //   return await this.prisma.accounts.findUnique({
  //     where: { email },
  //   });
  // }

  // async verifyToken(token: string, email: string) {
  //   let tokenPayload;

  //   try {
  //     tokenPayload = await verifyEmailToken(token);

  //     // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //   } catch (error: any) {
  //     const errorResult =
  //       // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  //       error.name == 'TokenExpiredError'
  //         ? new ErrorResponse(HttpStatus.BAD_REQUEST, 'token expired')
  //         : new ErrorResponse(HttpStatus.BAD_REQUEST, 'invalid token');

  //     throw errorResult;
  //   }

  //   const isUserExist = await this.findUserByEmail(tokenPayload.email);

  //   if (!isUserExist)
  //     throw new ErrorResponse(HttpStatus.NOT_FOUND, 'email not found');

  //   if (
  //     isUserExist.id !== tokenPayload.id ||
  //     email !== isUserExist.email ||
  //     email !== tokenPayload.email
  //   )
  //     throw new ErrorResponse(HttpStatus.BAD_REQUEST, 'invalid token');

  //   return isUserExist;
  // }

  async twitterLogin() {
    const { url, codeVerifier, state } = this.client.generateOAuth2AuthLink(
      this.twitterConfig.TWITTER_OAUTH_CALLBACK_URL,
      { scope: ['tweet.read', 'users.read', 'offline.access'] },
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

    const {
      client: loggedClient,
      accessToken,
      refreshToken,
      expiresIn,
    } = await this.client.loginWithOAuth2({
      code,
      codeVerifier,
      redirectUri: this.twitterConfig.TWITTER_OAUTH_CALLBACK_URL,
    });

    const { data: userObject } = await loggedClient.v2.me();

    const expireTime = new Date(Date.now() + expiresIn * 1000);

    await this.prisma.userTwitterData.upsert({
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
      },
    });

    return {
      twitter_user_id: userObject.id,
      twitter_username: userObject.username,
      access_token: accessToken,
      refresh_token: refreshToken,
      expire_in: `${expiresIn}s`,
    };
  }
}
