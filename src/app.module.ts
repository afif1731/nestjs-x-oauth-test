/* eslint-disable @typescript-eslint/require-await */
import path from 'node:path';

import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ServeStaticModule } from '@nestjs/serve-static';

import { createKeyv } from '@keyv/redis';
import { JwtConfig, RedisConfig } from 'common';

import { PrismaService } from 'infra/database/prisma/prisma.service';

import { AuthModule } from './auth/auth.module';
import { ManageTweetModule } from './manage-tweet/manage-tweet.module';

@Module({
  imports: [
    CacheModule.registerAsync({
      useFactory: async () => ({
        stores: [
          createKeyv(
            `redis://${
              process.env.ENV == 'production'
                ? RedisConfig.production.REDIS_HOST
                : RedisConfig.development.REDIS_HOST
            }:${
              process.env.ENV == 'production'
                ? RedisConfig.production.REDIS_PORT
                : RedisConfig.development.REDIS_PORT
            }`,
          ),
        ],
      }),
    }),
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.register({
      secret: JwtConfig.JWT_ACCESS_SECRET,
      signOptions: { expiresIn: JwtConfig.JWT_EXPIRES_IN },
      global: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: path.join(process.cwd(), 'uploads'),
      exclude: ['/api/(.*)'],
      serveRoot: '/uploads',
    }),
    ManageTweetModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}
