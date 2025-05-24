import { HttpService } from '@nestjs/axios';
import { HttpStatus, Injectable } from '@nestjs/common';

import { type AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';
import { type TwitterApi } from 'twitter-api-v2';
import { TwitterService } from 'twitter/twitter.service';

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
    private readonly twitter: TwitterService,
  ) {}

  async doBatchPredict(user_id: string, data: BatchPredictDto) {
    const client = await this.twitter.createTwitterClient(user_id);

    const prediction = await this.getPredict(data);

    const filteredPrediction = this.filterPrediction(prediction.result);

    await this.muteAndStoreTweet(user_id, filteredPrediction, client);

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

  async muteAndStoreTweet(
    user_id: string,
    predictResult: PredictResult[],
    twitter_client: TwitterApi,
  ) {
    for (const prediction of predictResult) {
      await this.prisma.userTwitterMuted.create({
        data: {
          author_id: user_id,
          blocked_user_id: prediction.user_id,
          blocked_tweet_id: prediction.tweet_id,
          blocked_username: prediction.username,
          is_hate_speech: prediction.hs_prediction === 1,
          is_sexual_harassment: prediction.sh_prediction === 1,
        },
      });

      // TODO: connect to twitter API
    }

    // Cuma mocking aja, cek client bisa jalan atau nda
    await twitter_client.v2.me();
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
