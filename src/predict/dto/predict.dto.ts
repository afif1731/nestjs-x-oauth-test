/* eslint-disable @darraghor/nestjs-typed/all-properties-are-whitelisted */
/* eslint-disable @darraghor/nestjs-typed/all-properties-have-explicit-defined */
/* eslint-disable @darraghor/nestjs-typed/validated-non-primitive-property-needs-type-decorator */
import { IsDefined } from 'class-validator';
import { IsStringDefined, TransformToDtoArray } from 'common';

export class PredictDto {
  @IsStringDefined()
  tweet_id: string;

  @IsStringDefined()
  tweet_text: string;

  @IsStringDefined()
  user_id: string;

  @IsStringDefined()
  username: string;
}

export class BatchPredictDto {
  @IsDefined()
  @TransformToDtoArray(PredictDto)
  tweet_data: PredictDto[];
}
