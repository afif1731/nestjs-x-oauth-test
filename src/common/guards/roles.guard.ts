/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

import { type Role } from '@prisma/client';

import { PrismaService } from 'infra/database/prisma/prisma.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request = this.getRequest(context);

    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Permission denied');
    }

    const user = await this.validate(token);

    return requiredRoles.some(role => user.role.includes(role));
  }

  async validate(
    token: string,
  ): Promise<{ user_id: string; email: string; role: string }> {
    const decodedToken: any = this.jwt.decode(token);

    if (!decodedToken) {
      return null;
    }

    const user = await this.prisma.accounts.findUnique({
      where: {
        email: decodedToken.email,
      },
    });

    if (!user) {
      throw new ForbiddenException('You are not allowed to access this route');
    }

    return {
      user_id: user.id,
      email: user.email,
      role: decodedToken.role,
    };
  }

  extractToken(request: any): string {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return null;
    }

    return authHeader.split(' ')[1];
  }

  getRequest(context: ExecutionContext) {
    return context.switchToHttp().getRequest();
  }
}
