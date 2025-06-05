import { HttpService } from '@nestjs/axios';
import { HttpStatus, Injectable } from '@nestjs/common';

import { type AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';
import { TwitterQueueService } from 'twitter-queue/twitter-queue.service';

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
    private readonly twitterQueueService: TwitterQueueService,
  ) {}

  async doBatchPredict(
    user_id: string,
    data: BatchPredictDto,
    is_hide: boolean,
    is_mute: boolean,
  ) {
    const isUserExist = await this.prisma.userTwitterData.findFirst({
      where: { id: user_id },
    });

    if (!isUserExist)
      throw new ErrorResponse(HttpStatus.NOT_FOUND, 'user tidak ditemukan');

    const prediction = await this.getPredict(data);

    const filteredPrediction = prediction.result.filter(item => {
      if (item.sh_prediction === 1 || item.hs_prediction === 1) return true;

      return false;
    });

    const result = await this.muteAndStoreTweet(
      isUserExist.twitter_user_id,
      user_id,
      filteredPrediction,
      is_hide,
      is_mute,
    );

    if (is_hide || is_mute)
      return {
        prediction: prediction,
        user_muted: prediction.result.length,
        twitter_api_result: result,
      };

    return {
      prediction: prediction,
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
    twitter_user_id: string,
    user_id: string,
    predictResult: PredictResult[],
    is_hide: boolean,
    is_mute: boolean,
  ) {
    const filteredAuthorPrediction = this.filterPrediction(predictResult);
    let invalidUserId = 0;
    let invalidTweetId = 0;

    for (const prediction of predictResult) {
      const isSimilarDataExist = await this.prisma.userTwitterMuted.findFirst({
        where: {
          AND: [
            { author_id: user_id },
            { blocked_user_id: prediction.user_id },
            { blocked_tweet_id: prediction.tweet_id },
          ],
        },
      });

      await (isSimilarDataExist
        ? this.prisma.userTwitterMuted.update({
            where: { id: isSimilarDataExist.id },
            data: {
              blocked_username: prediction.username,
              is_hate_speech: prediction.hs_prediction === 1,
              is_sexual_harassment: prediction.sh_prediction === 1,
            },
          })
        : this.prisma.userTwitterMuted.create({
            data: {
              author_id: user_id,
              blocked_user_id: prediction.user_id,
              blocked_tweet_id: prediction.tweet_id,
              blocked_username: prediction.username,
              is_hate_speech: prediction.hs_prediction === 1,
              is_sexual_harassment: prediction.sh_prediction === 1,
              is_tweet_hidden: false,
              is_user_muted: false,
            },
          }));

      if (this.isValidNumber(prediction.tweet_id) && is_hide)
        await this.twitterQueueService.hideTwitter(
          twitter_user_id,
          user_id,
          prediction.user_id,
          prediction.tweet_id,
        );
      else if (is_hide) invalidTweetId++;

      if (this.isValidNumber(prediction.user_id) && is_mute)
        await this.twitterQueueService.muteTwitterUser(
          twitter_user_id,
          user_id,
          prediction.user_id,
          prediction.tweet_id,
        );
      else if (is_mute) invalidUserId++;
    }

    return {
      hidden_reply: is_hide ? predictResult.length - invalidTweetId : 0,
      muted_user: is_mute ? filteredAuthorPrediction.length - invalidUserId : 0,
    };
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

  isValidNumber(input: string) {
    const regex = /^[0-9]{1,19}$/;

    return regex.test(input);
  }
}
