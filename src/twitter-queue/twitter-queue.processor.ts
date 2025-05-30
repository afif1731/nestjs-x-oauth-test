import { Process, Processor } from '@nestjs/bull';

import { Job } from 'bull';
import {
  type TweetV2HideReplyResult,
  type UserV2MuteResult,
  ApiResponseError,
} from 'twitter-api-v2';
import { TwitterService } from 'twitter/twitter.service';

import { PrismaService } from 'infra/database/prisma/prisma.service';

import { type ITwitterQueueData } from './interface';
import { TwitterQueueService } from './twitter-queue.service';

@Processor('twitter-call-queue')
export class TwitterQueueProcessor {
  constructor(
    private readonly twitterQueueService: TwitterQueueService,
    private readonly twitter: TwitterService,
    private readonly prisma: PrismaService,
  ) {}

  @Process('mute-queue')
  async processJobMuteUser(job: Job<ITwitterQueueData>) {
    const { data } = job;

    return await this.handleTwitterProcess(data, 'mute-queue');
  }

  @Process('hide-queue')
  async processJobHideTweet(job: Job<ITwitterQueueData>) {
    const { data } = job;

    return await this.handleTwitterProcess(data, 'hide-queue');
  }

  async handleTwitterProcess(
    data: ITwitterQueueData,
    job: 'mute-queue' | 'hide-queue',
  ) {
    const client = await this.twitter.createTwitterClient(data.author_id);

    let tweetApiResult: UserV2MuteResult | TweetV2HideReplyResult;

    try {
      tweetApiResult =
        job === 'mute-queue'
          ? await client.v2.mute(data.author_id, data.muted_user_id)
          : await client.v2.hideReply(data.hidden_tweet_id, true);

      if (job === 'mute-queue') {
        await this.prisma.userTwitterMuted.updateMany({
          where: {
            AND: [
              { author_id: data.author_id },
              { blocked_user_id: data.muted_user_id },
              { blocked_tweet_id: data.hidden_tweet_id },
            ],
          },
          data: {
            is_user_muted: (tweetApiResult as UserV2MuteResult).data.muting,
          },
        });
      } else if (job === 'hide-queue') {
        await this.prisma.userTwitterMuted.updateMany({
          where: {
            AND: [
              { author_id: data.author_id },
              { blocked_user_id: data.muted_user_id },
              { blocked_tweet_id: data.hidden_tweet_id },
            ],
          },
          data: {
            is_tweet_hidden: (tweetApiResult as TweetV2HideReplyResult).data
              .hidden,
          },
        });
      }
    } catch (error) {
      if (error instanceof ApiResponseError) {
        if (error.code === 429) {
          job === 'mute-queue'
            ? await this.twitterQueueService.muteTwitterUser(
                data.author_id,
                data.muted_user_id,
                data.hidden_tweet_id,
                true,
              )
            : await this.twitterQueueService.hideTwitter(
                data.author_id,
                data.muted_user_id,
                data.hidden_tweet_id,
                true,
              );
        } else {
          console.log(error);

          return;
        }
      } else {
        console.log(error);

        return;
      }
    }
  }
}
