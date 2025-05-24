import { CacheInterceptor } from '@nestjs/cache-manager';
import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Query,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';

import { ErrorResponse, SuccessResponse } from 'common';

import { AuthService } from './auth.service';
import { RefreshBackendTokenDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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

  @Post('refresh-backend-token')
  async refreshBackendToken(
    @Body(ValidationPipe) data: RefreshBackendTokenDto,
  ) {
    const result = await this.authService.refreshBackendToken(
      data.backend_token,
    );

    return new SuccessResponse(HttpStatus.OK, 'Getting new token', result);
  }
}
