import { CacheInterceptor } from '@nestjs/cache-manager';
import {
  Controller,
  Get,
  HttpStatus,
  Query,
  UseInterceptors,
} from '@nestjs/common';

import { ErrorResponse, SuccessResponse } from 'common';

import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // @Post('login')
  // async login(@Body(ValidationPipe) data: LoginDto) {
  //   const token = await this.authService.login(data);

  //   return new SuccessResponse(HttpStatus.OK, 'login successfully', token);
  // }

  // @Post('register')
  // async register(@Body(ValidationPipe) data: RegisterDto) {
  //   const result = await this.authService.register(data);

  //   return new SuccessResponse(
  //     HttpStatus.CREATED,
  //     'register successfully',
  //     result,
  //   );
  // }

  @Get('twitter-login')
  @UseInterceptors(CacheInterceptor)
  async loginTwitter() {
    const result = await this.authService.twitterLogin();

    return new SuccessResponse(HttpStatus.OK, 'url generated', result);
  }

  @Get('twitter-callback')
  @UseInterceptors(CacheInterceptor)
  async callbackTwitter(
    @Query('state') state: string,
    @Query('code') code: string,
    @Query('cache_id') cache_id: string,
  ) {
    if (!cache_id)
      throw new ErrorResponse(HttpStatus.BAD_REQUEST, 'cache_id required');
    if (!state || !code)
      throw new ErrorResponse(
        HttpStatus.BAD_REQUEST,
        'You denied the app or your session expired!',
      );

    const result = await this.authService.twitterCallback(
      state,
      code,
      cache_id,
    );

    return new SuccessResponse(HttpStatus.OK, 'twitter login success', result);
  }

  // @Get('me')
  // @ROLES('ADMIN', 'USER')
  // @UseGuards(JwtGuard, RolesGuard)
  // async getMe(
  //   @GET_USER('id') user_id: string,
  //   @GET_USER('role') user_role: Role,
  // ) {
  //   const result = await this.authService.me(user_id, user_role);

  //   return new SuccessResponse(
  //     HttpStatus.OK,
  //     'get user data successfully',
  //     result,
  //   );
  // }
}
