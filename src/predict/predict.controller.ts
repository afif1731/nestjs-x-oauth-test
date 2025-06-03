import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';

import { GET_USER, JwtGuard, SuccessResponse } from 'common';

import { BatchPredictDto } from './dto';
import { PredictService } from './predict.service';

@Controller('predict')
export class PredictController {
  constructor(private readonly predictService: PredictService) {}

  @UseGuards(JwtGuard)
  @Post('')
  async batchPredict(
    @GET_USER('id') user_id: string,
    @Body(ValidationPipe) data: BatchPredictDto,
    @Query('hide') isHide: string | null,
    @Query('mute') isMute: string | null,
  ) {
    const isCleanedHide = isHide === 'true';
    const isCleanedMute = isMute === 'true';

    const result = await this.predictService.doBatchPredict(
      user_id,
      data,
      isCleanedHide,
      isCleanedMute,
    );

    return new SuccessResponse(
      HttpStatus.OK,
      'berhasil melakukan prediksi',
      result,
    );
  }
}
