import { type ExecutionContext, createParamDecorator } from '@nestjs/common';

export const GET_USER = createParamDecorator(
  (
    data: 'id' | 'twitter_user_id' | 'twitter_username' | undefined,
    context: ExecutionContext,
  ) => {
    const request = context.switchToHttp().getRequest();

    if (data) {
      return request.user[data];
    }

    return request.user;
  },
);
