import { Controller } from '@nestjs/common';

import { ManageTweetService } from './manage-tweet.service';

@Controller('manage-tweet')
export class ManageTweetController {
  constructor(private readonly manageTweetService: ManageTweetService) {}

  // @Get('sentiment')
  // async getTweetSentiment(@Query('ids') ids: string) {
  //   if (!ids || ids === '')
  //     throw new ErrorResponse(HttpStatus.BAD_REQUEST, 'id(s) required');

  // }
}
