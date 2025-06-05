/* eslint-disable @typescript-eslint/no-base-to-string */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { InjectQueue } from '@nestjs/bull';
import { HttpStatus, Injectable } from '@nestjs/common';

import { Queue } from 'bull';
import { ErrorResponse, TwitterConfig } from 'common';

import { type ITwitterQueueData } from './interface';

@Injectable()
export class TwitterQueueService {
  constructor(
    @InjectQueue('twitter-call-queue') private readonly twitterQueue: Queue,
  ) {}

  // Fungsi Start Job buat aktivasi bull
  async startJobMuteUser(data: ITwitterQueueData, isDelayed: boolean) {
    const job = await this.twitterQueue.add('mute-queue', data, {
      delay: isDelayed ? TwitterConfig.TWITTER_API_REQUEST_DELAY : undefined,
    });

    return { jobId: job.id };
  }

  async startJobHideReply(data: ITwitterQueueData, isDelayed: boolean) {
    const job = await this.twitterQueue.add('hide-queue', data, {
      delay: isDelayed ? TwitterConfig.TWITTER_API_REQUEST_DELAY : undefined,
    });

    return { jobId: job.id };
  }

  // Fungsi yang ini buat dipanggil di service / yang lain
  async muteTwitterUser(
    twitter_user_id: string,
    author_id: string,
    muted_user_id: string,
    hidden_tweet_id: string,
    doDelay?: boolean,
  ) {
    try {
      await this.startJobMuteUser(
        {
          twitter_user_id,
          author_id,
          muted_user_id,
          hidden_tweet_id,
        },
        doDelay === true,
      );
    } catch (error) {
      console.log(error);

      throw new ErrorResponse(
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Failed to queue tweet api: ${error}`,
      );
    }
  }

  async hideTwitter(
    twitter_user_id: string,
    author_id: string,
    muted_user_id: string,
    hidden_tweet_id: string,
    doDelay?: boolean,
  ) {
    try {
      await this.startJobHideReply(
        {
          twitter_user_id,
          author_id,
          muted_user_id,
          hidden_tweet_id,
        },
        doDelay === true,
      );
    } catch (error) {
      console.log(error);

      throw new ErrorResponse(
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Failed to send email: ${error}`,
      );
    }
  }
}
