import { Module } from '@nestjs/common';

import { ManageTweetController } from './manage-tweet.controller';
import { ManageTweetService } from './manage-tweet.service';

@Module({
  controllers: [ManageTweetController],
  providers: [ManageTweetService],
})
export class ManageTweetModule {}
