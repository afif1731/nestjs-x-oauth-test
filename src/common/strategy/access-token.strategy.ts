/* eslint-disable @darraghor/nestjs-typed/injectable-should-be-provided */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';

import { JwtConfig } from 'common';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { PrismaService } from 'infra/database/prisma/prisma.service';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: JwtConfig.JWT_ACCESS_SECRET,
    });
  }

  async validate(payload: { account_id: string; email: string; role: string }) {
    return await this.prisma.accounts.findUnique({
      where: {
        id: payload.account_id,
        email: payload.email,
      },
    });
  }
}
