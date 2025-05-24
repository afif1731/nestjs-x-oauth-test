/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/require-await */
import { JwtService } from '@nestjs/jwt';

import { JwtConfig } from '../common';

export async function getToken(
  account_id: string,
  twitter_user_id: string,
  twitter_username: string,
) {
  const jwt = new JwtService();
  const payload = {
    account_id,
    twitter_user_id,
    twitter_username,
  };

  const refreshToken = await jwt.signAsync(payload, {
    secret: JwtConfig.JWT_REFRESH_SECRET,
    expiresIn: JwtConfig.JWT_EXPIRES_IN,
  });

  return refreshToken;
}

export async function verifyToken(token: string): Promise<{
  account_id: string;
  twitter_user_id: string;
  twitter_username: string;
}> {
  const jwt = new JwtService();

  return jwt.verifyAsync(token, {
    secret: JwtConfig.JWT_ACCESS_SECRET,
  });
}

export async function decodeRefreshToken(token: string): Promise<{
  account_id: string;
  twitter_user_id: string;
  twitter_username: string;
  exp: number;
}> {
  const jwt = new JwtService();

  return jwt.decode(token);
}
