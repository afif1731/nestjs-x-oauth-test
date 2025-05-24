import {
  Body,
  Controller,
  HttpStatus,
  Post,
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
  ) {
    const result = await this.predictService.doBatchPredict(user_id, data);

    return new SuccessResponse(
      HttpStatus.OK,
      'berhasil melakukan prediksi',
      result,
    );
  }
}
