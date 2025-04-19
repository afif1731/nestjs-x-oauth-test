/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/require-await */
import { JwtService } from '@nestjs/jwt';

import { type Role } from '@prisma/client';

import { JwtConfig } from '../common';

export async function getToken(
  account_id: string,
  email: string,
  role: string,
) {
  const jwt = new JwtService();
  const payload = {
    account_id,
    email,
    role,
  };

  const accessToken = await jwt.signAsync(payload, {
    secret: JwtConfig.JWT_ACCESS_SECRET,
    expiresIn: JwtConfig.JWT_EXPIRES_IN,
  });

  return accessToken;
}

export async function verifyToken(token: string): Promise<{
  account_id: string;
  email: string;
  role: Role;
}> {
  const jwt = new JwtService();

  return jwt.verifyAsync(token, {
    secret: JwtConfig.JWT_ACCESS_SECRET,
  });
}

export async function generateMailToken(email: string, account_id: string) {
  const jwt = new JwtService();

  const token = await jwt.signAsync(
    { email, id: account_id },
    {
      secret: JwtConfig.JWT_ACCOUNT_ACTIVATE_SECRET,
      expiresIn: '1h',
    },
  );

  return token;
}

export async function verifyEmailToken(
  email_token: string,
): Promise<{ email: string; id: string }> {
  const jwt = new JwtService();

  const payload = jwt.verifyAsync(email_token, {
    secret: JwtConfig.JWT_ACCOUNT_ACTIVATE_SECRET,
  });

  return payload;
}

export async function generateResetPasswordToken(
  email: string,
  account_id: string,
) {
  const jwt = new JwtService();

  const token = jwt.sign(
    { email, id: account_id },
    {
      secret: JwtConfig.JWT_ACCOUNT_ACTIVATE_SECRET,
      expiresIn: JwtConfig.JWT_EXPIRES_IN,
    },
  );

  return token;
}
