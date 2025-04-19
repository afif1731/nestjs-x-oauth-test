import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';

import { AccessTokenStrategy } from 'common';

import { PrismaService } from 'infra/database/prisma/prisma.service';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, PrismaService, AccessTokenStrategy],
  exports: [AuthService],
  imports: [CacheModule.register()],
})
export class AuthModule {}
