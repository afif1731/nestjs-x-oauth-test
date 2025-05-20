import {
  Body,
  Controller,
  HttpStatus,
  Post,
  ValidationPipe,
} from '@nestjs/common';

import { SuccessResponse } from 'common';

import { BatchPredictDto } from './dto';
import { PredictService } from './predict.service';

@Controller('predict')
export class PredictController {
  constructor(private readonly predictService: PredictService) {}

  @Post('')
  async batchPredict(@Body(ValidationPipe) data: BatchPredictDto) {
    const result = await this.predictService.doBatchPredict(data);

    return new SuccessResponse(
      HttpStatus.OK,
      'berhasil melakukan prediksi',
      result,
    );
  }
}
