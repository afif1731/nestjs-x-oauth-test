import { HttpService } from '@nestjs/axios';
import { HttpStatus, Injectable } from '@nestjs/common';

import { type AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';

import { PrismaService } from 'infra/database/prisma/prisma.service';

import {
  type PredictAPIResponse,
  type PredictResult,
  type PythonBESuccessResponse,
  ErrorResponse,
} from '../common';
import { PredictModel } from '../common/config/predict-model.config';
import { type BatchPredictDto } from './dto';

@Injectable()
export class PredictService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
  ) {}

  async doBatchPredict(data: BatchPredictDto) {
    const prediction = await this.getPredict(data);

    const filteredPrediction = this.filterPrediction(prediction.result);

    return {
      prediction: prediction,
      user_muted: filteredPrediction.length,
    };
  }

  async getPredict(tweet_data: BatchPredictDto): Promise<PredictAPIResponse> {
    try {
      const response = await firstValueFrom<
        AxiosResponse<PythonBESuccessResponse<PredictAPIResponse>>
      >(this.httpService.post(`${PredictModel.BASE_URL}/predict`, tweet_data));

      return response.data.data;
    } catch (error) {
      throw new ErrorResponse(HttpStatus.BAD_REQUEST, String(error));
    }
  }

  filterPrediction(data: PredictResult[]) {
    const seenAuthors = new Set<string>();

    return data.filter(item => {
      if (
        (item.hs_prediction === 1 || item.sh_prediction === 1) &&
        !seenAuthors.has(item.user_id)
      ) {
        seenAuthors.add(item.user_id);

        return true;
      }

      return false;
    });
  }
}
